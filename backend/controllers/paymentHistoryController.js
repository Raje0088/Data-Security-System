const { paymentModel } = require("../models/paymentHistoryModel")

const createPaymentHistory = async (req, res) => {
    try {
        const { amountDetails, opticalName, mobile,tempRecoveryType, pincode, userId, clientId, clientName, quotationShare, product, stage } = req.body;
        console.log("amountDetails=================================",tempRecoveryType, stage, userId, amountDetails)

        const paymentDone = amountDetails.balanceAmount === 0
        let result
        if (stage === "Recovery") {
            result = await paymentModel.create({
                userId_db: userId,
                client_id: clientId,
                client_name_db: clientName,
                optical_name1_db: opticalName,
                mobile_1_db: mobile,
                pincode_db: pincode,
                quotationShare_db: quotationShare,
                product_db: product,
                stage_db: tempRecoveryType,
                recoveryType_db:stage,
                totalAmount_db: amountDetails.totalAmount,
                paidAmount_db: amountDetails.paidAmount,
                extraCharges_db: amountDetails.extraCharges,
                finalCost_db: amountDetails.finalCost,
                newAmount_db: amountDetails.newAmount,
                balanceAmount_db: amountDetails.balanceAmount,
                gst_db: amountDetails.gst,
                referenceId_db: amountDetails.referenceId,
                mode_db: amountDetails.mode,
                paymentDone_db: paymentDone,
                paymentId_db: stage === "Recovery" ? amountDetails.paymentId : Date.now(),

            })
        } else {
             result = await paymentModel.create({
                userId_db: userId,
                client_id: clientId,
                client_name_db: clientName,
                optical_name1_db: opticalName,
                mobile_1_db: mobile,
                pincode_db: pincode,
                quotationShare_db: quotationShare,
                product_db: product,
                stage_db: stage,
                totalAmount_db: amountDetails.totalAmount,
                paidAmount_db: amountDetails.paidAmount,
                extraCharges_db: amountDetails.extraCharges,
                finalCost_db: amountDetails.finalCost,
                newAmount_db: amountDetails.newAmount,
                balanceAmount_db: amountDetails.balanceAmount,
                gst_db: amountDetails.gst,
                referenceId_db: amountDetails.referenceId,
                mode_db: amountDetails.mode,
                paymentDone_db: paymentDone,
                paymentId_db: stage === "Recovery" ? amountDetails.paymentId : Date.now(),

            })
        }



        res.status(201).json({ message: "User Payment Save Successfully", result })
    } catch (err) {
        console.log("internal  error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const getPaymentDetailByProduct = async (req, res) => {
    try {
        const { product, clientId, stage, recoveryType, paymentId } = req.query;
        console.log("payment", req.query)

        let filters = {
            product_db: product,
            client_id: clientId,
        }

        // if (stage) {
        // }
        if (stage === "Recovery") {
            filters.stage_db = recoveryType
            // filters.recoveryType_db = recoveryType
            // filters.paymentId_db = paymentId
        }

        const lastPayment = await paymentModel.findOne(filters).sort({ updatedAt: -1 })

        // If no previous payment at all
        if (!lastPayment) {
            return res.status(200).json({
                allowNewEntry: true,
                message: `No previous payment exists for ${product}. You can create a new entry.`,
                lastPayment: null,
            });
        }

        // CASE 1: Previous payment is COMPLETED → ALLOW NEW ENTRY
        if (lastPayment.balanceAmount_db > 0) {
            return res.status(200).json({ allowNewEntry: false, message: `Amount left to recover ${lastPayment.balanceAmount_db} Rs for ${lastPayment.product_db}`, lastPayment })
        } else {
            return res.status(200).json({
                allowNewEntry: true,
                message: "Previous payment is completed. You can create a new entry.",
                lastPayment,
            });

        }

    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const getProductWisePaymentDetailOfClient = async (req, res) => {
    try {
        const { clientId } = req.query;

        const lastPayment = await paymentModel.aggregate([
            { $match: { client_id: clientId } },
            {$sort:{updatedAt:-1}},
            {
                $group: {
                    _id: "$paymentId_db",
                    doc: {$first: "$$ROOT"} ,

                }
            },{
                $match:{
                    "doc.balanceAmount_db":{$gt:0},
                }
            }
        ])
        const leftAmount = lastPayment.map((item)=> item.doc).map((doc)=>{
            return `Amount Left to pay ${doc.balanceAmount_db} Rs for ${doc.product_db}`
        }).join("\n")
        console.log("leftamount",leftAmount)
        res.status(200).json({ message: leftAmount  })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const getPaymentHistory = async (req, res) => {
    try {
        const clientId = req.params.id;
        const result = await paymentModel.find({ client_id: clientId })
        res.status(201).json({ message: "User Payment Receipt", result })
    } catch (err) {
        console.log("internal  error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

module.exports = { createPaymentHistory, getPaymentHistory, getPaymentDetailByProduct, getProductWisePaymentDetailOfClient }