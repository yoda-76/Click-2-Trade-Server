import Redis from "ioredis";

export const client = new Redis(
  "rediss://default:AYVRAAIncDFhYWIyNWI1ZjAxMTQ0ZGNlOWU0OTI5NTY2ZGI5NmQxNHAxMzQxMjk@on-grouper-34129.upstash.io:6379"
);

// const userID = {
//   threadId: 1,
//   tradeBook: [],
//   tradeBookLength: 0,
//   active-child: [uid]
// };
