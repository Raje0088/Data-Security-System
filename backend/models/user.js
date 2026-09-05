const mongoose = require("mongoose");

const pincodeSchema = new mongoose.Schema({
    code: { type: String },
    clientIds: { type: [String] }
})

const districtSchema = new mongoose.Schema({
    districtName: { type: String },
    totalDistCnt: { type: Number, default: 0 },
    pincodes: [pincodeSchema],
})

const stateSchema = new mongoose.Schema({
    stateName: { type: String },
    totalCnt: { type: Number, default: 0 },
    districts: [districtSchema]
})
const productSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "assignProductModel" },
    productName: { type: String },
    permission: {
        update_P: { type: Boolean, default: false },
        delete_P: { type: Boolean, default: false },
        edit_P: { type: Boolean, default: false },
        view_P: { type: Boolean, default: false },
    },
    region: [stateSchema],
})

const UserSchema = new mongoose.Schema({
    roleName: String,
    roleType: { type: String, enum: ["Superadmin", "Admin", "Executive"] },
    name: String,
    mobile: String,
    division: { type: Array },
    email: String,
    assignProduct: { type: Array },
    generateUniqueId: { type: String, unique: true },
    createdBy: String,
    updatedBy: String,
    create_P: { type: Boolean, default: false },
    update_P: { type: Boolean, default: false },
    delete_P: { type: Boolean, default: false },
    edit_P: { type: Boolean, default: false },
    view_P: { type: Boolean, default: false },
    uploadFile_P: { type: Boolean, default: false },
    download_P: { type: Boolean, default: false },
    userID: String,
    password: String,
    isActive: { type: String, enum: ["Active", "Deactive"], default: "Active" },
    master_data_db: {
        excelId: {
            title: String,
            excelId: String,
        },
        productPermissions: [productSchema],
    },
      refreshToken: String,
}, { timestamps: true });

const userHistorSchema = new mongoose.Schema({
    userHistory: { type: Object },
})

const UserModel = mongoose.model("UserModel", UserSchema);
const userHistorModel = mongoose.model("userHistorModel", userHistorSchema);

module.exports = { UserModel, userHistorModel }; 
