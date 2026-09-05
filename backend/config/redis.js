// import { createClient } from 'redis';
const { createClient } = require("redis")
const dotenv = require("dotenv")
dotenv.config()

let isConnected = false;

const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    }
});

client.on("connect", () => console.log("🔌 Redis socket connected"));
client.on("error", (err) => console.error("❌ Redis Client Error:", err.message));
client.on("end", () => console.log("⚠️ Redis connection closed"));

async function connectRedis() {
    try {
        if (!client.isOpen) { // <- critical: check socket open
            await client.connect();
        }
        console.log("✅ Redis ready for operations");
    } catch (err) {
        console.error("🚨 Redis connection failed:", err.message);
    }
}


// (async () => {
//   try {
//     // 1️⃣ Connect Redis once 
//     await connectRedis();
//     console.log("✅ Redis ready for operations");

//     // 2️⃣ Fetch data from Mongo
//     const raw = await pinCodeModel.find();
//     console.log("Mongo records:", raw.length);

//     // 3️⃣ Store in Redis in chunks safely
//     const chunkSize = 500; // smaller than before
//     const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

//     for (let i = 0; i < raw.length; i += chunkSize) {
//       const chunk = raw.slice(i, i + chunkSize);
//       try {
//         await client.set(`raju:${i / chunkSize}`, JSON.stringify(chunk));
//         await delay(50); // small pause to avoid overwhelming socket
//       } catch (err) {
//         console.error("Redis set failed for chunk", i / chunkSize, err);
//       }
//     }

//     // 4️⃣ Verify Redis by getting one chunk
//     try {
//       const d = await client.get("raju"); // read first chunk only
//       if (d) {
//         const parsed = JSON.parse(d);
//         console.log("Redis stored first chunk length:", parsed);
//       } else {
//         console.log("No data found in Redis for chunk 0");
//       }
//     } catch (err) {
//       console.error("Redis get failed:", err);
//     }

//     console.log("✅ Redis chunked storage completed");

//   } catch (err) {
//     console.error("Redis connection failed:", err);
//   }
// })();


module.exports = { client, connectRedis }

