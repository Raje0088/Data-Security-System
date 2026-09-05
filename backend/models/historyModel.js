const mongoose = require("mongoose")


const clientHistorySchema = new mongoose.Schema({
    client_serial_no_id: { type: String },
    client_id: { type: String },
    client_subscription_id: { type: String },
    userId_db: String,
    client_History_id: String, // this field added only
    client_visiting_id: Number,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    client_name_db: String,
    optical_name1_db: { type: String, required: true },
    optical_name2_db: { type: String, required: false, default: "" },
    optical_name3_db: { type: String, required: false, default: "" },
    address_1_db: { type: String, required: false },
    address_2_db: { type: String, required: false, default: "" },
    address_3_db: { type: String, required: false, default: "" },
    mobile_1_db: { type: String, required: true },
    mobile_2_db: { type: String, required: false, default: "" },
    mobile_3_db: { type: String, required: false, default: "" },
    email_1_db: { type: String, required: false },
    email_2_db: { type: String, required: false, default: "" },
    email_3_db: { type: String, required: false, default: "" },
    district_db: String,
    state_db: String,
    pincode_db: String,
    country_db: { type: String, default: "INDIA" },
    followup_db: String,
    website_db: String,
    remarks_db: String,
    quotationShare_db: String,
    callType_db: { type: String, default: "out-bound" },
    expectedDate_db: String,
    verifiedBy_db: { type: String, default: "" },
    stage_db: { type: Array },
    product_db: { type: Array },
    time_db: String,
    date_db: String,
    isActive_db: { type: Boolean, default: true },
    isSubscriber_db: { type: Boolean, default: false },
    totalAmount: Number, 
    paidAmount: Number,
    tracking_db: {
        new_data_db: { completed: { type: Boolean, default: false }, },
        leads_db: { completed: { type: Boolean, default: false }, },
        training_db: { completed: { type: Boolean, default: false }, },
        followUp_db: { completed: { type: Boolean, default: false }, },
        installation_db: { completed: { type: Boolean, default: false }, },
        demo_db: { completed: { type: Boolean, default: false }, },
        amc_db: { completed: { type: Boolean, default: false }},
        recovery_db: { completed: { type: Boolean, default: false }},
        target_db: { completed: { type: Boolean, default: false },},
        new_calls_db: { completed: { type: Boolean, default: false }, },
        support_db: { completed: { type: Boolean, default: false }, },
    },
    label_db: String,
    shopType_db:{type:String, default:"Retail"},
    completion_db: {
        receivedProduct: String,
        status: String,
        newExpectedDate: String,
        newTime: String,
        newRemark: String,
        newStage: String,
    },
    amountDetails_db: {
        paidDate: { type: String },
        totalAmount: { type: Number, default: 0 },
        paidAmount: { type: Number, default: 0 },
        extraCharges: { type: Number, default: 0 },
        finalCost: { type: Number, default: 0 },
        newAmount: { type: Number, default: 0 },
        balanceAmount: { type: Number, default: 0 },
        gst: String,
        referenceId: String,
        mode: String,
        paymentId: String,
    },


    assignBy: {
        type: String,
    },
    assignTo: {
        type: String,
    },
    action_db: String,
    database_status_db: String,
    taskId_db:String,
    master_data_db: {
        userId: String,
        excelId: { type: String },
        state: { type: [String], default: [] },
        district: [{ name: String, total: Number }],
        pincode: { type: [String], default: [] },
        clientIds: { type: [String], default: [] },
    },
    additional_db: {
        invalidNumber: { type: Boolean, default: false },
        callCut: { type: Boolean, default: false },
        callBusy: { type: Boolean, default: false },
        softwareAlreadyUsing: { type: Boolean, default: false },
        notRequire: { type: Boolean, default: false },
        callLater: { type: Boolean, default: false },
        seniorWillCall: { type: Boolean, default: false },
        shopClose: { type: Boolean, default: false },
    }
}, { timestamps: true })

clientHistorySchema.index({ isActive_db: 1 })
clientHistorySchema.index({ assignTo: 1, optical_name1_db: 1, mobile_1_db: 1, email_1_db: 1, pincode_db: 1, address_1_db: 1 })
clientHistorySchema.index({ date_db: 1 });
clientHistorySchema.index({ expectedDate_db: 1 });
clientHistorySchema.index({ "completion_db.newExpectedDate": 1 });
clientHistorySchema.index({ "completion_db.status": 1 });



const clientHistoryModel = mongoose.model("clientHistoryModel", clientHistorySchema)

module.exports = { clientHistoryModel }