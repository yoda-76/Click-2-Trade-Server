import { Broker } from "@prisma/client";
import { Express, Request, Response } from "express";
import { ChildProcess } from "node:child_process";
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
    u_id
  }: {
    name_tag: string;
    email: string;
    key: string;
    secret: string;
    broker: Broker;
    broker_id: string;
    type: string;
    master: string;
    u_id:string
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
          u_id
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
          u_id
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


/////////////////////////////v2////////////////////////

export const addAccount_v2 = async (req: Request, res: Response) => {
  const {
    name_tag,
    email,
    key,
    secret,
    broker,
    broker_id,
    type,
    master,
    u_id
  }: {
    name_tag: string;
    email: string;
    key: string;
    secret: string;
    broker: Broker;
    broker_id: string;
    type: string;
    master: string;
    u_id:string
  } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const user_id = user.id;
    if (type === "MASTER") {
      const masterAccount=await prisma.masterAccount.create({
        data: {
          user_id,
          name_tag,
          key,
          secret,
          broker,
          broker_id,
          u_id
        },
      });
      const prefrences = await prisma.prefrences.create({
        data: {
          account_id: masterAccount.id
        },
      })
    } else {
      const masterAccount = await prisma.masterAccount.findUnique({
        where: {
          u_id:master,
        },
      });
      await prisma.childAccount.create({
        data: {
          master_id: masterAccount.id,
          name_tag,
          key,
          secret,
          broker,
          broker_id,
          u_id
        },
      });
    }
  } catch (error) {
    console.log(error);
  }

  res.send("account has been added");
};

export const getAccountDetails_v2 = async (req: Request, res: Response) => {
  const u_id = req.body.master_u_id;
  try {
    const account = await prisma.masterAccount.findUnique({
      where: {
        u_id,
      },
    });
    const payload = {
      u_id:account.u_id
    }
    res.send(payload);
  } catch (error) {
    console.log(error);
  }
};
export const getChildAccounts_v2 = async (req: Request, res: Response) => {
  
  const u_id = req.body.master_u_id;

  console.log(req.body);
  if (!u_id) return;

  const masterAccount = await prisma.masterAccount.findUnique({
    where: {
      u_id,
    },
  });
  try {
    const childAccounts = await prisma.childAccount.findMany({
      where: {
        master_id:masterAccount.id,
      },
    });
    const payload = childAccounts.map(c=>({
      u_id:c.u_id,
      broker:c.broker,
      broker_id: c.broker_id,
      name_tag: c.name_tag,
      last_token_generated_at: c.last_token_generated_at,
      pnl:c.pnl,
      key:c.key,
      active:c.active,
      multiplier:c.multiplier
    }))
    console.log(payload);
    res.send(payload);
  } catch (error) {
    console.log(error);
  }
};

export const updateMultiplier_v2 = async (req: Request, res: Response) => {
  const { child_u_id, multiplier } = req.body;
  try {
    const account = await prisma.childAccount.update({
      where: {
        u_id: child_u_id,
      },
      data: {
        multiplier,
      },
    });
    res.send("updated multiplier");
  } catch (error) {
    console.log(error);
  }
};

export const toggleChildAccount_v2 = async (req: Request, res: Response) => {
  const { child_u_id, status } = req.body;
  console.log("body",req.body);
  try {
    const account = await prisma.childAccount.update({
      where: {
        u_id: child_u_id,
      },
      data: {
        active: status,
      },
    });
    res.send(`child account state changed to : ${status}`);
  } catch (error) {
    console.log(error);
  }
};