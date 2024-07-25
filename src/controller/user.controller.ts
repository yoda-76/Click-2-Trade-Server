import { prisma } from "../lib/db";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/generate-jwt";

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
    console.log(accounts);
    // broker: 'DHAN',
    // broker_id: 'qq',
    // name_tag: 'qq',
    // key: 'qq',
    // secret: 'qq',
    // access_token: null,
    // last_token_generated_at: null,
    // added_at: 2024-07-08T13:25:27.605Z,
    // pnl: 0,
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


