const { parentPort, workerData } = require("worker_threads");
const axios = require("axios");
// const client  = require("./lib/redis");
const Redis = require("ioredis");
const client = new Redis(
    "rediss://default:AYVRAAIncDFhYWIyNWI1ZjAxMTQ0ZGNlOWU0OTI5NTY2ZGI5NmQxNHAxMzQxMjk@on-grouper-34129.upstash.io:6379"
  );


const tb_config = {
  method: "get",
  maxBodyLength: Infinity,
  url: "https://api.upstox.com/v2/order/trades/get-trades-for-day",
  headers: {
    Accept: "application/json",
    "Api-Version": "2.0",
    Authorization: `Bearer ${workerData.workerData}`,
  },
};


var tb = [], ntb = []
var ptbl = 0, ntbl = 0;

async function fetchData() {
    try {
      const redisData1=await client.get(workerData.workerData);
      let parsedRD1
      if(redisData1){
          parsedRD1=JSON.parse(redisData1)
          console.log(parsedRD1)
      }
    tb=parsedRD1?.tb || []
    ptbl=parsedRD1?.ptbl || 0
    

    const response = await axios(tb_config);
    ntb = response.data.data;
    ntbl = ntb.length;
    // console.log("trade book: ",JSON.stringify(ntb),"\n", "tradebook length: ",ntbl,"\n\n" );
    console.log("fetched")
    let d = ntbl - ptbl;
    const d2=d

    if (d2) {
      for (let i = 0; i < d2; i++) {
        //execute trade on child account

        console.log(
          "\n\n\n\n Execute: ",
          JSON.stringify(ntb[ntbl - d]),
          "\n\n\n\n"
        );
        d--;
      }
    }
    tb = ntb;
    ptbl = ntbl; // ||
    const redisData=await client.get(workerData.workerData);
    if(redisData){
        // console.log(redisData)
        const parsedRD=JSON.parse(redisData)
        const newRedisData={
            tb,
            ptbl,
            threadId:parsedRD?.threadId || 1
        }
        // redisData.tradeBook=ntb
        await client.set(workerData.workerData, JSON.stringify(newRedisData)); // set current trades in redis so that we can compare them with new trades in future
    }else{
        const newRedisData={
            tb,
            ptbl,
            threadId:1
        }
        // redisData.tradeBook=ntb
        await client.set(workerData.workerData, JSON.stringify(newRedisData));
    }
  } catch (error) {
    console.log(error);
  } finally {
    // Schedule the next execution
    setTimeout(fetchData, 1000);
  }
}

async function main() {
  // Start the fetch loop
  fetchData();

  // Optional: Listen for a 'stop' message to terminate the worker
  parentPort?.on("message", (message) => {
    if (message === "stop") {
      process.exit(0);
    }
  });
}

main();
