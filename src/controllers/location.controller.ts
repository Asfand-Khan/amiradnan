import { Request, Response } from "express";
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
import { catchAsync } from "../utils/catchAsync.js";

export class LocationController {
  private locationService: LocationService;

  constructor() {
    this.locationService = new LocationService();
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const body: CreateLocationInput = req.body;
    const location = await this.locationService.createLocation(body);
    ResponseUtil.success(res, location, "Location created successfully", 201);
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const { locationId }: GetLocationInput = req.body;
    const location = await this.locationService.getLocationById(locationId);
    ResponseUtil.success(res, location);
  });

  getAll = catchAsync(async (req: Request, res: Response) => {
    const query: ListLocationsInput = req.query;
    const locations = await this.locationService.getAllLocations({
      city: query.city,
      search: query.search,
    });
    ResponseUtil.success(res, locations);
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const { locationId, ...updateData }: UpdateLocationInput = req.body;
    const location = await this.locationService.updateLocation(
      locationId,
      updateData
    );
    ResponseUtil.success(res, location, "Location updated successfully");
  });

  delete = catchAsync(async (req: Request, res: Response) => {
    const { locationId }: DeleteLocationInput = req.body;
    await this.locationService.deleteLocation(locationId);
    ResponseUtil.success(res, null, "Location deleted successfully");
  });

  getStats = catchAsync(async (req: Request, res: Response) => {
    const { locationId }: GetLocationInput = req.body;
    const stats = await this.locationService.getLocationStats(locationId);
    ResponseUtil.success(res, stats);
  });

  getByCity = catchAsync(async (req: Request, res: Response) => {
    const { city } = req.query;

    if (!city || typeof city !== "string") {
      throw new AppError("City parameter is required");
    }

    const locations = await this.locationService.getLocationsByCity(city);
    ResponseUtil.success(res, locations);
  });

  search = catchAsync(async (req: Request, res: Response) => {
    const { search } = req.query;

    if (!search || typeof search !== "string") {
      throw new AppError("Search parameter is required");
    }

    const locations = await this.locationService.searchLocations(search);
    ResponseUtil.success(res, locations);
  });

  getUsers = catchAsync(async (req: Request, res: Response) => {
    const { locationId }: GetLocationInput = req.body;
    const users = await this.locationService.getLocationUsers(locationId);
    ResponseUtil.success(res, users);
  });
}
