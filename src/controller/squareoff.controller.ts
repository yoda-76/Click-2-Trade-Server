import { Express, Request, Response } from "express";
import axios from "axios";
import { ChildAccount, MasterAccount } from "@prisma/client";
import { coustomPlaceOrder } from "./order.controller";

export const squareoffAllPositions = async (req: Request, res: Response) => {
  const {
    account_id,
    account_type,
  }: { account_id: string; account_type: string } = req.body;
  console.log(account_id, account_type);
  if (!account_id || !account_type) return;
  try {
    //fetch access token
    console.log(account_id, account_type);
    let user: ChildAccount | MasterAccount | null = null;
    if (account_type === "MASTER") {
      user = await prisma.masterAccount.findUnique({
        where: { id: account_id },
      });
    } else if (account_type === "CHILD") {
      user = await prisma.childAccount.findUnique({
        where: { id: account_id },
      });
    } else {
      res.status(401).send("Invalid account type");
    }

    console.log(user);
    const accessToken = user.access_token;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.upstox.com/v2/portfolio/short-term-positions",
      headers: {
        Accept: "application/json",
        "Api-Version": "2.0",
        Authorization: `Bearer ${accessToken}`,
      },
    };
    const response = await axios(config);
    console.log("response.data.data", response.data.data);

    const childs = await prisma.childAccount.findMany({
      where: { master_id: account_id },
    });
    const filteredChild = childs.filter((child) => child.active);

    await response.data.data.map(async (p) => {
      if (p.quantity === 0 || p.product!=="I") {
        console.log("not placing for ", p.trading_symbol);
        return;
      }

      const orderResp = await coustomPlaceOrder(
        p.trading_symbol,
        "MARKET",
        "I",
        p.instrument_token,
        user,
        Math.abs(p.quantity),
        p.quantity > 0 ? "SELL" : "BUY",
        0,
        0
      );
      console.log("object");
      console.log("orderResp", p.trading_symbol);
      if (orderResp) {
        //place same order in all child accounts
        for (let i = 0; i < filteredChild.length; i++) {
          if (filteredChild[i].active === false ) continue;

          const  childConfig = {
            method: "get",
            maxBodyLength: Infinity,
            url: "https://api.upstox.com/v2/portfolio/short-term-positions",
            headers: {
              Accept: "application/json",
              "Api-Version": "2.0",
              Authorization: `Bearer ${filteredChild[i].access_token}`,
            },
          };
          const childPosition = await axios(childConfig);
          childPosition.data.data.map(async (p) => {
            if ( p.quantity === 0 || p.product!=="I") {
              console.log("not placing for ", p.trading_symbol, p.product);
              return;
            }
            const childOrder = await coustomPlaceOrder(
              p.trading_symbol,
              "MARKET",
              "I",
              p.instrument_token,
              filteredChild[i],
              Math.abs(p.quantit) ,
              p.quantity > 0 ? "SELL" : "BUY",
              0,
              0
            );
            console.log("child order:",childOrder);
          })
        }
        // return res.json("Order Placed Successfully");
      }
    });

    res.send(response.data.data);
  } catch (error) {
    console.log("error");
    res.status(500).send("access tokec error");
  }
};

export const squareoffSinglePositions = async (req: Request, res: Response) => {
  const {
    account_id,
    account_type,
    tradingSymbol,
  }: { account_id: string; account_type: string; tradingSymbol: string } =
    req.body;
  console.log(account_id, account_type);
  if (!account_id || !account_type) return;
  try {
    //fetch access token
    console.log(account_id, account_type);
    let user: ChildAccount | MasterAccount | null = null;
    if (account_type === "MASTER") {
      user = await prisma.masterAccount.findUnique({
        where: { id: account_id },
      });
    } else if (account_type === "CHILD") {
      user = await prisma.childAccount.findUnique({
        where: { id: account_id },
      });
    } else {
      res.status(401).send("Invalid account type");
    }

    // console.log(user);
    const accessToken = user.access_token;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.upstox.com/v2/portfolio/short-term-positions",
      headers: {
        Accept: "application/json",
        "Api-Version": "2.0",
        Authorization: `Bearer ${accessToken}`,
      },
    };
    const response = await axios(config);
    console.log("response.data.data", response.data.data);

    const childs = await prisma.childAccount.findMany({
      where: { master_id: account_id },
    });
    const filteredChild = childs.filter((child) => child.active);

    await response.data.data.map(async (p) => {
      if (p.trading_symbol !== tradingSymbol || p.quantity === 0 || p.product!=="I") {
        console.log(p.trading_symbol, tradingSymbol, p.quantity);
        console.log("not placing for ", p.trading_symbol, p.product);
        return;
      }

      const orderResp = await coustomPlaceOrder(
        p.trading_symbol,
        "MARKET",
        "I",
        p.instrument_token,
        user,
        Math.abs(p.quantity),
        p.quantity > 0 ? "SELL" : "BUY",
        0,
        0
      );
      // console.log("object");
      console.log("master order:", orderResp);
      if (orderResp) {
        //place same order in all child accounts
        for (let i = 0; i < filteredChild.length; i++) {
          if (filteredChild[i].active === false) continue;
          const  childConfig = {
            method: "get",
            maxBodyLength: Infinity,
            url: "https://api.upstox.com/v2/portfolio/short-term-positions",
            headers: {
              Accept: "application/json",
              "Api-Version": "2.0",
              Authorization: `Bearer ${filteredChild[i].access_token}`,
            },
          };
          const childPosition = await axios(childConfig);
          childPosition.data.data.map(async (p) => {
            if (p.trading_symbol !== tradingSymbol || p.quantity === 0 || p.product!=="I") {
              console.log("not placing for ", p.trading_symbol, p.product);
              return;
            }
            const childOrder = await coustomPlaceOrder(
              p.trading_symbol,
              "MARKET",
              "I",
              p.instrument_token,
              filteredChild[i],
              Math.abs(p.quantity) ,
              p.quantity > 0 ? "SELL" : "BUY",
              0,
              0
            );
            console.log("child order:",childOrder);
          })
        }

        // return res.json("Order Placed Successfully");
      }
    });

    res.send(response.data.data);
  } catch (error) {
    console.log("error");
    res.status(500).send("access tokec error");
  }
};



/////////////////////////////v2///////////////////////////

export const squareoffAllPositions_v2 = async (req: Request, res: Response) => {
  // const {
  //   account_id,
  //   account_type,
  // }: { account_id: string; account_type: string } = req.body;
  const u_id = req.body.master_u_id;
  console.log(u_id  );
  if (!u_id ) return;
  try {
    //fetch access token
    // console.log(account_id, account_type);
    let user:  MasterAccount | null = null;
    // if (account_type === "MASTER") {
    //   user = await prisma.masterAccount.findUnique({
    //     where: { id: account_id },
    //   });
    // } else if (account_type === "CHILD") {
    //   user = await prisma.childAccount.findUnique({
    //     where: { id: account_id },
    //   });
    // } else {
    //   res.status(401).send("Invalid account type");
    // }

    user = await prisma.masterAccount.findUnique({
      where: { u_id},
    });

    console.log(user);
    const accessToken = user.access_token;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.upstox.com/v2/portfolio/short-term-positions",
      headers: {
        Accept: "application/json",
        "Api-Version": "2.0",
        Authorization: `Bearer ${accessToken}`,
      },
    };
    const response = await axios(config);
    console.log("response.data.data", response.data.data);

    const childs = await prisma.childAccount.findMany({
      where: { master_id: user.id },
    });
    console.log("childs",childs,"\n\n");
    const filteredChild = childs.filter((child) => child.active);

    await response.data.data.map(async (p) => {
      if (p.quantity === 0 || p.product!=="I") {
        console.log("not placing for ", p.trading_symbol);
        return;
      }

      const orderResp = await coustomPlaceOrder(
        p.trading_symbol,
        "MARKET",
        "I",
        p.instrument_token,
        user,
        Math.abs(p.quantity),
        p.quantity > 0 ? "SELL" : "BUY",
        0,
        0
      );
      console.log("object");
      console.log("orderResp", p.trading_symbol);
      if (orderResp) {
        //place same order in all child accounts
        for (let i = 0; i < filteredChild.length; i++) {
          if (filteredChild[i].active === false ) continue;

          const  childConfig = {
            method: "get",
            maxBodyLength: Infinity,
            url: "https://api.upstox.com/v2/portfolio/short-term-positions",
            headers: {
              Accept: "application/json",
              "Api-Version": "2.0",
              Authorization: `Bearer ${filteredChild[i].access_token}`,
            },
          };
          const childPosition = await axios(childConfig);
          childPosition.data.data.map(async (p) => {
            if ( p.quantity === 0 || p.product!=="I") {
              console.log("not placing for ", p.trading_symbol, p.product);
              return;
            }
            const childOrder = await coustomPlaceOrder(
              p.trading_symbol,
              "MARKET",
              "I",
              p.instrument_token,
              filteredChild[i],
              Math.abs(p.quantit) ,
              p.quantity > 0 ? "SELL" : "BUY",
              0,
              0
            );
            console.log("child order:",childOrder);
          })
        }
        // return res.json("Order Placed Successfully");
      }
    });

    res.send(response.data.data);
  } catch (error) {
    console.log(error);
    res.status(500).send("access tokec error");
  }
};

export const squareoffSinglePositions_v2 = async (req: Request, res: Response) => {
  const {
    account_id,
    account_type,
    tradingSymbol,
  }: { account_id: string; account_type: string; tradingSymbol: string } =
    req.body;
  console.log(account_id, account_type);
  if (!account_id || !account_type) return;
  try {
    //fetch access token
    console.log(account_id, account_type);
    let user: ChildAccount | MasterAccount | null = null;
    if (account_type === "MASTER") {
      user = await prisma.masterAccount.findUnique({
        where: { id: account_id },
      });
    } else if (account_type === "CHILD") {
      user = await prisma.childAccount.findUnique({
        where: { id: account_id },
      });
    } else {
      res.status(401).send("Invalid account type");
    }

    // console.log(user);
    const accessToken = user.access_token;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.upstox.com/v2/portfolio/short-term-positions",
      headers: {
        Accept: "application/json",
        "Api-Version": "2.0",
        Authorization: `Bearer ${accessToken}`,
      },
    };
    const response = await axios(config);
    console.log("response.data.data", response.data.data);

    const childs = await prisma.childAccount.findMany({
      where: { master_id: account_id },
    });
    const filteredChild = childs.filter((child) => child.active);

    await response.data.data.map(async (p) => {
      if (p.trading_symbol !== tradingSymbol || p.quantity === 0 || p.product!=="I") {
        console.log(p.trading_symbol, tradingSymbol, p.quantity);
        console.log("not placing for ", p.trading_symbol, p.product);
        return;
      }

      const orderResp = await coustomPlaceOrder(
        p.trading_symbol,
        "MARKET",
        "I",
        p.instrument_token,
        user,
        Math.abs(p.quantity),
        p.quantity > 0 ? "SELL" : "BUY",
        0,
        0
      );
      // console.log("object");
      console.log("master order:", orderResp);
      if (orderResp) {
        //place same order in all child accounts
        for (let i = 0; i < filteredChild.length; i++) {
          if (filteredChild[i].active === false) continue;
          const  childConfig = {
            method: "get",
            maxBodyLength: Infinity,
            url: "https://api.upstox.com/v2/portfolio/short-term-positions",
            headers: {
              Accept: "application/json",
              "Api-Version": "2.0",
              Authorization: `Bearer ${filteredChild[i].access_token}`,
            },
          };
          const childPosition = await axios(childConfig);
          childPosition.data.data.map(async (p) => {
            if (p.trading_symbol !== tradingSymbol || p.quantity === 0 || p.product!=="I") {
              console.log("not placing for ", p.trading_symbol, p.product);
              return;
            }
            const childOrder = await coustomPlaceOrder(
              p.trading_symbol,
              "MARKET",
              "I",
              p.instrument_token,
              filteredChild[i],
              Math.abs(p.quantity) ,
              p.quantity > 0 ? "SELL" : "BUY",
              0,
              0
            );
            console.log("child order:",childOrder);
          })
        }

        // return res.json("Order Placed Successfully");
      }
    });

    res.send(response.data.data);
  } catch (error) {
    console.log("error");
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
