import { Request, Response, NextFunction } from "express";
import { LocationService } from "../services/location.service.js";
import {
  CreateLocationInput,
  DeleteLocationInput,
  GetLocationInput,
  ListLocationsInput,
  UpdateLocationInput,
} from "../validations/location.validations.js";
import { ResponseUtil } from "../utils/response.util.js";
import { AppError } from "../middleware/error.middleware.js";

export class LocationController {
  private locationService: LocationService;

  constructor() {
    this.locationService = new LocationService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: CreateLocationInput = req.body;
      const location = await this.locationService.createLocation(body);
      ResponseUtil.success(res, location, "Location created successfully", 201);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId }: GetLocationInput = req.body;
      const location = await this.locationService.getLocationById(locationId);
      ResponseUtil.success(res, location);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: ListLocationsInput = req.query;
      const locations = await this.locationService.getAllLocations({
        city: query.city,
        search: query.search,
      });
      ResponseUtil.success(res, locations);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId, ...updateData }: UpdateLocationInput = req.body;
      const location = await this.locationService.updateLocation(
        locationId,
        updateData
      );
      ResponseUtil.success(res, location, "Location updated successfully");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId }: DeleteLocationInput = req.body;
      await this.locationService.deleteLocation(locationId);
      ResponseUtil.success(res, null, "Location deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId }: GetLocationInput = req.body;
      const stats = await this.locationService.getLocationStats(locationId);
      ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  };

  getByCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { city } = req.query;

      if (!city || typeof city !== "string") {
        throw new AppError("City parameter is required");
      }

      const locations = await this.locationService.getLocationsByCity(city);
      ResponseUtil.success(res, locations);
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;

      if (!search || typeof search !== "string") {
        throw new AppError("Search parameter is required");
      }

      const locations = await this.locationService.searchLocations(search);
      ResponseUtil.success(res, locations);
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId }: GetLocationInput = req.body;
      const users = await this.locationService.getLocationUsers(locationId);
      ResponseUtil.success(res, users);
    } catch (error) {
      next(error);
    }
  };
}
