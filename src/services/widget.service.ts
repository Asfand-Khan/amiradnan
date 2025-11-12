import { FontColor, Widget } from "@prisma/client";
import { WidgetRepository } from "../repositories/widget.repository.js";
import { saveBase64Image } from "../utils/file.util.js";
import { AppError } from "../middleware/error.middleware.js";
import { UpdateWidget } from "../validations/widget.validations.js";

export class WidgetService {
  private widgetRepository: WidgetRepository;

  constructor() {
    this.widgetRepository = new WidgetRepository();
  }

  async create(
    title: string,
    subTitle: string,
    image: string,
    fontColor: FontColor,
    byDefault: boolean
  ): Promise<Widget> {
    const byDefaultExists = await this.widgetRepository.findByDefault();

    if (byDefaultExists && byDefault) {
      throw new AppError("By default already exists");
    }

    image = await saveBase64Image(image, "widgets");
    const widget = await this.widgetRepository.create(
      title,
      subTitle,
      image,
      fontColor,
      byDefault
    );
    return widget;
  }

  async getAll(): Promise<Widget[]> {
    return await this.widgetRepository.findAll();
  }

  async getById(id: number): Promise<Widget | null> {
    return await this.widgetRepository.findById(id);
  }

  async update(widgetData: UpdateWidget) {
    const widget = await this.widgetRepository.findById(widgetData.widgetId);
    if (!widget) throw new Error("Widget not found");

    return await this.widgetRepository.update(widgetData);
  }

  async toggleActive(id: number) {
    const widget = await this.widgetRepository.findById(id);
    if (!widget) throw new Error("Widget not found");

    const newStatus = widget.active === true ? false : true;
    return await this.widgetRepository.update({
      active: newStatus,
      widgetId: id,
    });
  }

  async delete(id: number) {
    const widget = await this.widgetRepository.findById(id);
    if (!widget) throw new Error("Widget not found");

    return await this.widgetRepository.delete(id);
  }
}
