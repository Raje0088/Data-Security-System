const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({
    paymentId_db:String,
    userId_db: String,
    client_id: { type: String },
    client_name_db: String,
    optical_name1_db: { type: String, required: true },
    mobile_1_db: { type: String, required: true },
    quotationShare_db: String,
    stage_db: String,
    recoveryType_db: String,
    product_db: { type: String },
    pincode_db: String,
    gst_db: String,
    referenceId_db: String,
    mode_db: String,
    totalAmount_db: { type: Number, default: 0 },
    paidAmount_db: { type: Number, default: 0 },
    extraCharges_db: { type: Number, default: 0 },
    finalCost_db: { type: Number, default: 0 },
    newAmount_db: { type: Number, default: 0 },
    balanceAmount_db: { type: Number, default: 0 },
    paymentDone_db:{type:Boolean, default :false},
}, { timestamps: true })

const paymentModel = mongoose.model("paymentModel", paymentSchema)

module.exports = { paymentModel }