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










// [
//   {
//     "exchange": "NSE",
//     "product": "I",
//     "price": 0,
//     "quantity": 1,
//     "status": "complete",
//     "guid": null,
//     "tag": null,
//     "instrument_token": "NSE_EQ|INE528G01035",
//     "placed_by": "KL2770",
//     "tradingsymbol": "YESBANK-EQ",
//     "trading_symbol": "YESBANK-EQ",
//     "order_type": "MARKET",
//     "validity": "DAY",
//     "trigger_price": 0,
//     "disclosed_quantity": 0,
//     "transaction_type": "BUY",
//     "average_price": 24.11,
//     "filled_quantity": 1,
//     "pending_quantity": 0,
//     "status_message": null,
//     "status_message_raw": null,
//     "exchange_order_id": "1300000006970518",
//     "parent_order_id": null,
//     "order_id": "240816000106515",
//     "variety": "SIMPLE",
//     "order_timestamp": "2024-08-16 09:40:08",
//     "exchange_timestamp": "2024-08-16 09:40:08",
//     "is_amo": false,
//     "order_request_id": "1",
//     "order_ref_id": "691957669380878"
//   }
// ]