import { Express, Request, Response } from "express";
import axios from "axios";
import { ChildAccount, MasterAccount } from "@prisma/client";

export const getPositions = async (req: Request, res: Response) => {
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
    url: 'https://api.upstox.com/v2/portfolio/short-term-positions',
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
//     {
//       "exchange": "NSE",
//       "multiplier": 1,
//       "value": 24.11,
//       "pnl": 0.02,
//       "product": "I",
//       "instrument_token": "NSE_EQ|INE528G01035",
//       "average_price": 0,
//       "buy_value": 24.11,
//       "overnight_quantity": 0,
//       "day_buy_value": 24.11,
//       "day_buy_price": 24.11,
//       "overnight_buy_amount": 0,
//       "overnight_buy_quantity": 0,
//       "day_buy_quantity": 1,
//       "day_sell_value": 0,
//       "day_sell_price": 0,
//       "overnight_sell_amount": 0,
//       "overnight_sell_quantity": 0,
//       "day_sell_quantity": 0,
//       "quantity": 1,
//       "last_price": 24.13,
//       "unrealised": 0.02,
//       "realised": 0,
//       "sell_value": 0,
//       "tradingsymbol": "YESBANK",
//       "trading_symbol": "YESBANK",
//       "close_price": 23.99,
//       "buy_price": 24.11,
//       "sell_price": 0
//     }
//   ]







// [
//     {
//       "exchange": "NSE",
//       "multiplier": 1,
//       "value": 24.11,
//       "pnl": 0.14,
//       "product": "D",
//       "instrument_token": "NSE_EQ|INE528G01035",
//       "average_price": 0,
//       "buy_value": 24.11,
//       "overnight_quantity": 0,
//       "day_buy_value": 24.11,
//       "day_buy_price": 24.11,
//       "overnight_buy_amount": 0,
//       "overnight_buy_quantity": 0,
//       "day_buy_quantity": 1,
//       "day_sell_value": 0,
//       "day_sell_price": 0,
//       "overnight_sell_amount": 0,
//       "overnight_sell_quantity": 0,
//       "day_sell_quantity": 0,
//       "quantity": 1,
//       "last_price": 24.25,
//       "unrealised": 0.14,
//       "realised": 0,
//       "sell_value": 0,
//       "tradingsymbol": "YESBANK",
//       "trading_symbol": "YESBANK",
//       "close_price": 23.99,
//       "buy_price": 24.11,
//       "sell_price": 0
//     },
//     {
//       "exchange": "NFO",
//       "multiplier": 1,
//       "value": 0,
//       "pnl": -0.75,
//       "product": "D",
//       "instrument_token": "NSE_FO|58500",
//       "average_price": 0,
//       "buy_value": 77.25,
//       "overnight_quantity": 0,
//       "day_buy_value": 77.25,
//       "day_buy_price": 5.15,
//       "overnight_buy_amount": 0,
//       "overnight_buy_quantity": 0,
//       "day_buy_quantity": 15,
//       "day_sell_value": 76.5,
//       "day_sell_price": 5.1,
//       "overnight_sell_amount": 0,
//       "overnight_sell_quantity": 0,
//       "day_sell_quantity": 15,
//       "quantity": 0,
//       "last_price": 3.9,
//       "unrealised": 0,
//       "realised": -0.75,
//       "sell_value": 76.5,
//       "tradingsymbol": "BANKNIFTY2482153000CE",
//       "trading_symbol": "BANKNIFTY2482153000CE",
//       "close_price": 5.45,
//       "buy_price": 5.15,
//       "sell_price": 5.1
//     }
//   ]