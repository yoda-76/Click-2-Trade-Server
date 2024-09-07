import { prisma } from "../lib/db";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/generate-jwt";
import axios from "axios";


export const register = async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    re_password,
  }: {
    name: string;
    email: string;
    password: string;
    re_password: string;
  } = req.body;
  if (password !== re_password) {
    return res.status(202).send("User not created");
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log({
    name,
    email,
    password: hashedPassword,
  });
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  // Generate a JWT
  const token = generateToken({ id: user.id, email: user.email });

  // Set the JWT as a cookie
  res.cookie("token", token, { httpOnly: true });

  res.status(201).send("User created");
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).send("Invalid email or password");
  }

  // Compare the password with the hashed password in the database
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log(password, user.password, isPasswordValid);

  if (!isPasswordValid) {
    return res.status(401).send("Invalid email or password");
  }

  // Generate a JWT
  const token = await generateToken({ id: user.id, email: user.email });

  // Set the JWT as a cookie
  res.cookie("token", token, { httpOnly: true });

  const payload = {
    token,
    name: user.name,
    email,
    total_pnl: user.total_pnl,
  };
  return res.json(payload);
};

export const userDetails = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  console.log(93, email);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const accounts = await prisma.masterAccount.findMany({
      where: {
        user_id: user.id,
      },
    });
    const updatedAccounts = accounts.map(a=>{
      return {
        id:a.id,
        broker:a.broker,
        broker_id: a.broker_id,
        name_tag: a.name_tag,
        key: a.key,
        secret: a.secret,
        last_token_generated_at: a.last_token_generated_at,
        added_at: a.added_at,
        pnl:a.pnl
      }
    })
    const payload = {
      name: user.name,
      email,
      total_pnl: user.total_pnl,
      accounts:updatedAccounts
    };
    res.json(payload);
  } catch (error) {
    console.log(error);
  }
};


export const getFunds = async (req: Request, res: Response) => {
  const account_id: string = req.body.account_id;
  try {
    const account = await prisma.masterAccount.findUnique({ where: { id: account_id } });
    const access_token= account.access_token;
    const url =
      "https://api.upstox.com/v2/user/get-funds-and-margin";

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    };
    const resp = await axios.get(url, { headers });
    console.log(resp.data.data);
    return res.json(resp.data.data)
  } catch (error) {
    console.log(error);
    
  }
}