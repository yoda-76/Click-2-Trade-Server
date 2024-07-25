import { Request, Response } from "express";
import { promises as fs } from "fs";
import { join } from "path";

export const getStructuredOptionsData = async (req: Request, res: Response) => {
  try {
    // Read data from "../token_data/structured_options_data.json"
    const filePath = join(__dirname, "../token_data/structured_options_data.json");
    const data = await fs.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(data);

    res.json({ message: "ok", data: jsonData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to read data", error });
  }
};
