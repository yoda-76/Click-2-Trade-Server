import { Express, Request, Response } from "express";
import axios from "axios";
import { ChildAccount, MasterAccount } from "@prisma/client";

export const getOrders = async (req: Request, res: Response) => {
  const { account_id, account_type }: { account_id: string, account_type: string} = req.body;
  console.log(account_id, account_type);
  if(!account_id || !account_type) return;
  try {
    //fetch access token
    console.log(account_id, account_type);
    let user: ChildAccount | MasterAccount | null = null
    if(account_type==="MASTER"){
        user = await prisma.masterAccount.findUnique({ where: { id: account_id } });
    }else if(account_type==="CHILD"){
        user = await prisma.childAccount.findUnique({ where: { id: account_id } });
    }else{
        res.status(401).send("Invalid account type");
    }

    
    const accessToken=user.access_token;
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://api.upstox.com/v2/order/retrieve-all',
    headers: { 
      'Accept': 'application/json',
      'Api-Version': '2.0',
      'Authorization': `Bearer ${accessToken}`,
    }
  };
  const response=await axios(config)
  res.send(response.data.data);
  } catch (error) {
    console.log(error);
    res.status(500).send("access tokec error");
  }
};
