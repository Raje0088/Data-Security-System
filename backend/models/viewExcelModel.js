const mongoose = require("mongoose")

const viewExcelSchema = new mongoose.Schema({
    userId_db: String,
    assignTo_db:{type:String,default:"NA"},
    assignBy_db:{type:String,default:"NA"},
    excelURL_db: String,
    date_db: String,
    time_db: String,
    total_db: Number,
    dumpBy_db: String,
    excel_title_db:String,
}, { timestamps: true })

const viewExcelModel = mongoose.model("viewExcelmodel", viewExcelSchema)

module.exports = { viewExcelModel }