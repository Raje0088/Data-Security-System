const mongoose = require("mongoose")

const userProgressSummarySchema = new mongoose.Schema({
    userId_db: String,
    date_db: String,
    product_db: String,

    new_data_db: {
        selfAssign: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        adminAssign: { type: Number, default: 0 },
    },

    new_calls_db: {
        selfAssign: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        adminAssign: { type: Number, default: 0 },
    },

    leads_db: {
        selfAssign: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        adminAssign: { type: Number, default: 0 },
    },

    demo_db: {
        selfAssign: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        adminAssign: { type: Number, default: 0 },
    },
    followUp_db: {
        selfAssign: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        adminAssign: { type: Number, default: 0 },
    },

    target_db: {
        selfAssign: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        adminAssign: { type: Number, default: 0 },
    },
    training_db: {
        selfAssign: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        adminAssign: { type: Number, default: 0 },
    },
    installation_db: {
        selfAssign: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        adminAssign: { type: Number, default: 0 },
    },


    recovery_db: {
        selfAssign: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        adminAssign: { type: Number, default: 0 },
    },

    support_db: {
        selfAssign: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        adminAssign: { type: Number, default: 0 },
    },

}, { timestamps: true })

const userProgressSummaryModel = mongoose.model("userProgressSummaryModel", userProgressSummarySchema)

module.exports = { userProgressSummaryModel }