const express = require("express")
const router = express.Router();
const {createPaymentHistory,getPaymentDetailByProduct,getPaymentHistory,getProductWisePaymentDetailOfClient }= require("../controllers/paymentHistoryController")

router.post("/history",createPaymentHistory)
router.get("/receipt/:id",getPaymentHistory)
router.get("/payment-details",getPaymentDetailByProduct)
router.get("/client-payment-record",getProductWisePaymentDetailOfClient)

module.exports = router;