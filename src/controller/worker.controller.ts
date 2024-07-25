// import { prisma } from "../lib/db";
// import { Express, Request, Response } from "express";
// import { Worker } from "worker_threads";
// import path from "path";
// import { client } from "../lib/redis";

// export const startWorker = async (req: Request, res: Response) => {
//   const user= await prisma.user.findUnique({where:{email: req.body.email}})
//   const workerData = {workerData: user.access_token}
//   const worker = new Worker(
//     path.resolve(
//       __dirname,
//       `../worker.${process.env.NODE_ENV === "production" ? "js" : "ts"}`
//     ),
//     {
//       workerData
//     }
//   );

//   worker.on("error", (error) => {
//     console.error(`Worker error: ${error.message}`);
//     // Log the error but don't send another response as it might have already been sent
//   });

//   worker.on("exit", (code) => {
//     if (code !== 0) {
//       console.error(`Worker stopped with exit code ${code}`);
//     }
//   });

//   const redisData = await client.set("test", `{"threadId":${worker.threadId}}`);
//   res.send("Worker started");
// };

// // export const stopWorker = async (req: Request, res: Response) => {
// //     const { threadId } = req.body;

// //     if (!threadId || !workerState[threadId]) {
// //       return res.status(400).send('Invalid thread ID');
// //     }

// //     const worker = workerState[threadId];
// //     if (worker) {
// //       worker.terminate()
// //         .then(() => {
// //           workerState[threadId] = undefined; // Clean up the reference
// //           res.send(`Worker ${threadId} terminated`);
// //         })
// //         .catch((err) => {
// //           console.error(`Error terminating worker ${threadId}:`, err);
// //           res.status(500).send(`Error terminating worker ${threadId}`);
// //         });
// //     }
// // };
