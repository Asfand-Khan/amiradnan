import { CustomerRepository } from "../repositories/customer.repository.js";
import { AppError } from "../middleware/error.middleware.js";
import { Customer } from "@prisma/client";
import {
  CreateCustomerMeasurement,
  UpdateCustomer,
} from "../validations/customer.validaions.js";
import { UserListQuery } from "../types/index.js";
import { hashPassword } from "../utils/password.util.js";
import { saveBase64Image } from "../utils/file.util.js";

export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor() {
    this.customerRepository = new CustomerRepository();
  }

  async getProfile(userId: number) {
    const customer = await this.customerRepository.findById(userId);
    if (!customer) {
      throw new AppError("User not found", 404);
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      gender: customer.gender,
      profileCompleted: customer.profileCompleted,
      profileImage: customer.profileImage,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  async updateProfile(userId: number, data: UpdateCustomer) {
    let password;
    let image;
    if (data.password) {
      password = await hashPassword(data.password);
    }

    if (data.image) {
      image = await saveBase64Image(data.image, "customers");
    }

    const customer = await this.customerRepository.update(userId, {
      ...data,
      password,
      image,
    });

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      gender: customer.gender,
      profileCompleted: customer.profileCompleted,
      profileImage: customer.profileImage,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  async getCustomerById(userId: number) {
    const customer = await this.customerRepository.findById(userId);
    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      gender: customer.gender,
      profileCompleted: customer.profileCompleted,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  async getAllCustomers(query: UserListQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const { customers, total } = await this.customerRepository.findAll(
      page,
      limit,
      query.search
    );

    const items: Partial<Customer>[] = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      gender: customer.gender,
      profileCompleted: customer.profileCompleted,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async createMeasurement(userId: number, data: CreateCustomerMeasurement) {
    const measurements = await this.customerRepository.createMeasurement(
      userId,
      data
    );
    if (!measurements) {
      throw new AppError("Measurements not found", 404);
    }

    if (
      measurements &&
      measurements.length !== null &&
      measurements.width !== null &&
      measurements.waist !== null &&
      measurements.hip !== null
    ) {
      this.customerRepository.updateProfileCompleted(measurements.customerId);
    }

    return {
      customer_id: measurements.customerId,
      hip: measurements.hip,
      length: measurements.length,
      waist: measurements.waist,
      width: measurements.width,
      createdAt: measurements.createdAt,
      updatedAt: measurements.updatedAt,
    };
  }

  async getMeasurementsByCustomerId(userId: number) {
    const measurements =
      await this.customerRepository.findMeasurementsByCustomerId(userId);

    if (!measurements) {
      throw new AppError("Measurements not found", 404);
    }

    return {
      customer_id: measurements.customerId,
      hip: measurements.hip,
      length: measurements.length,
      waist: measurements.waist,
      width: measurements.width,
      createdAt: measurements.createdAt,
      updatedAt: measurements.updatedAt,
    };
  }

  async updateMeasurement(
    userId: number,
    data: Partial<CreateCustomerMeasurement>
  ) {
    const measurements =
      await this.customerRepository.findMeasurementsByCustomerId(userId);

    if (!measurements) {
      throw new AppError("Measurements not found", 404);
    }

    const updated = await this.customerRepository.updateMeasurement(
      measurements.id,
      data
    );

    if (
      updated &&
      updated.length !== null &&
      updated.width !== null &&
      updated.waist !== null &&
      updated.hip !== null
    ) {
      this.customerRepository.updateProfileCompleted(updated.customerId);
    }

    return {
      customer_id: updated?.customerId,
      hip: updated?.hip,
      length: updated?.length,
      waist: updated?.waist,
      width: updated?.width,
      createdAt: updated?.createdAt,
      updatedAt: updated?.updatedAt,
    };
  }

  async updateProfileCompleted(customerId: number) {
    return await this.customerRepository.updateProfileCompleted(customerId);
  }
}
