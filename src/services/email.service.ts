import { config, mg } from "../config/environment.js";

export class EmailService {
  constructor() {}

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.server.url}/reset-password?token=${token}`;
    const domain = config.mailGun.domain;

    const data = {
      from: config.email.from,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #007bff; word-break: break-all;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await mg.messages.create(domain, data);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    const domain = config.mailGun.domain;

    const data = {
      from: config.email.from,
      to: email,
      subject: "Welcome to Amir Adnan!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: normal;">Welcome to Amir Adnan</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Dear ${fullName},</h2>
            <p style="color: #555; line-height: 1.6;">Thank you for joining the Amir Adnan family. We are delighted to welcome you to a world of exquisite craftsmanship, timeless elegance, and unparalleled style.</p>
            <p style="color: #555; line-height: 1.6;">Prepare to discover our latest collections, exclusive designs, and everything that defines the Amir Adnan experience.</p>
            <p style="text-align: center; margin-top: 30px;">
              <a href="https://amiradnan.com/" style="display: inline-block; padding: 12px 25px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Our Collection</a>
            </p>
            <p style="color: #777; font-size: 13px; margin-top: 40px; text-align: center;">For any inquiries, please do not hesitate to contact our customer service team.</p>
          </div>
        </div>
      `,
    };

    try {
      await mg.messages.create(domain, data);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error("Error sending welcome email:", error);
      // Don't throw error for welcome email failure
    }
  }
}
