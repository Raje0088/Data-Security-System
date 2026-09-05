const express = require("express")
const router = express.Router();
const {createHistory,getHistory,getLastUpdatedClientHistory} = require("../controllers/historyMaintainController")

router.post("/create-history",createHistory)

//fetch total history records of client 
router.get("/get-client-history/:id",getHistory)

//fetch last update history records of client to display on screen of client page
router.get("/get-latest-clienthistory/:id",getLastUpdatedClientHistory)
module.exports = router