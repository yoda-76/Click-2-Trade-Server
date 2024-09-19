import { Express, Request, Response } from "express";
import useragent from 'useragent';
import { login, register, userDetails, getFunds, getFunds_v2, logout } from "./controller/user.controller";
import { upstoxAuth } from "./controller/upstox-auth";
import { authenticateJWT } from "./middleware/authenticate";
import { addAccount, addAccount_v2, getAccountDetails, getAccountDetails_v2, getChildAccounts, getChildAccounts_v2, toggleChildAccount, toggleChildAccount_v2, updateMultiplier, updateMultiplier_v2} from "./controller/account.controller";
import { getStructuredOptionsData, setAccessToken } from "./controller/misc.controller";
import { cancelAllOrders, cancelAllOrders_v2, cancelOrderById, cancelOrderById_v2, placeOrder, placeOrder_v2 } from "./controller/order.controller";
import { getOrders, getOrders_v2 } from "./controller/orderbook.controller";
import { getPositions, getPositions_v2 } from "./controller/positions.controller";
import { squareoffAllPositions, squareoffAllPositions_v2, squareoffSinglePositions } from "./controller/squareoff.controller";
import { getPrefrences, updatePrefrenceSL, updatePrefrenceTarget } from "./controller/prefrences.controller";



function routes(app: Express) {
  //health check
  app.get("/api/test", async (req: Request, res: Response) => { 
    res.send("Server is healthy");
  });
  


  // auth
  app.post("/api/register", register);  //not updated with access and refresh token also does not redirect to dashboard
  app.post("/api/login", login);
  app.post("/api/logout", authenticateJWT, logout)

  // upstox auth
  app.get("/auth", upstoxAuth);

  // user details
  app.post("/api/get-funds",authenticateJWT,getFunds_v2)
  app.post("/api/get-user-details",authenticateJWT,userDetails) // not protected but doesnot need u_id

  // master acount
  app.post("/api/get-account-details",authenticateJWT,authenticateJWT, getAccountDetails_v2)
  
  // get options data
  app.get("/api/get-structured-options-data",authenticateJWT, getStructuredOptionsData) //does not need to be protected

  // add account
  app.post("/api/add-account",authenticateJWT,addAccount_v2); //updated with u_id but is not protected

  // child accounts
  app.post("/api/get-child-account-details",authenticateJWT,getChildAccounts_v2)
  app.post("/api/update-multiplier", authenticateJWT,updateMultiplier_v2);
  app.post("/api/toggle-active" ,authenticateJWT,toggleChildAccount_v2 );

  // orders
  app.post("/api/get-orders", authenticateJWT,getOrders_v2)
  app.post("/api/get-positions",authenticateJWT, getPositions_v2)
  app.post("/api/place-order",authenticateJWT, placeOrder_v2);
  app.post("/api/cancel-all-order", authenticateJWT,cancelAllOrders_v2);
  app.post("/api/cancel-order",authenticateJWT, cancelOrderById_v2)



  //square off
  app.post("/api/square-off-all",authenticateJWT, squareoffAllPositions_v2)
  app.post("/api/square-off-single",authenticateJWT, squareoffSinglePositions)

  app.post("/api/set-access-token", setAccessToken)

  //predefined sl and target
  app.post("/api/update-prefrences-sl", authenticateJWT, updatePrefrenceSL)
  app.post("/api/update-prefrences-target", authenticateJWT, updatePrefrenceTarget)
  app.post("/api/get-prefrences", authenticateJWT, getPrefrences)


  //testing cookies
  app.post("/set-cookies", (req: Request, res: Response) => {
    console.log("Req obj: ",req);
    res.cookie('accessToken', "yoyoyo", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'dev', // Only use secure cookies in production
      // sameSite: 'Strict', // Helps prevent CSRF
      maxAge: 3600 * 1000, // Expiry time in milliseconds
    });
    res.json({ message: "Cookies set successfully" });
  })
  // app.set('trust proxy', true);
  app.post("/get-cookies", authenticateJWT, (req: Request, res: Response) => {
    // console.log(req.cookies);
  //   const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // // Parse the user-agent header
  // const agent = useragent.parse(req.headers['user-agent']);
  
  // console.log('Client IP:', clientIp);
  // console.log('Browser:', agent.toAgent());
  // console.log('OS:', agent.os.toString());
  // console.log('Device:', agent.device.toString());
    console.log(res.locals.user);
    res.json({ message: req.cookies });
  })

}

export default routes;
