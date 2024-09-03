import { ChildAccount, MasterAccount } from "@prisma/client";
import { prisma } from "../lib/db";

import axios from "axios";
import { resolve } from "path";
import { response } from "express";
// import { Request, Response, NextFunction } from "express";
// import User from "../Models/UserModel";

interface User {
  email: string;
  key: string;
  secret: string;
  data?: any;
  lastTokenGeneratedAt?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public location: string
  ) {
    super(message);
  }
}

function extractId(input: string): {
  type: "MASTER" | "CHILD" | null;
  id: string | null;
} {
  const masterRegex = /^MASTER:([a-zA-Z0-9]+)$/;
  const childRegex = /^CHILD:([a-zA-Z0-9]+)$/;

  let match = input.match(masterRegex);
  if (match) {
    return { type: "MASTER", id: match[1] };
  }

  match = input.match(childRegex);
  if (match) {
    return { type: "CHILD", id: match[1] };
  }

  return { type: null, id: null };
}
export const GetAccessToken = async (
  id: string,
  authcode: string
): Promise<MasterAccount | ChildAccount | void> => {
  try {
    const currentdate = new Date();
    const acc = extractId(id);
    let userData: MasterAccount | ChildAccount;
    if (acc.type === "CHILD") {
      userData = await prisma.childAccount.findUnique({
        where: { id: acc.id },
      });
    } else if (acc.type === "MASTER") {
      userData = await prisma.masterAccount.findUnique({
        where: { id: acc.id },
      });
    } else {
      throw new ApiError(
        500,
        "error authorizing with upstox",
        ".Controllers/Authorization: GetAccessToken"
      );
    }
    console.log(userData);
    console.log({
      code: authcode,
      client_id: userData.key,
      client_secret: userData.secret});
    const response = await axios.post(
      "https://api.upstox.com/v2/login/authorization/token",
      new URLSearchParams({
        code: authcode,
        client_id: userData.key,
        client_secret: userData.secret,
        redirect_uri: process.env.REDIRECT_URL,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          Accept: "application/json",
          "Api-Version": "2.0",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log(response?.data);
    if (response) {
      // console.log("Original Doc: ", resp);
      const access_token: string = response.data.access_token;
      let accountData: MasterAccount | ChildAccount;
      if (acc.type === "MASTER") {
        accountData = await prisma.masterAccount.update({
          where: { id: acc.id },
          data: {
            access_token,
            last_token_generated_at: currentdate.toISOString(),
          },
        });
      } else {
        accountData = await prisma.childAccount.update({
          where: { id: acc.id },
          data: {
            access_token,
            last_token_generated_at: currentdate.toISOString(),
          },
        });
      }
      return accountData;
    } else {
      throw new ApiError(
        500,
        "error authorizing with upstox",
        ".Controllers/Authorization: GetAccessToken"
      );
    }
  } catch (error) {
    console.log(error);
  }
};
