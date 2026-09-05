
const mongoose = require("mongoose")


const clientSchema = new mongoose.Schema({
    client_serial_no_id: { type: String, unique: true },
    client_id: { type: String, unique: true },
    userId_db: String,
    client_visiting_id: String,
    optical_name1_db: { type: String, required: true },
    optical_name2_db: { type: String, required: false, default: "" },
    optical_name3_db: { type: String, required: false, default: "" },
    client_name_db: String,
    address_1_db: { type: String, required: false },
    address_2_db: { type: String, required: false, default: "" },
    address_3_db: { type: String, required: false, default: "" },
    district_db: String,
    state_db: String,
    pincode_db: String,
    mobile_1_db: { type: String, required: true },
    mobile_2_db: { type: String, required: false, default: "" },
    mobile_3_db: { type: String, required: false, default: "" },
    email_1_db: { type: String, required: false },
    email_2_db: { type: String, required: false, default: "" },
    email_3_db: { type: String, required: false, default: "" },
    followup_db: String,
    website_db: String,
    remarks_db: String,
    quotationShare_db: String,
    callType_db: { type: String, default: "out-bound" },
    expectedDate_db: String,
    verifiedBy_db: { type: String, default: "" },
    stage_db: { type: Array },
    product_db: { type: Array },
    country_db: { type: String, default: "INDIA" },
    time_db: String,
    date_db: String,
    isActive_db: { type: Boolean, default: true },
    isSubscriber_db: { type: Boolean, default: false },
    label_db: String,
    shopType_db:{type:String, default:"Retail"}, 
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
    assignBy: {
        type: String,
    },
    assignTo: {
        type: String,
    },
    action_db: String,
    database_status_db: {
        type: String,
        enum: ["Client", "Raw", "User"],
        default: "Client",
    },
    completion_db: {
        receivedProduct: String,
        status: String,
        newExpectedDate: String,
        newTime: String,
        newRemark: String,
        newStage: String,
    },
    amountDetails_db: {
        totalAmount: { type: Number, default: 0, set: v => v == null ? 0 : v },
        paidAmount: { type: Number, default: 0, set: v => v == null ? 0 : v },
        extraCharges: { type: Number, default: 0, set: v => v == null ? 0 : v },
        finalCost: { type: Number, default: 0, set: v => v == null ? 0 : v },
        newAmount: { type: Number, default: 0, set: v => v == null ? 0 : v },
        balanceAmount: { type: Number, default: 0, set: v => v == null ? 0 : v },
        gst: String,
        referenceId: String,
        mode: String,
        paymentId: String,
    },
    master_data_db: {
        assignTo: { type: String, default: "" },
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
    },
    
}, { timestamps: true })

clientSchema.index({ isActive_db: 1 })
clientSchema.index({ assignTo: 1, optical_name1_db: 1, mobile_1_db: 1, email_1_db: 1, pincode_db: 1, address_1_db: 1 })

clientSchema.index({ date_db: 1 });


const clientModel = mongoose.model("clientmodel", clientSchema);


module.exports = { clientModel } 