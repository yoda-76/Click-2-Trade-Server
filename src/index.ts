import express, { Request, Response } from "express";
import { prisma } from "./lib/db";
import routes from "./routes";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "node:http";

import Redis from "ioredis";
const client = new Redis("redis://localhost:6379");


// const socketAccessToken = process.env.SOCKET_ACCESS_TOKEN
let socketAccessToken;


// import deserializeUser from "./middleware/deserializeUser";

const port = process.env.PORT || 3000;

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(cookieParser());

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:5173");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept,userId,agentid,adminid,skey"
//   );
//   next();
// });

////////////////

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:5173"); // Allow requests from your client
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, userId, agentid, adminid, skey"
//   );
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Specify allowed methods
//   res.header("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies)
  
//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200); // Quickly respond to preflight checks
//   }

//   next();
// });

/////////////////////
const allowedOrigins = ['http://localhost:5173', 'https://www.oidelta.com/', 'https://oidelta.com/']; // Define your allowed origins

app.use((req, res, next) => {
  const origin = req.headers.origin; // Get the origin of the incoming request
  
  // Check if the request's origin is in the list of allowed origins
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin); // Set the Access-Control-Allow-Origin to the incoming origin
  }
  
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, userId, agentid, adminid, skey"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Specify allowed methods
  res.header("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies)
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Quickly respond to preflight checks
  }

  next();
});
/////////////////

// app.use(deserializeUser);

server.listen(port, async () => {
  console.log(`App is running at http://localhost:${port}`);
  routes(app);
});

//////////////////////////////////////////////////////////////////////////////////////////
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("new connection");

  socket.on("new-user", (data) => {
    console.log(data);
  });
});

// ...........................................................................................
// upstocks websocket market feed implementation
//............................................................................................
// const fs = require("fs");
// const path = require("path");
// const folderPath = path.join(__dirname, "token_data");
// const jsonFilePath2 = path.join(folderPath, "instrument_keys_data.json");
// const upstoxFeedDataPath = path.join(folderPath, "upstoxFeed.json");
// let keysData;
// fs.readFile(jsonFilePath2, "utf8", (err, data) => {
//   if (err) {
//     console.error("Error reading the file:", err);
//     return;
//   }

//   // Parse the JSON data
//   try {
//     const jsonData = JSON.parse(data);
//     keysData = jsonData;
//     // console.log("JSON data:", jsonData);
//   } catch (parseError) {
//     console.error("Error parsing JSON:", parseError);
//   }
// });
// Import required modules
let keysData;

var UpstoxClient = require("upstox-js-sdk");
const WebSocket = require("ws").WebSocket;
const protobuf = require("protobufjs");

// Initialize global variables
let protobufRoot = null;
let defaultClient = UpstoxClient.ApiClient.instance;
let apiVersion = "2.0";
let OAUTH2 = defaultClient.authentications["OAUTH2"];

// Function to authorize the market data feed
const getMarketFeedUrl = async () => {
  socketAccessToken = await client.get("SOCKET_ACCESS_TOKEN")
  OAUTH2.accessToken = socketAccessToken;
  return new Promise((resolve, reject) => {
    let apiInstance = new UpstoxClient.WebsocketApi(); // Create new Websocket API instance
    // Call the getMarketDataFeedAuthorize function from the API
    apiInstance.getMarketDataFeedAuthorize(
      apiVersion,
      (error, data, response) => {
        if (error) reject(error); // If there's an error, reject the promise
        else resolve(data.data.authorizedRedirectUri); // Else, resolve the promise with the authorized URL
      }
    );
  });
};

// Function to establish WebSocket connection
const connectWebSocket = async (io, wsUrl) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl, {
      headers: {
        "Api-Version": apiVersion,
        Authorization: "Bearer " + OAUTH2.accessToken,
      },
      followRedirects: true,
    });

    // WebSocket event handlers
    ws.on("open", async() => {
      console.log("connected");
      resolve(ws); // Resolve the promise once connected
      const data=await client.get("instrument_keys")
      keysData=JSON.parse(data);
      // console.log(keysData);
      // Set a timeout to send a subscription message after 1 second
      setTimeout(() => {
        const data = {
          guid: "someguid",
          method: "sub",
          data: {
            mode: "ltpc", //try putting ltpc here
            instrumentKeys: keysData,
          },
        };
        ws.send(Buffer.from(JSON.stringify(data)));
      }, 1000);
    });

    ws.on("close", () => {
      console.log("disconnected");
    });

    ws.on("message", (data) => {
      const parsedData = JSON.stringify(decodeProfobuf(data)); // Decode the protobuf message on receiving it
      const parsedObject = JSON.parse(parsedData);
      // console.log(parsedData);
      io.emit("market-data", parsedObject);
    });

    ws.on("error", (error) => {
      console.log("error:", error);
      reject(error); // Reject the promise on error
    });
  });
};

// Function to initialize the protobuf part
const initProtobuf = async () => {
  protobufRoot = await protobuf.load(__dirname + "/MarketDataFeed.proto");
  console.log("Protobuf part initialization complete");
};

// Function to decode protobuf message
const decodeProfobuf = (buffer) => {
  if (!protobufRoot) {
    console.warn("Protobuf part not initialized yet!");
    return null;
  }

  const FeedResponse = protobufRoot.lookupType(
    "com.upstox.marketdatafeeder.rpc.proto.FeedResponse"
  );
  return FeedResponse.decode(buffer);
};

// Initialize the protobuf part and establish the WebSocket connection
export const initializeMarketFeed = async () => {



  try {
    await initProtobuf(); // Initialize protobuf
    const wsUrl = await getMarketFeedUrl(); // Get the market feed URL
    await connectWebSocket(io, wsUrl); // Connect to the WebSocket
    console.log("web socket connected");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
initializeMarketFeed()
