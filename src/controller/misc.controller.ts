import { Request, Response } from "express";
import { promises as fs } from "fs";
import { join } from "path";
// const Redis = require("ioredis")
import Redis from "ioredis";
const client = new Redis("redis://localhost:6379");


export const getStructuredOptionsData = async (req: Request, res: Response) => {
  try {
    // Read data from "../token_data/structured_options_data.json"
    const resp = await client.get("structuredData")
    // console.log("parsed resp", JSON.parse(resp));
    // const filePath = join(__dirname, "../token_data/structured_options_data.json");
    // const data = await fs.readFile(filePath, "utf-8");
    // const jsonData = JSON.parse(data);
    // console.log("object");
    res.json({ message: "ok", data: JSON.parse(resp) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to read data", error });
  }
};
