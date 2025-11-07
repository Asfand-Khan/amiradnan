import { NextFunction, Request, Response } from "express";
import { WidgetService } from "../services/widget.service.js";
import { CreateWidget } from "../validations/widget.validations.js";

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
      const defaultValue = body.byDefault ? 1 : 0;
      const widget = await this.widgetService.create(
        body.title,
        body.subTitle,
        body.image,
        body.fontColor,
        defaultValue
      );
      res.status(201).json({ success: true, data: widget });
    } catch (err) {
      next(err);
    }
  };
}
