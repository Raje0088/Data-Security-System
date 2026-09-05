const express = require("express");
const app = express();
const os = require("os");
const bodyParser = require('body-parser');
const http = require("http")
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require("morgan") 
const connectDB = require("./config/db.js")
const agenda = require("./jobs/reminderJobs.js")
const path = require("path");
const paths = require("./utils/assetPath.js")
const cookieParser = require("cookie-parser")
const { connectRedis, client } = require("./config/redis.js")
 
const { autoAploadPincodeJsonData } = require("./ZDUMPING/pincodeController.js")
const createSuperAdmin = require("./controllers/seedController.js")
const userRoutes = require("./routes/userRoutes.js");
const settingRoutes = require("./routes/settingRoutes.js")
const pincodeRoutes = require("./routes/pincodeRoute.js")
const clientRoutes = require("./routes/clientRoutes.js");
const rawDataRoutes = require("./routes/rawDataRoutes.js") 
const historyMaintainRoutes = require("./routes/historyMaintainRoutes.js")
const taskAssignRoutes = require("./routes/taskAssignRoutes.js")
const utilsRoutes = require("./routes/utilsRoutes.js")
const scheduleOptimaRoutes = require("./routes/scheduleOptimaRoutes.js")
const clientSubscriptionRoutes = require("./routes/clientSubscriptionRoutes.js")
const userPrgressSummaryRoutes = require("./routes/userProgressSummaryRoutes.js")
const viewExcelRoutes = require("./routes/viewExcelRoutes.js")
const LoginRoutes = require("./routes/LoginRoutes.js")
const autoBackupRoutes = require("./routes/autoBackupRoutes.js")
const remainderRoutes = require("./routes/remainderRoutes.js")
const paymentHistoryRoutes = require("./routes/PaymentHistoryRoutes.js")
const reportRoutes = require("./routes/reportRoutes.js")
const messageRoutes = require("./routes/messageRoutes.js")

const { initializeSocket } = require("./socketio/socketio.js")
const { startRemainder } = require("./controllers/remainderController.js")





 
dotenv.config();
app.use(morgan("dev"));

// app.set("trust proxy", 1);
app.use(cors({
  origin: ["http://localhost:5173", "http://192.168.1.100:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
// VERY IMPORTANT for preflight 
// app.options("*", cors());


// app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(express.json());
const server = http.createServer(app);


// Serve React build
// ✅ Serve frontend build (React dist)
app.use(express.static(paths.dist));

// ✅ Serve external folders
app.use("/uploadExcel", express.static(paths.uploadExcel));
app.use("/sampleFile", express.static(paths.sampleFile));


app.use("/users", userRoutes)
app.use("/setting", settingRoutes)
app.use("/pincode", pincodeRoutes)
app.use("/clients", clientRoutes)
app.use("/raw-data", rawDataRoutes)
app.use("/history", historyMaintainRoutes)
app.use("/task", taskAssignRoutes)
app.use("/utils", utilsRoutes)
app.use("/schedule", scheduleOptimaRoutes) 
app.use("/subscribe-user", clientSubscriptionRoutes)
app.use("/progress", userPrgressSummaryRoutes)
app.use("/view-excel", viewExcelRoutes)
app.use("/auth", LoginRoutes)
app.use("/backup", autoBackupRoutes)
app.use("/remainders", remainderRoutes)
app.use("/payment", paymentHistoryRoutes)
app.use("/report", reportRoutes)
app.use("/msg", messageRoutes)
// app.use(express.static('uploadExcel'))  

connectDB();
async function redisFun() {
  await connectRedis();
}
redisFun();



autoAploadPincodeJsonData();
createSuperAdmin() //DEFAULT USER CREATED
const io = initializeSocket(server);  // Initialize socket.io

const { setIO } = require("./socketio/socketInstance.js")
setIO(io);
startRemainder()

setTimeout(() => {
  const { getIO } = require("./socketio/socketInstance");
  const io = getIO();
  io.to("testHaiBhai").emit("taskAssigned", {
    message: "🎯 Manual test notification",
  });
  console.log("✅ Manual test emitted");
}, 5000);


app.use((req, res) => {
  res.sendFile(path.join(paths.dist, "index.html"));
});

const { rawDataModel } = require("./models/rawDataModel")
const { clientModel } = require("./models/clientModel")
const { clientSubscriptionModel } = require("./models/clientSubscriptionModel");
const { pinCodeModel } = require("./models/dumpIndiaData.js");
const { filterArea } = require("./utils/filterArea.js")

 
filterArea()

const a = async () => {
  const rs = await pinCodeModel.distinct("pincode_db", { state_db: "MAHARASHTRA" })
  // const rs = await pinCodeModel.find({state_db:"MAHARASHTRA",district_db:"MUMBAI"}).sort({pincode_db:1})
}

// a() 

function getActiveLANIP() {
  const interfaces = os.networkInterfaces();

  // priority: Ethernet > Wi-Fi > others
  const priority = ["ethernet", "wi-fi", "wlan"];

  for (const p of priority) {
    for (const name of Object.keys(interfaces)) {
      if (name.toLowerCase().includes(p)) {
        for (const iface of interfaces[name]) {
          if (iface.family === "IPv4" && !iface.internal) {
            return iface.address;
          }
        }
      }
    }
  }

  // fallback: first IPv4 non-internal
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  return "127.0.0.1"; // fallback
}

const localIP = getActiveLANIP(); 

server.listen(3000, '0.0.0.0', async function () {
  console.log("server running on port 3000")
  // console.log(`Server LAN IP: http://${localIP}:3000`);
  console.log(`Access from LAN: http://192.168.1.102:3000`);

  await agenda.start()
})

async function graceful() {
  await agenda.stop();
  process.exit(0);
}
process.on('SIGTERM', graceful)
process.on('SIGINT', graceful)