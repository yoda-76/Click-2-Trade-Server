import { Express, Request, Response } from "express";
import { login, register, userDetails, getFunds } from "./controller/user.controller";
import { upstoxAuth } from "./controller/upstox-auth";
import { authenticateJWT } from "./middleware/authenticate";
import { addAccount, getAccountDetails, getChildAccounts, toggleChildAccount, updateMultiplier} from "./controller/account.controller";
import { getStructuredOptionsData } from "./controller/misc.controller";
import { cancelAllOrders, placeOrder } from "./controller/order.controller";
import { getOrders } from "./controller/orderbook.controller";
import { getPositions } from "./controller/positions.controller";
import { squareoffAllPositions } from "./controller/squareoff.controller";



function routes(app: Express) {
  //health check
  app.get("/api/test", async (req: Request, res: Response) => { 
    res.send("Server is healthy");
  });
  


  // auth
  app.post("/api/register", register);
  app.post("/api/login", login);

  // upstox auth
  app.get("/auth", upstoxAuth);

  // user details
  app.post("/api/get-user-details",userDetails)
  app.post("/api/get-funds",getFunds)

  // master acount
  app.post("/api/get-account-details", getAccountDetails)
  
  // get options data
  app.get("/api/get-structured-options-data", getStructuredOptionsData)

  // add account
  app.post("/api/add-account",addAccount);

  // child accounts
  app.post("/api/get-child-account-details",getChildAccounts)
  app.post("/api/update-multiplier", updateMultiplier);
  app.post("/api/toggle-active" ,toggleChildAccount );

  // orders
  app.post("/api/get-orders", getOrders)
  app.post("/api/place-order", placeOrder);
  app.post("/api/cancel-all-order", cancelAllOrders);

  app.post("/api/get-positions", getPositions)


  //square off
  app.post("/api/square-off-all", squareoffAllPositions)

}

export default routes;
