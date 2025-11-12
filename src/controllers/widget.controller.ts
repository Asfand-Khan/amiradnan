import { NextFunction, Request, Response } from "express";
import { WidgetService } from "../services/widget.service.js";
import {
  CreateWidget,
  SingleWidget,
  UpdateWidget,
} from "../validations/widget.validations.js";
import { ResponseUtil } from "../utils/response.util.js";

export class WidgetController {
  private widgetService: WidgetService;

  constructor() {
    this.widgetService = new WidgetService();
  }

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: CreateWidget = req.body;
      const widget = await this.widgetService.create(
        body.title,
        body.subTitle,
        body.image,
        body.fontColor,
        body.byDefault
      );
      ResponseUtil.success(res, widget, "Widget created successfully");
    } catch (err) {
      next(err);
    }
  };

  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const widgets = await this.widgetService.getAll();
      ResponseUtil.success(res, widgets, "Widgets retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: SingleWidget = req.body;
      const widgets = await this.widgetService.getById(body.widgetId);
      ResponseUtil.success(res, widgets, "Single widget retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: UpdateWidget = req.body;
      const widgets = await this.widgetService.update(body);
      ResponseUtil.success(res, widgets, "Widget updated successfully");
    } catch (err) {
      next(err);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: SingleWidget = req.body;
      const widgets = await this.widgetService.delete(body.widgetId);
      ResponseUtil.success(res, widgets, "Widget deleted successfully");
    } catch (err) {
      next(err);
    }
  };

  toggleActive = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: SingleWidget = req.body;
      const widgets = await this.widgetService.toggleActive(body.widgetId);
      ResponseUtil.success(res, widgets, "Widget active status toggle successfully");
    } catch (err) {
      next(err);
    }
  };
}
