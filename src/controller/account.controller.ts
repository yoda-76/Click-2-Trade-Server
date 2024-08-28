import { Broker } from "@prisma/client";
import { Express, Request, Response } from "express";
export const addAccount = async (req: Request, res: Response) => {
  const {
    name_tag,
    email,
    key,
    secret,
    broker,
    broker_id,
    type,
    master,
  }: {
    name_tag: string;
    email: string;
    key: string;
    secret: string;
    broker: Broker;
    broker_id: string;
    type: string;
    master: string;
  } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const user_id = user.id;
    if (type === "MASTER") {
      await prisma.masterAccount.create({
        data: {
          user_id,
          name_tag,
          key,
          secret,
          broker,
          broker_id,
        },
      });
    } else {
      await prisma.childAccount.create({
        data: {
          master_id: master,
          name_tag,
          key,
          secret,
          broker,
          broker_id,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }

  res.send("account has been added");
};

export const getAccountDetails = async (req: Request, res: Response) => {
  const id = req.body.id;
  try {
    const account = await prisma.masterAccount.findUnique({
      where: {
        id,
      },
    });
    res.send(account);
  } catch (error) {
    console.log(error);
  }
};
export const getChildAccounts = async (req: Request, res: Response) => {
  const master_id = req.body.master_id;
  // console.log(req.body);
  if (!master_id) return;
  try {
    const childAccounts = await prisma.childAccount.findMany({
      where: {
        master_id,
      },
    });
    res.send(childAccounts);
  } catch (error) {
    console.log(error);
  }
};

export const updateMultiplier = async (req: Request, res: Response) => {
  const { id, multiplier } = req.body;
  try {
    const account = await prisma.childAccount.update({
      where: {
        id,
      },
      data: {
        multiplier,
      },
    });
    res.send(account);
  } catch (error) {
    console.log(error);
  }
};

export const toggleChildAccount = async (req: Request, res: Response) => {
  const { id, status } = req.body;
  try {
    const account = await prisma.childAccount.update({
      where: {
        id,
      },
      data: {
        active: status,
      },
    });
    res.send(account);
  } catch (error) {
    console.log(error);
  }
};