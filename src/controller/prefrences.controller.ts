import { Express, Request, Response } from "express";
import axios from "axios";
import { ChildAccount, MasterAccount } from "@prisma/client";


export const updatePrefrenceTarget = async (req: Request, res: Response) => {
  const { account_id, target }: { account_id: string, target: string} = req.body;
  console.log(req.body);
  if(!account_id || !target) return;
  try {
    const masterAccount = await prisma.masterAccount.findUnique({ where: { u_id: account_id } });
    await prisma.prefrences.upsert({
      where: { account_id: masterAccount?.id },
      update: {
        target: parseInt(target)
      },
      create: {
        account_id: masterAccount?.id,
        target: parseInt(target)
      },
    });
    
    res.send("target prefrences changed");
  } catch (error) {
    console.log(error);
    res.status(500).send("something went wrong while changing target");
  }
}

export const updatePrefrenceSL = async (req: Request, res: Response) => {
  const { account_id, stoploss }: { account_id: string, stoploss: string} = req.body;
  if(!account_id || !stoploss) return;
  try {
    const masterAccount = await prisma.masterAccount.findUnique({ where: { u_id: account_id } });
    const p=await prisma.prefrences.upsert({
      where: { account_id: masterAccount?.id },
      update: {
        stoploss: parseInt(stoploss)
      },
      create: {
        account_id: masterAccount?.id,
        stoploss: parseInt(stoploss)
      },
    })
    console.log("object",p);
    res.send("sl prefrences changed");
  } catch (error) {
    console.log(error);
    res.status(500).send("something went wrong while changing sl");
  }
};


export const getPrefrences = async (req: Request, res: Response) => {
  const { account_id } = req.body;
  if(!account_id) return;
  try {
    const masterAccount = await prisma.masterAccount.findUnique({ where: { u_id: account_id } });
    console.log("account_id",masterAccount?.u_id, "\n\n\n\n\n");
    const prefrences = await prisma.prefrences.findUnique({ where: { account_id: masterAccount?.id } });
    res.json({stoploss:prefrences?.stoploss, target:prefrences?.target});
  } catch (error) {
    console.log(error);
    res.status(500).send("something went wrong while getting prefrences");
  }
}
