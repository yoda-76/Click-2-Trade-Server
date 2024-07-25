import axios from "axios";
import { Express, Request, Response } from "express";
import { login, register, userDetails } from "./controller/user.controller";
import { GetAccessToken } from "./service/upstox-auth.service";
// import { startWorker } from "./controller/worker.controller";
import { upstoxAuth } from "./controller/upstox-auth";
import { authenticateJWT } from "./middleware/authenticate";
import { addAccount, getChildAccounts, toggleChildAccount, updateMultiplier} from "./controller/account.controller";
import { getStructuredOptionsData } from "./controller/misc.controller";
import { placeOrder } from "./controller/order.controller";



function routes(app: Express) {
  //health check
  app.get("/api/test", async (req: Request, res: Response) => {
    res.send("Server is healthy");
  });



  app.post("/api/register", register);
  app.post("/api/login", login);

  app.post("/api/get-user-details",userDetails)
  app.post("/api/get-child-account-details",getChildAccounts)


  // app.post("/api/start",authenticateJWT, startWorker);
  app.post("/api/add-account",addAccount);

  app.get("/api/get-structured-options-data", getStructuredOptionsData)

  // app.post("/api/stop", )
  app.get("/auth", upstoxAuth);



  // place order
  app.post("/api/place-order", placeOrder);
  app.post("/api/update-multiplier", updateMultiplier);
  app.post("/api/toggle-active", toggleChildAccount );
}

export default routes;
