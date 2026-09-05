const { viewExcelModel } = require("../models/viewExcelModel")
const { UserModel } = require("../models/user")

const getTrackerUserToDumpExcel = async (req, res) => {
    try {

        const result = await viewExcelModel.find().sort({ date_db: 1 })
        res.status(200).json({ message: `excel import by users`, result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const recordTracker = async (req, res) => {
    try {
        const { recordTracker, userId } = req.body;
        console.log("recordtracker", recordTracker, userId)
        const result = await viewExcelModel.findOneAndUpdate(
            { userId_db: userId },
            {
                $push: {
                    record_tracker_db: recordTracker
                }
            },
            { new: true, upsert: true }
        )
        console.log("data updated successfully", result)
        res.status(200).json({ message: `Data successfully updated by ${userId}. Total Record - ${recordTracker.totalCount_db} MergeId-${recordTracker.mergeId_db} deleted Count - ${recordTracker.deletedCount_db}`, result })
    } catch (err) {
        console.log("internal  error", err)
        res.status(500).json({ message: "internal  error", err: err.message })
    }
}

//In SEARCH PAGE GET ALL DUMPY EXCEL SHEET NAME 
const getExcelRecord = async (req, res) => {
    try {
        const { dateFrom, dateTo, district, state, userId, page, assignTo, roleType } = req.query
        console.log("sdfasfd", req.query,)
        const pageNum = Number(page)
        const limit = 100;
        const skip = (pageNum - 1) * limit;

        let filters = {}

        if (roleType === "Executive") {
            filters.assignTo_db = assignTo
        }

        if (dateFrom && dateTo) {
            filters.date_db = { $gte: dateFrom, $lte: dateTo };  // combine both
        } else if (dateFrom) {
            filters.date_db = { $gte: dateFrom };
        } else if (dateTo) {
            filters.date_db = { $lte: dateTo };
        }

        if (district) filters.excel_title_db = district
        if (state) filters.excel_title_db = state
        if (userId) filters.userId_db = userId
        const result = await viewExcelModel.find(filters).sort({ date_db: 1 })
        console.log("excel", result)
        res.status(200).json({
            message: `excel import by users`,
            page: Number(page),
            totalCount: result.length,
            limit,
            result,
            db: "Excel",
        })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const getAllExcelSheetRecord = async (req, res) => {
    try {
        const { assign } = req.query;
        let result

        console.log("assign", assign)
        if (assign === "true") {
            result = await viewExcelModel.find({ assignTo_db: { $ne: "NA" } })
        } else if (assign === "false") {
            result = await viewExcelModel.find({ assignTo_db: "NA" })
        } else {
            result = await viewExcelModel.find()
        }
        res.status(200).json({ message: "Excel Id Found", result })
    } catch (err) {
        console.log('internal error', err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const updateAssignExcelToUser = async (req, res) => {
    try {
        const { title, excelId, assignTo, assignBy } = req.query;
        console.log("excel============",req.query)
        const alreadyAssignUser = await viewExcelModel.findOne({assignTo_db:assignTo})
        if(alreadyAssignUser) return res.status(409).json({message:`${alreadyAssignUser.assignTo_db} has already assigned ${alreadyAssignUser.excel_title_db} Excelsheet`})
       
            const result = await viewExcelModel.updateOne({ dumpBy_db: excelId },
            {
                $set: {
                    assignTo_db: assignTo,
                    assignBy_db: assignBy,
                }
            },
            {
                new: true,
            }
        )
        const userId = assignTo.split("-")[0].trim()
        console.log(":rer", userId, excelId)
        const userEx = await UserModel.updateOne({ generateUniqueId: userId },
            {
                "master_data_db.excelId": {
                    title,
                    excelId
                }
            },
            {
                new: true,
            }
        )
        console.log("userEx", userEx)
        res.status(200).json({ message: `Excel Successfully Assign to ${assignTo}` })
    } catch (err) {
        res.status(500).json({ message: "internal error", err: err.message })
        console.log("internal error", err)
    }
}


module.exports = { getTrackerUserToDumpExcel, updateAssignExcelToUser, recordTracker, getExcelRecord, getAllExcelSheetRecord }