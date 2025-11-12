import { FontColor, Widget } from "@prisma/client";
import { WidgetRepository } from "../repositories/widget.repository.js";
import { saveBase64Image } from "../utils/file.util.js";

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
    byDefault: 0 | 1
  ): Promise<Widget> {
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
}
