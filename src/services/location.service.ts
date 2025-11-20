// src/services/location.service.ts
import { Location, Prisma } from "@prisma/client";
import { AppError } from "../middleware/error.middleware.js";
import { LocationRepository } from "../repositories/location.repository.js";

export class LocationService {
  private locationRepository: LocationRepository;

  constructor() {
    this.locationRepository = new LocationRepository();
  }

  async createLocation(data: {
    name: string;
    address?: string;
    city?: string;
    phone?: string;
  }): Promise<Location> {
    // Check if location with same name already exists
    const existingLocation = await this.locationRepository.findByName(
      data.name
    );

    if (existingLocation) {
      throw new AppError("A location with this name already exists", 409);
    }

    const locationData: Prisma.LocationCreateInput = {
      name: data.name,
      address: data.address,
      city: data.city,
      phone: data.phone,
    };

    return await this.locationRepository.create(locationData);
  }

  async getLocationById(id: number): Promise<any> {
    const location = await this.locationRepository.findById(id);

    if (!location) {
      throw new AppError("Location not found", 404);
    }

    return location;
  }

  async getAllLocations(params: {
    city?: string;
    search?: string;
  }): Promise<Location[]> {
    const where: Prisma.LocationWhereInput = {};

    if (params.city) {
      where.city = {
        contains: params.city,
      };
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { address: { contains: params.search } },
        { city: { contains: params.search } },
      ];
    }

    return await this.locationRepository.findAll(where);
  }

  async updateLocation(
    id: number,
    data: Partial<{
      name: string;
      address?: string;
      city?: string;
      phone?: string;
    }>
  ): Promise<Location> {
    // Check if location exists
    await this.getLocationById(id);

    // If updating name, check for duplicates
    if (data.name) {
      const existingLocation = await this.locationRepository.findByName(
        data.name
      );

      if (existingLocation && existingLocation.id !== id) {
        throw new AppError("A location with this name already exists", 409);
      }
    }

    const updateData: Prisma.LocationUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.phone !== undefined) updateData.phone = data.phone;

    return await this.locationRepository.update(id, updateData);
  }

  async deleteLocation(id: number): Promise<Location> {
    // Check if location exists
    await this.getLocationById(id);

    // Check if location has associated users
    const stats = await this.locationRepository.getLocationStats(id);

    if (stats.userCount > 0) {
      throw new AppError(
        "Cannot delete location with assigned users. Please reassign users first.",
        400
      );
    }

    if (stats.transactionCount > 0 || stats.redemptionCount > 0) {
      throw new AppError(
        "Cannot delete location with transaction history.",
        400
      );
    }

    return await this.locationRepository.delete(id);
  }

  async getLocationStats(id: number) {
    await this.getLocationById(id);
    return await this.locationRepository.getLocationStats(id);
  }

  async getLocationsByCity(city: string): Promise<Location[]> {
    return await this.locationRepository.findByCity(city);
  }

  async searchLocations(searchTerm: string): Promise<Location[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new AppError("Search term is required", 400);
    }

    return await this.locationRepository.searchLocations(searchTerm);
  }

  async getLocationUsers(id: number) {
    const location = await this.getLocationById(id);
    return location.shopUsers || [];
  }
}