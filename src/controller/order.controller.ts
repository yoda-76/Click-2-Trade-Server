import { Broker } from "@prisma/client";
import { Express, Request, Response } from "express";
import axios from "axios";

function sliceOrderQuantity(orderQty, index) {
  const freeze_qty = {
    NIFTY: 1800,
    BANKNIFTY: 900,
    FINNIFTY: 1800,
  };
  let slicedQuantity = [];
  console.log(freeze_qty[index], index);

  while (orderQty > 0) {
    if (orderQty >= freeze_qty[index]) {
      slicedQuantity.push(freeze_qty[index]);
      orderQty -= freeze_qty[index];
    } else {
      slicedQuantity.push(orderQty);
      orderQty = 0;
    }
  }

  return slicedQuantity;
}

const coustomPlaceOrder = async (
  index,
  order_type,
  product,
  key,
  accountDetails,
  qty,
  transaction_type,
  trigger_price,
  price
) => {
  //check funds first
  try {
    const slicedQty = sliceOrderQuantity(qty, index);

    console.log(41, slicedQty);

    for (let i = 0; i < slicedQty.length; i++) {
      let config = {
        url: "https://api.upstox.com/v2/order/place",
        method: "post", // Add the 'method' property and set it to 'post'
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accountDetails.access_token}`,
        },
        data: {
          quantity: slicedQty[i],
          product,
          validity: "DAY",
          price: order_type === "LIMIT" ? price : 0,
          tag: "string",
          instrument_token: key,
          order_type,
          transaction_type,
          disclosed_quantity: 0,
          trigger_price,
          is_amo: true,
        },
      };
      //check if the quantity exceeds the freeze quqntity for that perticular index? if it does, then slice the order

      const response = await axios(config);
      console.log(response.data);
      //return responce
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
export const placeOrder = async (req: Request, res: Response) => {
  const {
    email,
    account_id,
    instrument_token,
    quantity,
    product,
    order_type,
    transaction_type,
    index,
    trigger_price,
    price,
  }: {
    email: string;
    account_id: string;
    instrument_token: number;
    quantity: number;
    product: string;
    order_type: string;
    transaction_type: string;
    index: string;
    trigger_price: number;
    price: number;
  } = req.body;
  try {
    const account = await prisma.masterAccount.findUnique({
      where: { id: account_id },
    });
    const accessToken = account.access_token;

    //check funds
    // const url =
    //   "https://api.upstox.com/v2/user/get-funds-and-margin?segment=SEC";

    // const headers = {
    //   Accept: "application/json",
    //   Authorization: `Bearer ${accessToken}`,
    // };
    // const resp = await axios.get(url, { headers });
    // console.log(quantity, price);
    // if(resp.data.data.equity.available_margin < quantity*price){
    //   console.log("need extra funds: ",quantity*price - resp.data.data.equity.available_margin);
    //   return res.send("need extra funds: "+(quantity*price - resp.data.data.equity.available_margin));
    // }


    const childs = await prisma.childAccount.findMany({
      where: { master_id: account_id },
    });
    const filteredChild = childs.filter((child) => child.active);
    const response = await coustomPlaceOrder(
      index,
      order_type,
      product,
      instrument_token,
      account,
      quantity,
      transaction_type,
      trigger_price,
      price
    );
    console.log(response);
    if (response) {
      //place same order in all child accounts
      for (let i = 0; i < filteredChild.length; i++) {
        const response = await coustomPlaceOrder(
          index,
          order_type,
          product,
          instrument_token,
          filteredChild[i],
          quantity * filteredChild[i].multiplier,
          transaction_type,
          trigger_price,
          price
        );
        console.log(response);
      }

      return res.json("Order Placed Successfully");
    }
  } catch (error) {
    console.log(error);
  }
};

const cancelOrder = async (order_id: string, access_token: string) => {
  try {
    const url = `https://api-hft.upstox.com/v2/order/cancel?order_id=${order_id}`;
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`, // Replace {your_access_token} with the actual access token
    };

    const resp = await axios.delete(url, { headers });
    console.log(resp.data);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const cancelAllOrders = async (req: Request, res: Response) => {
  const { account_id }: { account_id: string } = req.body;
  try {
    const account = await prisma.masterAccount.findUnique({
      where: { id: account_id },
    });
    const masterAccessToken = account.access_token;
    const childs = await prisma.childAccount.findMany({
      where: { master_id: account_id },
    });
    const filteredChild = childs.filter((child) => child.active);

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://api.upstox.com/v2/order/retrieve-all",
      headers: {
        Accept: "application/json",
        "Api-Version": "2.0",
        Authorization: `Bearer ${masterAccessToken}`,
      },
    };
    const response = await axios(config);
    const orders = response.data.data;
    for (let i = 0; i < orders.length; i++) {
      const response = await cancelOrder(orders[i].order_id, masterAccessToken);
    }

    const childAccessTokens = filteredChild.map((child) => child.access_token);
    childAccessTokens.map(async (childAccessToken) => {
      config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://api.upstox.com/v2/order/retrieve-all",
        headers: {
          Accept: "application/json",
          "Api-Version": "2.0",
          Authorization: `Bearer ${childAccessToken}`,
        },
      };
      const response = await axios(config);
      const orders = response.data.data;
      for (let i = 0; i < orders.length; i++) {
        const response = await cancelOrder(
          orders[i].order_id,
          childAccessToken
        );
      }
    });
    //get order book of master and all active childs

    return res.json("Order Canceled Successfully");
  } catch (error) {
    console.log(error);
  }
};
