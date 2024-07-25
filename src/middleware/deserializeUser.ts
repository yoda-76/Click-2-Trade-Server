// import { Request, Response, NextFunction } from "express";
// import UserModel from "../models/user.model";
// import { AdminModel } from "../models/admin.model";
// import AgentModel from "../models/agent.model";

// const deserializeUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const userId = req.headers.userid;
//   const adminId = req.headers.adminid;
//   const agentId=req.headers.agentid;
//   res.locals.skey=req.headers.skey
 
//   if (!userId && !adminId && !agentId) {
//     return next();
//   } else if (!userId && !agentId && adminId) {
//     try {
//       let admin;
//       if (Array.isArray(adminId)) {
//         admin = await AdminModel.findOne({ adminId: { $in: adminId } });
//       } else {
//         admin = await AdminModel.findOne({ _id:adminId });
//       }
//       res.locals.admin = admin;
//       return next();
//     } catch (error) {
//       // Handle errors such as database query errors
//       // You might want to log the error or return an appropriate response
//       return next(error);
//     }
//   }
//   else if (userId && agentId && !adminId) {
//     try {
//       let agent;
//       let user;
//       if (Array.isArray(userId)) {
//         user = await UserModel.findOne({ userId: { $in: userId } });
//       } else {
//         user = await UserModel.findOne({ userId });
//       }

//       res.locals.user = user;
//       if (Array.isArray(agentId)) {
//         agent = await AgentModel.findOne({ _id: { $in: agentId } });
//       } else {
//         agent = await AgentModel.findOne({ _id:agentId });
//       }
  
//       res.locals.agent = agent;
      
//       return next();
//     } catch (error) {
//       // Handle errors such as database query errors
//       // You might want to log the error or return an appropriate response
//       res.status(404).send("User or Agent Not Found");
//       return next(error);
//     }
//   }
//   else {
//     try {
//       let user;
//       if (Array.isArray(userId)) {
//         user = await UserModel.findOne({ userId: { $in: userId } });
//       } else {
//         user = await UserModel.findOne({ userId });
//       }
      
//       res.locals.user = user;
//       // console.log(user)
//       return next();
//     } catch (error) {
//       // Handle errors such as database query errors
//       // You might want to log the error or return an appropriate response
//       return next(error);
//     }
//   }
// };

// export default deserializeUser;
