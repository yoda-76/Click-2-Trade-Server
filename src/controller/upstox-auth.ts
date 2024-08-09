import { GetAccessToken } from "../service/upstox-auth.service";
import { Request, Response } from "express";


export const upstoxAuth = async (req: Request, res: Response) => {
  const authcode = req.query.code as string;
  const id = req.query.state as string;
  console.log(authcode, id);
  const user = await GetAccessToken(id, authcode);
  if (user) {
    console.log("data added");
    res.status(201).json({
      message: "Access token saved successfully",
      success: true,
    });
  }
};