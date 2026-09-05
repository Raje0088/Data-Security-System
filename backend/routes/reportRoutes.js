const {generateReport, dataReport, progressReport, paymentReport} = require("../controllers/reportController")
const express = require("express")
const router = express.Router()

router.get("/data",generateReport)
router.get("/progress",progressReport)
router.get("/payment",paymentReport)
router.get("/download-pdf",dataReport)
module.exports = router