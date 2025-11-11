import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const saveBase64Image = async (
  base64Image: string,
  folder: string = ""
): Promise<string> => {
  const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image format");
  }

  const ext = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, "base64");

  const uploadsDir = path.join(process.cwd(), "uploads");
  const targetDir = folder ? path.join(uploadsDir, folder) : uploadsDir;

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filename = `${uuidv4()}.${ext}`;
  const filepath = path.join(targetDir, filename);

  await fs.promises.writeFile(filepath, buffer);

  const relativePath = `/uploads${folder ? "/" + folder : ""}/${filename}`;
  return relativePath.replace(/\\/g, "/");
};
