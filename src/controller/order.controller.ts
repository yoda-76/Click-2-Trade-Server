import { Broker } from "@prisma/client";
import { Express, Request, Response } from "express";
import axios from "axios";
const freeze_qty = {
    NIFTY: 1800,
    BANKNIFTY: 900,
    FINNIFTY : 1800

}
function sliceOrderQuantity(orderQty, freezeQty) {
    let slicedQuantity = [];

    while (orderQty > 0) {
        if (orderQty >= freezeQty) {
            slicedQuantity.push(freezeQty);
            orderQty -= freezeQty;
        } else {
            slicedQuantity.push(orderQty);
            orderQty = 0;
        }
    }

    return slicedQuantity;
}
export const placeOrder = async (req: Request, res: Response) => {
    const {
        email,
        account_id,
        instrument_token,
        quantity,
        product,
        order_type,
        transaction_type,
        index
    }:{
        email: string,
        account_id: string,
        instrument_token: number,
        quantity: number,
        product: string,
        order_type: string,
        transaction_type: string,
        index:string
    } = req.body;
   
    try {
        const account = await prisma.masterAccount.findUnique({
            where: { id: account_id },
        })
        const accessToken = account.access_token;
        const childs = await prisma.childAccount.findMany({
            where: { master_id: account_id },
        })
        const filteredChild = childs.filter(child => child.active);
        // const slicedQuantity = sliceOrderQuantity(quantity, freeze_qty[index]);
        // console.log(childs, childAccessTokens);
  let config = {
    url: 'https://api.upstox.com/v2/order/place',
    method: 'post',  // Add the 'method' property and set it to 'post'
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    data: {
        quantity,
        product,
        validity: 'DAY',
        price: 0,
        tag: 'string',
        instrument_token,
        order_type,
        transaction_type,
        disclosed_quantity: 0,
        trigger_price: 0,
        is_amo: true,
      }
  };
  //check if the quantity exceeds the freeze quqntity for that perticular index? if it does, then slice the order
  
  
    const response = await axios(config);
    console.log(response.data);
    if(response){
        //place same order in all child accounts
        for (let i = 0; i < filteredChild.length; i++) {
            
            const config = {
                url: 'https://api.upstox.com/v2/order/place',
                method: 'post',  // Add the 'method' property and set it to 'post'
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${filteredChild[i].access_token}`,
                },
                data: {
                    quantity: quantity*filteredChild[i].multiplier,
                    product,
                    validity: 'DAY',
                    price: 0,
                    tag: 'string',
                    instrument_token,
                    order_type,
                    transaction_type,
                    disclosed_quantity: 0,
                    trigger_price: 0,
                    is_amo: true,
                }
            }
            const response = await axios(config);
            console.log(response.data);
        }
        
        return res.json("Order Placed Successfully");
    }
    } catch (error) {
        console.log(error);
    }
}