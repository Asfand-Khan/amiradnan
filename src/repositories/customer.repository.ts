import prisma from "../config/database.js";
import {
  CreateCustomer,
  CreateCustomerMeasurement,
  UpdateCustomer,
} from "../validations/customer.validaions.js";
import { Customer, CustomerMeasurement, Gender, Prisma } from "@prisma/client";

export class CustomerRepository {
  private repository = prisma.customer;
  private measurementRepository = prisma.customerMeasurement;

  async create(userData: CreateCustomer): Promise<Customer> {
    const user = await this.repository.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        city: userData.city,
        address: userData.address,
        gender: userData.gender as Gender,
      },
    });
    return user;
  }

  async findById(id: number): Promise<Customer | null> {
    return await this.repository.findUnique({ where: { id } });
  }

  async findByIdWithPassword(id: number): Promise<Customer | null> {
    return await this.repository.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return await this.repository.findUnique({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<Customer | null> {
    return await this.repository.findUnique({ where: { email } });
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<{ customers: Customer[]; total: number }> {
    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.repository.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.repository.count({ where }),
    ]);

    return { customers, total };
  }

  async update(id: number, userData: UpdateCustomer): Promise<Customer | null> {
    const updated = await this.repository.update({
      where: { id },
      data: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        city: userData.city,
        address: userData.address,
        gender: userData.gender as Gender,
        profileImage: userData.image,
      },
    });
    return updated;
  }

  async updateProfileCompleted(id: number): Promise<Customer | null> {
    const updated = await this.repository.update({
      where: { id },
      data: {
        profileCompleted: 1,
      },
    });
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ where: { id } });
  }

  async setResetToken(
    id: number,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await this.repository.update({
      where: { id },
      data: {
        resetToken: token,
        resetTokenExpires: expiresAt,
      },
    });
  }

  async findByResetToken(token: string): Promise<Customer | null> {
    return await this.repository.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(), // only valid tokens
        },
      },
    });
  }

  async clearResetToken(id: number): Promise<void> {
    await this.repository.update({
      where: { id },
      data: {
        resetToken: null,
        resetTokenExpires: null,
      },
    });
  }

  async createMeasurement(
    id: number,
    userData: CreateCustomerMeasurement
  ): Promise<CustomerMeasurement | null> {
    const updated = await this.measurementRepository.create({
      data: {
        customerId: id,
        hip: userData.hip,
        length: userData.length,
        waist: userData.waist,
        width: userData.width,
      },
    });
    return updated;
  }

  async findMeasurementsByCustomerId(
    id: number
  ): Promise<CustomerMeasurement | null> {
    return await this.measurementRepository.findFirst({
      where: { customerId: id },
    });
  }

  async findMeasurementsById(id: number): Promise<CustomerMeasurement | null> {
    return await this.measurementRepository.findUnique({
      where: { id },
    });
  }

  async updateMeasurement(
    id: number,
    userData: Partial<CreateCustomerMeasurement>
  ): Promise<CustomerMeasurement | null> {
    const updated = await this.measurementRepository.update({
      where: {
        id,
      },
      data: {
        hip: userData.hip,
        length: userData.length,
        waist: userData.waist,
        width: userData.width,
      },
    });
    return updated;
  }
}
