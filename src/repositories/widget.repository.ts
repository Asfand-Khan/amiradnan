import { FontColor, Widget } from "@prisma/client";
import prisma from "../config/database.js";
import { UpdateWidget } from "../validations/widget.validations.js";

export class WidgetRepository {
  private repository = prisma.widget;

  async create(
    title: string,
    subTitle: string,
    image: string,
    fontColor: FontColor,
    byDefault: boolean
  ): Promise<Widget> {
    return await this.repository.create({
      data: {
        title,
        subTitle,
        image,
        fontColor,
        default: byDefault,
      },
    });
  }

  async findById(id: number): Promise<Widget | null> {
    return await this.repository.findUnique({ where: { id } });
  }

  async findAll(): Promise<Widget[]> {
    return await this.repository.findMany({
      where: { isDeleted: false },
    });
  }

  async findByDefault(): Promise<Widget | null> {
    return await this.repository.findFirst({
      where: {
        default: true,
        isDeleted: false,
      },
    });
  }

  async update(widgetData: UpdateWidget): Promise<Widget> {
    return await this.repository.update({
      where: {
        id: widgetData.widgetId,
      },
      data: {
        title: widgetData.title,
        subTitle: widgetData.subTitle,
        image: widgetData.image,
        fontColor: widgetData.fontColor,
        default: widgetData.byDefault,
      },
    });
  }

  async delete(id: number): Promise<Widget> {
    return await this.repository.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }
}
