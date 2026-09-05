const { clientHistoryModel } = require("../models/historyModel")
const { remainderModel } = require("../models/remainderModel")
const cron = require("node-cron")
const { getIO } = require("../socketio/socketInstance");
const agenda = require("../jobs/agenda")
const { getDateAndTime } = require("../utils/getLocalTimeAndDate")




const startRemainder = async (data) => {
    try {
        const date = new Date().toISOString().split("T")[0]
        let result;
        let shouldEmit = true;

        if (data && data.stage_db && data.product_db && data.time_db && data.expectedDate_db) {
            // for (const stage of stages) {

            await Promise.all(data.stage_db.map(async (stg) => {

                const isExist = await remainderModel.findOne({
                    client_id: data.client_id,
                    product_db: data?.product_db[0]?.label,
                    stage_db: stg.label,
                    date_db: data.expectedDate_db,
                })

                if (isExist) {
                    shouldEmit = false;
                    return console.log("isExist------");
                } else {
                    result = await remainderModel.create({
                        client_id: data.client_id,
                        client_name_db: data.client_name_db,
                        product_db: data.product_db[0].label,
                        stage_db: stg.label,
                        date_db: data.expectedDate_db, 
                        time_db: data.time_db,
                        operation_db: "Schedule",
                        database_db: data.database_status_db,
                        status_db: false,
                        userId_db: data.userId_db,
                        taskId_db:data.taskId_db
                    })
                    shouldEmit = true;
                    console.log("remainder create")
                    const [hhStr, mmStr, secStr] = data.time_db.split(":")
                    let hh = parseInt(hhStr)
                    const mm = parseInt(mmStr)
                    const [second, period] = secStr.split(" ")
                    let ss = parseInt(second)

                    if (period === "PM" && hh < 12) {
                        hh = hh + 12
                    }
                    const [year, month, day] = data.expectedDate_db.split("-")
                    const remindAt = new Date(year, month - 1, day, hh, mm, ss)
                    await agenda.schedule(new Date(remindAt), 'send-reminder', {
                        assignTo: data.userId_db,
                        message: `!Alert, This is reminder of  ${data.client_id} for ${stg.label} `
                    })
                }
            }))

        }

        if (data && (data.completion_db.newStage || (data.completion_db.newExpectedDate && data.completion_db.newTime))) {
            if (data.completion_db.status === "Postponed") {
                result = await remainderModel.findOneAndUpdate(
                    {
                        client_id: data.client_id,
                        stage_db: data.completion_db.newStage,
                        product_db: data.completion_db.receivedProduct,
                        // date_db: date
                         status_db: false
                    },
                    {
                        $set: {
                            client_id: data.client_id,
                            status_db: false,
                            date_db: data.completion_db.newExpectedDate,
                            time_db: data.completion_db.newTime,
                            operation_db: "Reschedule",
                            userId_db: data.userId_db,
                            taskId_db:data.taskId_db,
                        }
                    },
                    {
                        new: true,
                    }).sort({ _id: -1 })

                if (!data.completion_db.newTime) {
                    console.log("newTime", data.completion_db.newTime)
                    return
                }

                const [hhStr, mmStr, secStr] = data.completion_db.newTime.split(":")
                let hh = parseInt(hhStr)
                const mm = parseInt(mmStr)
                const [second, period] = secStr.split(" ")
                let ss = parseInt(second)

                if (period === "PM" && hh < 12) {
                    hh = hh + 12
                }
                const [year, month, day] = data.completion_db.newExpectedDate.split("-")
                const remindAt = new Date(year, month - 1, day, hh, mm, ss)
                await agenda.schedule(new Date(remindAt), 'send-reminder', {
                    assignTo: data.userId_db,
                    message: `!Reminder alert, Client ${data.client_id} has ${data.completion_db.newStage} `
                })
                  console.log("remainder posponed")
            } else if (data.completion_db.status === "Cancel") {
                result = await remainderModel.findOneAndUpdate(
                    {
                        client_id: data.client_id,
                        stage_db: data.completion_db.newStage,
                        product_db: data.completion_db.receivedProduct,
                        // date_db: date
                        status_db: false
                    },
                    {
                        $set: {
                            client_id: data.client_id,
                            status_db: true,
                            userId_db: data.userId_db,
                            operation_db: "Cancel",
                        }
                    },
                    {
                        new: true,
                    }).sort({ _id: -1 })
            } else if (data.completion_db.status === "Done") {
                result = await remainderModel.findOneAndUpdate(
                    {
                        client_id: data.client_id,
                        stage_db: data.completion_db.newStage,
                        product_db: data.completion_db.receivedProduct,
                        // date_db: date
                        status_db: false
                    },
                    {
                        $set: {
                            status_db: true,
                            userId_db: data.userId_db,
                            operation_db: "Completed",
                        }
                    },
                    {
                        new: true,
                    }).sort({ _id: -1 })
                // console.log(" WE ARE IN DONE REMAINDER===>", result)
            }
        }
        if (!shouldEmit) {
            return;
        }
        // console.log("remainder length", result)
        const io = getIO()
        io.to(`userRoom:${data?.userId_db}`).emit("userRemainder", result);
        io.to("ADMIN").emit("adminReminder", result)
        io.to("SUPERADMIN").emit("superadminReminder", result)
        // console.log("reminder", remainders) 
    } catch (err) {
        console.log("internal error", err)
    }
}

// const startRemainder = () => {
//     cron.schedule("* * * * *", async () => {
//         try {
//             const date = new Date().toISOString().split("T")[0]
//             console.log("reminder date", new Date().toLocaleDateString("en-GB"))
//             const stages = [
//                 { db: "follow_up_db", label: "FollowUp" },
//                 { db: "hot_db", label: "Hot" },
//                 { db: "installation_db", label: "Installation" },
//                 { db: "demo_db", label: "Demo" },
//                 { db: "training_db", label: "Training" },
//                 { db: "support_db", label: "Support" },
//                 { db: "recovery_db", label: "Recovery" },
//             ];



//             for (const stage of stages) {
//                 const docs = await clientHistoryModel.find({ expectedDate_db: { $gte: date }, "stage_db.value": stage.db, })
//                 await Promise.all(docs.map((doc) => (
//                     remainderModel.findOneAndUpdate(
//                         { client_id: doc.client_id, stage_db: stage.label, date_db: doc.expectedDate_db },
//                         {
//                             $set: {
//                                 client_id: doc.client_id,
//                                 client_name_db: doc.client_name_db,
//                                 stage_db: stage.label,
//                                 date_db: doc.expectedDate_db,
//                                 time_db: doc.time_db,
//                                 operation_db: "Schedule",
//                                 database_db: doc.database_status_db,
//                                 status_db: false,
//                                 userId_db: doc.assignTo,
//                             }
//                         },
//                         {
//                             new: true, upsert: true,
//                         }
//                     )
//                 )))
//             }

//             for (const stage of stages) {
//                 const docs = await clientHistoryModel.find({ "completion_db.newExpectedDate": { $gte: date }, "completion_db.status": "Postponed", "completion_db.newStage": stage.label })
//                 await Promise.all(docs.map((doc) => (
//                     remainderModel.findOneAndUpdate(
//                         { client_id: doc.client_id, stage_db: stage.label },
//                         {
//                             $set: {
//                                 client_id: doc.client_id,
//                                 client_name_db: doc.client_name_db,
//                                 stage_db: stage.label,
//                                 operation_db: "Reschedule",
//                                 time_db: doc.completion_db.newTime,
//                                 date_db: doc.completion_db.newExpectedDate,
//                                 database_db: doc.database_status_db,
//                                 status_db: false,
//                                 userId_db: doc.assignTo,
//                             }
//                         },
//                         {
//                             new: true, upsert: true,
//                         })
//                 )))
//             }

//             const results = await clientHistoryModel.find({ "completion_db.status": "Done", date_db: date })

//             console.log(" client history found from Reminder", results.length, date);
//             if (!results) {
//                 console.log("No matching client history found");
//                 return;
//             } 
//             for (const result of results) {
//                 await remainderModel.findOneAndUpdate(
//                     {
//                         client_id: result.client_id,
//                         stage_db: result.completion_db.newStage,
//                     },
//                     {
//                         $set: {
//                             status_db: true,
//                         }
//                     },
//                     {
//                         new: true,
//                     })
//             }

//             const remainders = await remainderModel.find({ date_db: date }).sort({ time_db: 1 })
//             const io = getIO()
//             io.emit("remainder", remainders)
//             console.log("reminder", remainders)
//         } catch (err) {
//             console.log("internal error", err)
//         }
//     })
// }

const getRemainders = async (req, res) => {
    try {
        const dateAndTime = getDateAndTime()
        const date = dateAndTime.split("T")[0]
        // console.log("yo yo reminder",date)
        const { roleType, userId } = req.query;
        let result;
        if (roleType === "Superadmin" || roleType === "Admin") {
            const merge1 = await remainderModel.find({ date_db: date }).sort({ time_db: 1 })
            const merge2 = await remainderModel.find({ status_db: false, date_db: { $lt: date } }).sort({ time_db: 1, date_db: 1 });
            result = [...merge1, ...merge2];
        } else {
            const merge1 = await remainderModel.find({ userId_db: userId, date_db: date }).sort({ time_db: 1 })
            const merge2 = await remainderModel.find({ userId_db: userId, status_db: false, date_db: { $lt: date } }).sort({ time_db: 1, date_db: 1 })
            result = [...merge1, ...merge2]
        }

        res.status(200).json({ message: "remainders", result })
    } catch (err) {
        console.log('internal error', err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
} 
const getCompleteRemainer = async (req, res) => {
    try {
        const { date,userId, roleType } = req.query;
        let result;
        if (roleType === "Superadmin" || roleType === "Admin") {
            result = await remainderModel.find({ date_db: date })
        } else {
            result = await remainderModel.find({ date_db: date, userId_db: userId })

        }
        res.status(200).json({ message: "status", result })
    } catch (err) {
        console.log('internal error', err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const getAllRemainderForAssignTask = async (req, res) => {
    try {

        const { dateFrom, dateTo, page } = req.query;
        console.log("query", req.query)
        const pageNum = parseInt(page) || 1;
        const limit = 100;
        const skip = (pageNum - 1) * limit
        console.log("", req.query)
        const date = new Date().toISOString().split("T")[0]
        let result;

        result = await remainderModel.find({ date_db: { $gte: dateFrom, $lte: dateTo } }).sort({ time_db: -1 }).skip(skip).limit(limit)
        res.status(200).json({
            message: "Remainder Fetch",
            page: Number(page),
            totalCount: result.length,
            limit,
            result,
            db: "Reminder",
        })
        // console.log("remainder", result)
        // if(dateType === "CHOOSE"){
        //     result = await remainderModel.find({date_db:givenDate,status_db:false}).sort({time_db:-1})
        //     res.status(200).json({message:"Remainder Fetch from Choose",result})
        // }else if(dateType === "TODAY"){
        //     result = await remainderModel.find({date_db:date,status_db:false}).sort({time_db:1})
        //     res.status(200).json({message:"Remainder Fetch from Today",result})
        // }else if(dateType === "DAY AFTER TODAY"){
        //     result = await remainderModel.find({date_db:{$gte:date},status_db:false}).sort({time_db:1})
        //     res.status(200).json({message:"Remainder Fetch from after",result,date})
        // }else if(dateType === "DAY BEFORE TODAY"){
        //     result = await remainderModel.find({date_db:{$lte:date},status_db:false}).sort({time_db:-1})
        //     res.status(200).json({message:"Remainder Fetch from before",result})
        // }else if(dateType === "ALL"){
        //     result = await remainderModel.find({status_db:false}).sort({date_db:-1,time_db:-1})
        //     res.status(200).json({message:"Remainder Fetch from all",result})
        // }

    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const getUserWiseReminder = async (req, res) => {
    // try {
    //     const date = new Date().toISOString().split("T")[0]
    //     const { userId } = req.query;
    //     const result = await remainderModel.find({ userId_db: userId, date_db: date })
    //     res.status(200).json({ message: `All remainders set by user ${userId}`, result })
    // } catch (err) {
    //     console.log("internal error")
    //     res.status(500).json({ message: "internal error", err: err.message })

    // }
}

const deleteReminder = async(req,res)=>{
    try{
        const id = req.params.id;
        console.log(id)
        const result = await remainderModel.findByIdAndDelete(id)
        if(!result){
            return res.status(200).json({message:"!Reminder not found"});

        }
        res.status(200).json({message:"Reminder Successfully deleted"});
    }catch(err){
        console.log("internal eror",err)
        res.status(500).json({message:"internal erorr",err:err.message})
    }
}



module.exports = { startRemainder, getRemainders, getCompleteRemainer, getAllRemainderForAssignTask, getUserWiseReminder, deleteReminder };