
const { clientHistoryModel } = require("../models/historyModel")
const { clientModel } = require("../models/clientModel")
const { userFormModel } = require("../models/userForm.js")
const { clientSubscriptionModel } = require("../models/clientSubscriptionModel")
const { getNextGobalCounterSequence } = require("../utils/getNextSequence")
const { userProgressSummaryModel } = require("../models/userProgressSummaryModel")
const { scheduleOptimaModel } = require("../models/ScheduleOptima")
const { taskAssignModel } = require("../models/TaskAssignModel.js")
const { remainderModel } = require("../models/remainderModel.js")
const { getDateAndTime } = require("../utils/getLocalTimeAndDate.js")
const { startRemainder } = require("../controllers/remainderController.js")
const { userProgressSummary } = require("../controllers/userProgressSummaryController.js")
const agenda = require("../jobs/agenda")

const currentDateAndTime = getDateAndTime()
const currentDate = currentDateAndTime.split("T")[0]
const currentTime = currentDateAndTime.split("T")[1]

// CREATE A DUPLICATE COPY OF CLIENT RECORD IN HISTORY MODEL [DONE]
const createHistory = async (req, res) => {
    try {
        const { clientSerialNo, clientId, userId, bussinessNames, clientName,
            numbers, emails, website,
            addresses, pincode, district, shopType,
            state, assignBy, assignTo,
            product, stage, quotationShare,
            expectedDate, remarks, label, completion, taskId,
            followUpDate, verifiedBy, action, followUpTime, database, tracker, amountDetails, amountHistory, additional, isUserPage = false } = req.body;
        const bussiness1 = bussinessNames[0]?.value || "";
        const bussiness2 = bussinessNames[1]?.value || "";
        const bussiness3 = bussinessNames[2]?.value || "";

        const email1 = emails[0]?.value || ""
        const email2 = emails[1]?.value || ""
        const email3 = emails[2]?.value || ""

        const mobile1 = numbers[0]?.value || ""
        const mobile2 = numbers[1]?.value || ""
        const mobile3 = numbers[2]?.value || ""

        const address1 = addresses[0]?.value || ""
        const address2 = addresses[1]?.value || ""
        const address3 = addresses[2]?.value || ""


        let subscriptionId = ""
        let isFirstTimeInstallation = false;
        if (!isUserPage) {
            const oldClient = await clientModel.findOne({ client_id: clientId });
            // console.log("old client", oldClient, clientId)
            const previouslyInstalled = oldClient.tracking_db?.installation_db?.completed;
            const newInstallationCompleted = tracker?.installation_db?.completed;
            isFirstTimeInstallation = !previouslyInstalled && newInstallationCompleted;

            subscriptionId = isFirstTimeInstallation ? clientId.replace("C", "U") : "";
        }
        if (isUserPage) {
            const oldUser = await clientSubscriptionModel.findOne({ client_id: clientId });

            if (!oldUser) {
                console.log("Warning: User not found for clientId", clientId);
            }

            const previouslyInstalled = oldUser?.tracking_db?.installation_db?.completed;
            const newInstallationCompleted = tracker?.installation_db?.completed;

            const isFirstTimeInstallation = !previouslyInstalled && newInstallationCompleted;
            subscriptionId = isFirstTimeInstallation ? clientId.replace("C", "U") : "";
        }

        let { callType, country } = req.body;

        if (callType === "") {
            callType = "out-bound"
        }
        if (country === "") {
            country = "INDIA"
        }
        const updatedTracker = {
            ...tracker,
            recovery_db: {
                ...tracker?.recovery_db,
                recoveryHistory: tracker?.recovery_db?.recoveryHistory || [],
            }
        }
        const updatedAmountHistory = [
            ...(amountHistory || []),
            {
                date: new Date().toLocaleDateString("en-GB"),
                time: new Date().toLocaleTimeString(),
                totalAmount: amountDetails.totalAmount || "",
                paidAmount: amountDetails.paidAmount || "",
                extraCharges: amountDetails.extraCharges || "",
                finalCost: amountDetails.finalCost || "",
                newAmount: amountDetails.newAmount || "",
                balanceAmount: amountDetails.balanceAmount || "",
                updatedBy: userId,
            }
        ]

        const visitingId = await getNextGobalCounterSequence(`clientVisited_${clientId}`)
        const result = await clientHistoryModel.create({
            client_serial_no_id: clientSerialNo,
            client_id: clientId,
            userId_db: userId,
            client_visiting_id: visitingId,
            client_History_id: `H${clientId}_${visitingId}`,
            client_subscription_id: subscriptionId,

            optical_name1_db: bussiness1,
            optical_name2_db: bussiness2,
            optical_name3_db: bussiness3,

            client_name_db: clientName,

            address_1_db: address1,
            address_2_db: address2,
            address_3_db: address3,

            district_db: district,
            state_db: state,
            pincode_db: pincode,

            mobile_1_db: mobile1,
            mobile_2_db: mobile2,
            mobile_3_db: mobile3,

            email_1_db: email1,
            email_2_db: email2,
            email_3_db: email3,

            followup_db: followUpDate,
            website_db: website,
            remarks_db: remarks,
            quotationShare_db: quotationShare,
            callType_db: callType,
            expectedDate_db: expectedDate,
            verifiedBy_db: verifiedBy,
            assignBy: assignBy,
            assignTo: assignTo,
            stage_db: stage,
            product_db: product,
            country_db: country,
            time_db: followUpTime,
            date_db: currentDate,
            action_db: action,
            database_status_db: database,
            tracking_db: updatedTracker,
            label_db: label,
            shopType_db: shopType,
            completion_db: completion,
            amountDetails_db: amountDetails,
            amountHistory_db: updatedAmountHistory,
            additional_db: additional,
            isSubscriber_db: isFirstTimeInstallation ? true : false,
            taskId_db: taskId
        })
        // console.log("Client History save Successfully", result)
        res.status(201).json({ message: "Client History save Successfully", result })

        await goalSchedule(result)
        await userProgressSummary(result)
        await autoReminderSetForAmc(result)
        await startRemainder(result);
        await assignTaskProgress(result)
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error in create client", err: err.message })
    }
}

const assignTaskProgress = async (result) => {
    try {
        if (!result.taskId_db) return
        const TASK_MAP = {
            demo_db: "Demo",
            new_data_db: "New data add",
            recovery_db: "Recovery",
            training_db: "Training",
            followUp_db: "Follow Up",
            installation_db: "Installation",
            support_db: "Support",
            target_db: "Target",
            leads_db: "Leads",
            new_calls_db: "No of New Calls"
        };

        const totalClient = await clientHistoryModel.aggregate([
            {
                $match: {
                    taskId_db: result.taskId_db,

                }
            },
            {
                $group: {
                    _id: "$client_id",
                }
            },
            {
                $group: {
                    _id: null,
                    totalClientDone: { $sum: 1 }  // count how many uniques
                }
            }
        ])

        const tracker = result.tracking_db
        const taskRecord = await taskAssignModel.findOne({ _id: result.taskId_db })
        taskRecord.completed_db = totalClient?.[0]?.totalClientDone ?? 0;
        const updated = taskRecord.task_client_id.map((item) => (item.id === result.client_id ? { ...item, status: true } : item))
        taskRecord.task_client_id = updated

        const totals = await clientHistoryModel.aggregate([
            {
                $match: {
                    userId_db: result.userId_db,
                    // date_db: currentDate,
                    taskId_db: result.taskId_db,
                    // client_id: result.client_id,
                }
            },
            {
                $group: {
                    _id: "$client_id",
                    new_data_count: {
                        $max: { $cond: ["$tracking_db.new_data_db.completed", 1, 0] }
                    },
                    new_calls_count: {
                        $max: { $cond: ["$tracking_db.new_calls_db.completed", 1, 0] }
                    },
                    leads_count: {
                        $max: { $cond: ["$tracking_db.leads_db.completed", 1, 0] }
                    },
                    demo_count: {
                        $max: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$completion_db.newStage", "Demo"] },
                                        { $eq: ["$completion_db.status", "Done"] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    followUp_count: {
                        $max: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$completion_db.newStage", "Follow Up"] },
                                        { $eq: ["$completion_db.status", "Done"] }
                                    ]
                                },
                                1,
                                0]
                        }
                    },
                    training_count: {
                        $max: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$completion_db.newStage", "Training"] },
                                        { $eq: ["$completion_db.status", "Done"] }
                                    ]
                                },
                                1,
                                0]
                        }
                    },
                    installation_count: {
                        $max: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$completion_db.newStage", "Installation/Hosting/Sell"] },
                                        { $eq: ["$completion_db.status", "Done"] }
                                    ]
                                },
                                1,
                                0]
                        }
                    },
                    recovery_count: {
                        $max: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$completion_db.newStage", "Recovery"] },
                                        { $eq: ["$completion_db.status", "Done"] }
                                    ]
                                },
                                1,
                                0]
                        }
                    },
                    support_count: {
                        $max: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$completion_db.newStage", "Support"] },
                                        { $eq: ["$completion_db.status", "Done"] }
                                    ]
                                },
                                1,
                                0]
                        }
                    },

                }
            },
            {
                $group: {
                    _id: null,
                    new_data_db: { $sum: "$new_data_count" },
                    new_calls_db: { $sum: "$new_calls_count" },
                    leads_db: { $sum: "$leads_count" },
                    demo_db: { $sum: "$demo_count" },
                    followUp_db: { $sum: "$followUp_count" },
                    target_db: { $sum: "$target_count" },   // (only if you actually have this)
                    training_db: { $sum: "$training_count" },
                    installation_db: { $sum: "$installation_count" },
                    recovery_db: { $sum: "$recovery_count" },
                    support_db: { $sum: "$support_count" },
                }
            }
        ])

        const summary = totals[0] || {
            new_data_db: 0,
            new_calls_db: 0,
            leads_db: 0,
            demo_db: 0,
            followup_db: 0,
            target_db: 0,
            training_db: 0,
            installation_db: 0,
            recovery_db: 0,
            support_db: 0,
        };

        for (const [key] of Object.entries(tracker)) {

            const taskTitle = TASK_MAP[key];
            let found = false;

            for (const taskObj of taskRecord.taskObj_db) {

                if (taskObj.title === taskTitle) {

                    found = true;

                    const old = taskObj.completed;
                    const val = summary[key] ?? 0;

                    taskObj.completed = val;

                }
            }

            if (!found) {
                console.log("❌ NOT FOUND IN DB:", taskTitle);
            }

            if (taskRecord.progress_db[key] !== undefined) {
                taskRecord.progress_db[key] = summary[key] ?? 0;
            }
        }

        // ⭐⭐⭐ THIS IS MANDATORY ⭐⭐⭐
        taskRecord.markModified("taskObj_db");
        taskRecord.markModified("progress_db");

        await taskRecord.save();

        console.log("💾 Saved successfully");


    } catch (err) {
        console.log("internal error", err)
    }
}

// const userProgressSummary = async (result) => {
//     try {

//         const PROGRESS_MAPPING = {
//             demo_db: "demo_db",
//             new_data_db: "new_data_db",
//             recovery_db: "recovery_db",
//             training_db: "training_db",
//             follow_up_db: "followUp_db",
//             installation_db: "installation_db",
//             support_db: "support_db",
//             target_db: "target_db",
//             leads_db: "lead_db",
//             no_of_new_calls_db: "new_calls_db"
//         };

//         const userId = result.userId_db
//         const date = result.date_db
//         const productArray = result.product_db.map((item) => (item.label)) || []
//         const tracking = result.tracking_db

//         const SPECIAL_KEYS = ["new_data_db", "leads_db", "no_of_new_calls_db"];

//         for (const prod of productArray) {
//             for (const [key, mappedKey] of Object.entries(PROGRESS_MAPPING)) {
//                 const trackingField = tracking[key];

//                 // must be completed in all cases
//                 if (!trackingField || trackingField.completed !== true) continue;

//                 const isSpecial = SPECIAL_KEYS.includes(key);

//                 // non-special needs status Done
//                 if (!isSpecial && result?.completion_db?.status !== "Done") continue;

//                 const updateQuery = { $inc: {} };
//                 updateQuery.$inc[`${mappedKey}.completed`] = 1;

//                 await userProgressSummaryModel.updateOne(
//                     {
//                         userId_db: userId,
//                         date_db: date,
//                         product_db: prod
//                     },
//                     updateQuery,
//                     { upsert: true }
//                 );

//                 console.log(
//                     `✅ Progress updated → ${mappedKey} (${prod}) | special=${isSpecial}`
//                 );
//             }
//         }

//         // for (const prod of productArray) {
//         //     for (const [key, mappedKey] of Object.entries(PROGRESS_MAPPING)) {
//         //         const trackingField = tracking[key]
//         //         console.log("trackingField", tracking[key], key, mappedKey)
//         //         if (trackingField && trackingField.completed === true && result?.completion_db?.status === "Done") {
//         //             const updateQuery = { $inc: {} };

//         //             updateQuery.$inc[`${mappedKey}.completed`] = 1

//         //             await userProgressSummaryModel.updateOne({ userId_db: userId, date_db: date, product_db: prod },
//         //                 updateQuery,
//         //                 { upsert: true }
//         //             )
//         //             console.log(`✅ Progress updated for ${userId} → ${mappedKey} (${prod})`);
//         //         }
//         //         if (["new_data_db", "leads_db", "no_of_new_calls_db"].includes(key)) {
//         //             const updateQuery = { $inc: {} };

//         //             updateQuery.$inc[`${mappedKey}.completed`] = 1

//         //             await userProgressSummaryModel.updateOne({ userId_db: userId, date_db: date, product_db: prod },
//         //                 updateQuery,
//         //                 { upsert: true }
//         //             )
//         //             console.log(`✅ Progress updated for ${userId} → ${mappedKey} (${prod})`);
//         //         }
//         //     }
//         // }
//     } catch (err) {
//         console.log("internal error in userProgress function", err)
//     }

// }


// CREATING AND UPDATE ONLY SCHEDULE GOALS [DONE]
const goalSchedule = async (result) => {
    try {
        const TASK_MAPPING = {
            "Demo": "demo_db",
            "New Data": "new_data_db",
            "Recovery": "recovery_db",
            "Training": "training_db",
            "Follow Up": "followUp_db",
            "Installation": "installation_db",
            "Support": "support_db",
            "Target": "target_db",
            "Leads": "leads_db",
            "New Calls": "new_calls_db"
        };

        const userId = result.userId_db
        const date = result.date_db
        const product = result.product_db[0]?.label
        const tracking = result.tracking_db

        const isGoalSchedule = await scheduleOptimaModel.findOne({ userId_db: userId, date_todo_db: currentDate })

        if (!isGoalSchedule) {
            const userForm = await userFormModel.findOne({ assignToId_db: userId })
            const userTask = userForm.task_product_matrix_db
            let goalsMap = {}

            userTask.forEach((task) => {
                const taskKey = TASK_MAPPING[task.taskTitle]

                if (!taskKey) return;

                task.products.forEach((prod) => {
                    const productKey = prod.productTitle
                    const total = prod.num

                    if (!goalsMap[productKey]) {
                        goalsMap[productKey] = {};  // productTaskSchema group
                    }

                    goalsMap[productKey][taskKey] = {
                        assigned_db: total || 0,
                        completed_db: 0
                    }
                })


            })
            await scheduleOptimaModel.create({
                userId_db: userId,
                date_todo_db: currentDate,
                time_db: currentTime,
                deadline_db: "19:15:00",
                cron_deadline_db: new Date(`${currentDate}T19:15:00`),
                goals_db: goalsMap,
            })

        }

        const totals = await clientHistoryModel.aggregate([
            {
                $match: {
                    userId_db: result.userId_db,
                    product_db: { $elemMatch: { value: product } },
                    date_db: currentDate,
                }
            },
            {
                $group: {
                    _id: "$client_id",
                    new_data_count: {
                        $max: { $cond: ["$tracking_db.new_data_db.completed", 1, 0] }
                    },
                    new_calls_count: {
                        $max: { $cond: ["$tracking_db.new_calls_db.completed", 1, 0] }
                    },
                    leads_count: {
                        $max: { $cond: ["$tracking_db.leads_db.completed", 1, 0] }
                    },
                    demo_count: {
                        $max: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$completion_db.newStage", "Demo"] },
                                        { $eq: ["$completion_db.status", "Done"] }
                                    ]
                                },
                                1,
                                0]
                        }
                    },
                    followUp_count: {
                        $max: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$completion_db.newStage", "Follow Up"] },
                                        { $eq: ["$completion_db.status", "Done"] }
                                    ]
                                },
                                1,
                                0]
                        }
                    },
                    training_count: {
                        $max: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$completion_db.newStage", "Training"] },
                                        { $eq: ["$completion_db.status", "Done"] }
                                    ]
                                },
                                1,
                                0]
                        }
                    },
                    installation_count: {
                        $max: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$completion_db.newStage", "Installation/Hosting/Sell"] },
                                        { $eq: ["$completion_db.status", "Done"] }
                                    ]
                                },
                                1,
                                0]
                        }
                    },
                    recovery_count: {
                        $max: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$completion_db.newStage", "Recovery"] },
                                        { $eq: ["$completion_db.status", "Done"] }
                                    ]
                                },
                                1,
                                0]
                        }
                    },
                    support_count: {
                        $max: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$completion_db.newStage", "Support"] },
                                        { $eq: ["$completion_db.status", "Done"] }
                                    ]
                                },
                                1,
                                0]
                        }
                    },

                },
            },
            // sum across all clients -> DAILY TOTALS   
            {
                $group: {
                    _id: null,
                    new_data: { $sum: "$new_data_count" },
                    new_calls: { $sum: "$new_calls_count" },
                    leads: { $sum: "$leads_count" },
                    demo: { $sum: "$demo_count" },
                    followup: { $sum: "$followUp_count" },
                    target: { $sum: "$target_count" },
                    training: { $sum: "$training_count" },
                    installation: { $sum: "$installation_count" },
                    recovery: { $sum: "$recovery_count" },
                    support: { $sum: "$support_count" },
                }
            }
        ])
        const summary = totals[0] || {
            new_data: 0,
            new_calls: 0,
            leads: 0,
            demo: 0,
            followup: 0,
            target: 0,
            training: 0,
            installation: 0,
            recovery: 0,
            support: 0,
        };

        // for (const [taskName, taskObj] of Object.entries(tracking)) {
        //     if (taskObj.completed) {
        //         await scheduleOptimaModel.updateOne(
        //             { userId_db: userId, date_todo_db: currentDate },
        //             {
        //                 $inc: {
        //                     [`goals_db.${product}.${taskName}.completed_db`]: 1
        //                 }
        //             }
        //         );
        //     }
        // }
        const goals = await scheduleOptimaModel.updateOne(
            { userId_db: userId, date_todo_db: currentDate },
            {
                $set: {
                    [`goals_db.${product}.new_calls_db.completed_db`]: summary.new_calls || 0,
                    [`goals_db.${product}.new_data_db.completed_db`]: summary.new_data || 0,
                    [`goals_db.${product}.leads_db.completed_db`]: summary.leads || 0,
                    [`goals_db.${product}.demo_db.completed_db`]: summary.demo || 0,
                    [`goals_db.${product}.followUp_db.completed_db`]: summary.followup || 0,
                    [`goals_db.${product}.training_db.completed_db`]: summary.training || 0,
                    [`goals_db.${product}.installation_db.completed_db`]: summary.installation || 0,
                    [`goals_db.${product}.recovery_db.completed_db`]: summary.recovery || 0,
                    [`goals_db.${product}.support_db.completed_db`]: summary.support || 0,
                }
            }
        );

    } catch (err) {
        console.log("internal error in userProgress function", err)
    }

}
// const goalSchedule = async (result) => {
//     try {

//         const PROGRESS_MAPPING = {
//             demo_db: "demo_db",
//             new_data_db: "new_data_db",
//             recovery_db: "recovery_db",
//             training_db: "training_db",
//             follow_up_db: "followUp_db",
//             installation_db: "installation_db",
//             support_db: "support_db",
//             target_db: "target_db",
//             leads_db: "lead_db",
//             no_of_new_calls_db: "new_calls_db"
//         };

//         const userId = result.userId_db
//         const date = result.date_db
//         const productArray = result.product_db.map((item) => (item.label)) || []
//         const tracking = result.tracking_db

//         // for (const prod of productArray) {
//         //     for (const [key, mappedKey] of Object.entries(PROGRESS_MAPPING)) {
//         //         const trackingField = tracking[key]
//         //         if (trackingField && trackingField.completed === true) {
//         //             const updateQuery = { $inc: {} };

//         //             updateQuery.$inc[`goals_db.${prod}.${mappedKey}.completed_db`] = 1
//         //             console.log("updatequery", updateQuery)
//         //             await scheduleOptimaModel.updateOne({ userId_db: userId, date_todo_db: date },
//         //                 updateQuery,
//         //                 { upsert: true }
//         //             )
//         //             console.log(`✅ Progress updated for ${userId} → ${mappedKey} (${prod})`);
//         //         }
//         //     }
//         // }

//         const SPECIAL_KEYS = ["new_data_db", "leads_db", "no_of_new_calls_db"];

//         for (const prod of productArray) {
//             for (const [key, mappedKey] of Object.entries(PROGRESS_MAPPING)) {
//                 const trackingField = tracking[key];

//                 // must be completed for all cases
//                 if (!trackingField || trackingField.completed !== true) continue;

//                 const isSpecial = SPECIAL_KEYS.includes(key);

//                 // non-special keys require status Done
//                 if (!isSpecial && result?.completion_db?.status !== "Done") continue;

//                 const updateQuery = { $inc: {} };

//                 updateQuery.$inc[
//                     `goals_db.${prod}.${mappedKey}.completed_db`
//                 ] = 1;

//                 console.log("updateQuery", updateQuery);

//                 await scheduleOptimaModel.updateOne(
//                     {
//                         userId_db: userId,
//                         date_todo_db: date
//                     },
//                     updateQuery,
//                     { upsert: true }
//                 );

//                 console.log(
//                     `✅ Goals updated → ${mappedKey} (${prod}) | special=${isSpecial}`
//                 );
//             }
//         }


//     } catch (err) {
//         console.log("internal error in userProgress function", err)
//     }

// }


const autoReminderSetForAmc = async (result) => {
    try {
        if (result.completion_db.status === "Done" && (result.completion_db.newStage === "Installation" || result.tracking_db.installation_db.completed === true || result.tracking_db.amc_db.completed === true)) {
            const date = new Date(result.date_db)
            date.setFullYear(date.getFullYear() + 1)
            const dateAfterOneYear = date.toISOString().split("T")[0]

            const reminders = await remainderModel.create({
                client_id: result.client_id,
                client_name_db: result.client_name_db,
                stage_db: "Amc",
                date_db: dateAfterOneYear,
                time_db: result.time_db,
                operation_db: "Schedule",
                database_db: result.database_status_db,
                status_db: false,
                userId_db: result.assignTo,
            })

            await agenda.schedule(date, "send-reminder", {
                assignTo: result.userId_db,
                message: `!Alert, This is reminder of  ${result.client_id} for AMC `
            })
            console.log("Remainder set for AMC", reminders)
        }
    } catch (err) {
        console.log("internal error in autoremaindersetForAmc", err)
    }
}



const getHistory = async (req, res) => {
    try {
        const clientId = req.params.id;
        console.log("Searching History for clientId:", clientId);
        const history = await clientHistoryModel.find({ client_id: clientId }).sort({ client_visiting_id: 1 })
        const totalCount = await clientHistoryModel.countDocuments({ client_id: clientId })
        // console.log("client History Found", history)
        res.status(200).json({ message: "client History Found", totalRecords: totalCount, result: history })
    } catch (err) {
        console.log("internal err", err)
        res.status(500).json({ message: "internal error in history", err: err.message })
    }
}

const getLastUpdatedClientHistory = async (req, res) => {
    try {
        const clientId = req.params.id;
        console.log("Searching History for clientId:", clientId);
        const history = await clientHistoryModel.findOne({ client_id: clientId }).sort({ client_visiting_id: -1 })
        // console.log("client History Found", history)
        res.status(200).json({ message: "client History Found", result: history })
    } catch (err) {
        console.log("internal err", err)
        res.status(500).json({ message: "internal error in history", err: err.message })
    }
}

module.exports = { createHistory, getHistory, getLastUpdatedClientHistory }