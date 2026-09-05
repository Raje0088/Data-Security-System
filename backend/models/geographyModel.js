const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
    country_db:{type:String},
},{timestamps:true})

const stateSchema = new mongoose.Schema({
    state_db:{type:String},
    countryId_db:{type:mongoose.Schema.Types.ObjectId, ref: "countryModel", required:true}
})

const districtSchema = new mongoose.Schema({
    district_db:{type:String},
    stateId_db:{type:mongoose.Schema.Types.ObjectId, ref:"stateModel", required:true}
})

const pincodeSchema = new mongoose.Schema({
    code:{type:String},
    districtId_db:{type:mongoose.Schema.Types.ObjectId, ref:"districtModel"}
})

stateSchema.index({ countryId_db: 1 })
districtSchema.index({ stateId_db: 1 })
pincodeSchema.index({ districtId_db: 1 })
pincodeSchema.index({ code: 1 })


const countryModel = mongoose.model("countryModel", countrySchema)
const stateModel = mongoose.model("stateModel", stateSchema)
const districtModel = mongoose.model("districtModel", districtSchema)
const pincodeModel = mongoose.model("pincodeModel", pincodeSchema)

module.exports = {countryModel, stateModel, districtModel, pincodeModel}