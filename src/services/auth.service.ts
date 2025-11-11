import { CustomerRepository } from "../repositories/customer.repository.js";
import { RefreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { EmailService } from "./email.service.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util.js";
import { AppError } from "../middleware/error.middleware.js";
import {
  CreateCustomer,
  LoginCustomer,
  SetPassword,
} from "../validations/customer.validaions.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
import config from "../config/environment.js";

const googleClient = new OAuth2Client(config.google.clientId);

export class AuthService {
  private customerRepository: CustomerRepository;
  private refreshTokenRepository: RefreshTokenRepository;
  private emailService: EmailService;

  constructor() {
    this.customerRepository = new CustomerRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
    this.emailService = new EmailService();
  }

  async register(data: CreateCustomer) {
    // Check if user already exists
    const existingCustomer = await this.customerRepository.findByEmail(
      data.email
    );
    if (existingCustomer) {
      throw new AppError("Email already registered", 409);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create customer
    const customer = await this.customerRepository.create({
      name: data.name,
      email: data.email,
      password: passwordHash,
      phone: data.phone,
      city: data.city,
      address: data.address,
      gender: data.gender,
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: customer.id,
      email: customer.email,
    });
    const refreshToken = generateRefreshToken({
      id: customer.id,
      email: customer.email,
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 15);
    await this.refreshTokenRepository.create(
      refreshToken,
      expiresAt,
      undefined,
      customer.id
    );

    // Send welcome email (async, don't wait)
    this.emailService
      .sendWelcomeEmail(customer.email, customer.name)
      .catch(console.error);

    return {
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        address: customer.address,
        gender: customer.gender,
        profileImage: customer.profileImage,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async login(data: LoginCustomer) {
    // Find user with password
    const customer = await this.customerRepository.findByEmailWithPassword(
      data.email
    );
    if (!customer) {
      throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      data.password,
      customer.password
    );
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: customer.id,
      email: customer.email,
    });
    const refreshToken = generateRefreshToken({
      id: customer.id,
      email: customer.email,
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.refreshTokenRepository.create(
      refreshToken,
      expiresAt,
      undefined,
      customer.id
    );

    return {
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        gender: customer.gender,
        address: customer.address,
        city: customer.city,
        profileImage: customer.profileImage,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError("Invalid refresh token", 401);
    }

    // Check if token exists in database
    const storedToken = await this.refreshTokenRepository.findByToken(
      refreshToken
    );
    if (!storedToken) {
      throw new AppError("Refresh token not found", 401);
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.deleteByToken(refreshToken);
      throw new AppError("Refresh token expired", 401);
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
    });

    return {
      access_token: accessToken,
    };
  }

  async forgotPassword(email: string) {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      // Don't reveal if email exists
      return { message: "If email exists, reset link has been sent" };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Store reset token
    await this.customerRepository.setResetToken(
      customer.id,
      resetToken,
      expiresAt
    );

    // Send reset email
    await this.emailService.sendPasswordResetEmail(customer.email, resetToken);

    return { message: "If email exists, reset link has been sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    // Find user by reset token
    const user = await this.customerRepository.findByResetToken(token);
    if (!user) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await this.customerRepository.update(user.id, { password: passwordHash });
    await this.customerRepository.clearResetToken(user.id);

    // Invalidate all refresh tokens
    await this.refreshTokenRepository.deleteByUserId(user.id);

    return { message: "Password reset successful" };
  }

  async logout(refreshToken: string) {
    await this.refreshTokenRepository.deleteByToken(refreshToken);
    return { message: "Logged out successfully" };
  }

  async googleLogin(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new AppError("Invalid Google token", 401);

    const { email, name } = payload;

    if (!email) throw new AppError("Email not available from Google", 400);

    // Check if customer already exists
    let customer = await this.customerRepository.findByEmail(email);

    // If new user, create account
    if (!customer) {
      customer = await this.customerRepository.create({
        name: name || "Google User",
        email,
        password: "", // no password for Google login
        phone: "",
        city: "",
        address: "",
        gender: "other",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: customer.id,
      email: customer.email,
    });
    const refreshToken = generateRefreshToken({
      id: customer.id,
      email: customer.email,
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.refreshTokenRepository.create(
      refreshToken,
      expiresAt,
      undefined,
      customer.id
    );

    // Send welcome email (async, don't wait)
    this.emailService
      .sendWelcomeEmail(customer.email, customer.name)
      .catch(console.error);

    return {
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        gender: customer.gender,
        address: customer.address,
        city: customer.city,
        password: customer.password,
        profileImage: customer.profileImage,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async setPassword(data: SetPassword) {
    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Set password
    await this.customerRepository.update(data.customerId, {
      password: passwordHash,
    });

    return { message: "Password set successfully" };
  }
}
