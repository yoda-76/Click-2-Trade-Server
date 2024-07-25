import { GetAccessToken } from "../service/upstox-auth.service";
import { Request, Response } from "express";


export const upstoxAuth = async (req: Request, res: Response) => {
  const authcode = req.query.code as string;
  const email = req.query.state as string;
  const user = await GetAccessToken(email, authcode);
  if (user) {
    console.log("data added");
    res.status(201).json({
      message: "Access token saved successfully",
      success: true,
    });
  }
};