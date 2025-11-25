import { Request, Response } from "express";
import { WidgetService } from "../services/widget.service.js";
import {
  CreateWidget,
  SingleWidget,
  UpdateWidget,
} from "../validations/widget.validations.js";
import { ResponseUtil } from "../utils/response.util.js";
import { catchAsync } from "../utils/catchAsync.js";

export class WidgetController {
  private widgetService: WidgetService;

  constructor() {
    this.widgetService = new WidgetService();
  }

  create = catchAsync(async (req: Request, res: Response) => {
    const body: CreateWidget = req.body;
    const widget = await this.widgetService.create(
      body.title,
      body.subTitle,
      body.image,
      body.fontColor,
      body.byDefault
    );
    ResponseUtil.success(res, widget, "Widget created successfully");
  });

  getAll = catchAsync(async (_req: Request, res: Response) => {
    const widgets = await this.widgetService.getAll();
    ResponseUtil.success(res, widgets, "Widgets retrieved successfully");
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const body: SingleWidget = req.body;
    const widgets = await this.widgetService.getById(body.widgetId);
    ResponseUtil.success(res, widgets, "Single widget retrieved successfully");
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const body: UpdateWidget = req.body;
    const widgets = await this.widgetService.update(body);
    ResponseUtil.success(res, widgets, "Widget updated successfully");
  });

  delete = catchAsync(async (req: Request, res: Response) => {
    const body: SingleWidget = req.body;
    const widgets = await this.widgetService.delete(body.widgetId);
    ResponseUtil.success(res, widgets, "Widget deleted successfully");
  });

  toggleActive = catchAsync(async (req: Request, res: Response) => {
    const body: SingleWidget = req.body;
    const widgets = await this.widgetService.toggleActive(body.widgetId);
    ResponseUtil.success(
      res,
      widgets,
      "Widget active status toggle successfully"
    );
  });
}
