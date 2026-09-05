const mongoose = require("mongoose")

const remainderSchema = new mongoose.Schema({
    client_id:String,
    userId_db:String,
    client_name_db:String,
    product_db:String,
    stage_db:String,
    date_db:String,
    time_db:String,
    status_db:{type:Boolean, default:false},
    operation_db:{type:String, default:"Schedule"},
    database_db:String,
    taskId_db:String,
})

const remainderModel = mongoose.model("remainderModel",remainderSchema)
module.exports = {remainderModel}