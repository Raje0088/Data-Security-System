const { clientModel } = require("../models/clientModel.js")
const {clientHistoryModel} = require("../models/historyModel.js")
const { clientSubscriptionModel } = require("../models/clientSubscriptionModel")
const { rawDataModel } = require("../models/rawDataModel.js")
const { getNextGobalCounterSequence } = require("../utils/getNextSequence.js")
const { getDateAndTime } = require("../utils/getLocalTimeAndDate.js")
const { applyRBAC, applyRBACwithoutProduct } = require("../utils/RBAC.js")

const currentDateAndTime = getDateAndTime()
const currentDate = currentDateAndTime.split("T")[0]
const currentTime = currentDateAndTime.split("T")[1]

const lastUpdatedTracker = async (clientId) => {
    try {
        await rawDataModel.findOneAndUpdate(
            {
                client_id: clientId,
            },
            {
                $set: {
                    database_status_db: "User",
                }
            },
            {
                new: true
            }
        )

        console.log("update successfully")
    } catch (err) {
        console.log('internal error', err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

// CREATE USER
const createSubscripbeUser = async (req, res) => {
    try {

        // console.log("req body ======= create User", req.body)
        const { clientSerialNo, clientId, userId, bussinessNames, clientName,
            numbers, emails, website,
            addresses, pincode, district, shopType,
            state, assignBy, assignTo,
            product, stage, quotationShare,
            expectedDate, remarks, label,
            followUpDate, verifiedBy, tracker, amountDetails, amountHistory, action, followUpTime } = req.body;

        const clientSubscriptionId = clientId.replace("C", "U")

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

        let { callType, country } = req.body;

        if (callType === "") {
            callType = "out-bound"
        }
        if (country === "") {
            country = "INDIA"
        }


        const result = await clientSubscriptionModel.create({
            client_serial_no_id: clientSerialNo,
            client_id: clientId,
            client_subscription_id: clientSubscriptionId,

            userId_db: userId,

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
            database_status_db: "User",
            tracking_db: tracker,
            label_db: label,
            shopType_db: shopType,
            amountDetails_db: amountDetails,
            amountHistory_db: amountHistory,
        })
        lastUpdatedTracker(clientId)
        getNextGobalCounterSequence("rawSerialNumber")
        console.log("User Details save Successfully", result)
        res.status(201).json({ message: "User Details save Successfully", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//UPDATE USER
const updateUserScription = async (req, res) => {
    try {

        const clientId = req.params.id;
        const { clientSerialNo, userId, bussinessNames, clientName,
            numbers, emails, website,
            addresses, pincode, district, shopType,
            state, assignBy, assignTo,
            product, stage, quotationShare,
            expectedDate, remarks, label,
            followUpDate, verifiedBy, tracker, amountDetails, amountHistory, action, followUpTime } = req.body;
        let { callType, country } = req.body;

        if (callType === "") {
            callType = "out-bound"
        }
        if (country === "") {
            country = "INDIA"
        }
        console.log("====>", clientId)
        const clientSubscriptionId = clientId.replace("C", "U")

        const oldUser = await clientSubscriptionModel.findOne({ client_subscription_id: clientSubscriptionId })
        if (!oldUser) {
            return res.status(404).json({ message: "User not found in user db" })
        }

        const bussiness1 = bussinessNames[0].value || ""
        const bussiness2 = bussinessNames[1].value || ""
        const bussiness3 = bussinessNames[2].value || ""

        const email1 = emails[0].value || ""
        const email2 = emails[1].value || ""
        const email3 = emails[2].value || ""

        const mobile1 = numbers[0].value || ""
        const mobile2 = numbers[1].value || ""
        const mobile3 = numbers[2].value || ""

        const address1 = addresses[0].value || ""
        const address2 = addresses[1].value || ""
        const address3 = addresses[2].value || ""

        const updatedTracker = {
            ...tracker,
            recovery_db: {
                ...tracker?.recovery_db,
                recoveryHistory: tracker?.recovery_db?.recoveryHistory || [],
            }
        }

        const result = await clientSubscriptionModel.findOneAndUpdate(
            { client_subscription_id: clientSubscriptionId },
            {
                $set: {
                    client_serial_no_id: clientSerialNo,
                    client_id: clientId,
                    client_subscription_id: clientSubscriptionId,
                    userId_db: userId,
                    client_name_db: clientName,

                    optical_name1_db: bussiness1,
                    optical_name2_db: bussiness2,
                    optical_name3_db: bussiness3,

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

                    website_db: website,
                    pincode_db: pincode,
                    district_db: district,
                    state_db: state,
                    followup_db: followUpDate,
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
                    database_status_db: "User",
                    label_db: label,
                    shopType_db: shopType,
                    tracking_db: updatedTracker,
                    amountDetails_db: amountDetails,
                    amountHistory_db: amountHistory,
                }
            },
            { new: true }
        )
        await clientModel.findOneAndUpdate(
            {
                client_id: clientId,
            },
            {
                $set: {
                    isActive_db: false,
                }
            },
            {
                new: true
            }
        )
        lastUpdatedTracker(clientId)
        // console.log("User Updated Successfully", result)
        res.status(200).json({ message: "User Updated Successfully", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//SEARCH USER IN USER PAGE THROUGH SEARCH BUTTON
const searchUserSubsciption = async (req, res) => {
    try {
        const clientSubscriptionId = req.params.id;
        const result = await clientSubscriptionModel.findOne({ client_id: clientSubscriptionId })
        console.log("user found ", result)
        res.status(200).json({ message: "user found", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

// CHECK DOES CLIENT ID IS IN USER MODEL
const CheckUserSubsciptionToRedirect = async (req, res) => {
    try {
        const clientId = req.params.id;
        const result = await clientSubscriptionModel.findOne({ client_id: clientId })
        if (!result) return res.status(201).json({ message: "User not found, you can continue on client page", exists: false })
        res.status(200).json({ message: "User Exist, Please Switch to User Page", result, exists: true })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const getAllUserSubsriptionIds = async (req, res) => {
    try {
        const result = await clientSubscriptionModel.find().sort({ client_subscription_id: 1 })
        console.log("ids found", result.length, result)
        res.status(200).json({ message: "ids found", totalCount: result.length, result })

    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//FILTER ALL USER DB
const filterClientSubscriptionData = async (req, res) => {
    try {
        const { userId, clientId, clientName, opticalName, address, mobile, email, district, state, country, hot,
            followUp, demo, installation, deactivate, amc, masterData, product, pincode, defaulter, recovery, lost, dateFrom, dateTo, clientType, } = req.body;
        const { page = 1 } = req.body;
        const limit = 500;
        const skip = (page - 1) * limit;

        console.log("query", req.query)


        const filters = {}
        // if (userId !== "SA" && userId !== "A01_SA") {
        //     filters["master_data_db.assignTo"] = userId;
        //     console.log("userId", userId)
        // }
        const orConditions = [];
        if (clientId) filters.client_id = clientId
        if (clientName) filters.client_name_db = { $regex: clientName, $options: "i" }
        if (pincode) filters.pincode_db = { $in: pincode }
        if (opticalName) {
            orConditions.push(
                { optical_name1_db: { $regex: opticalName, $options: "i" } },
                { optical_name2_db: { $regex: opticalName, $options: "i" } },
                { optical_name3_db: { $regex: opticalName, $options: "i" } }
            );
        }
        if (address) {
            orConditions.push(
                { address_1_db: { $regex: address, $options: "i" } },
                { address_2_db: { $regex: address, $options: "i" } },
                { address_3_db: { $regex: address, $options: "i" } }
            );
        }

        if (mobile) {
            orConditions.push(
                { mobile_1_db: { $regex: mobile, $options: "i" } },
                { mobile_2_db: { $regex: mobile, $options: "i" } },
                { mobile_3_db: { $regex: mobile, $options: "i" } }
            );
        }

        if (email) {
            orConditions.push(
                { email_1_db: { $regex: email, $options: "i" } },
                { email_2_db: { $regex: email, $options: "i" } },
                { email_3_db: { $regex: email, $options: "i" } }
            );
        }
        if (orConditions.length > 0) {
            filters.$or = orConditions;
        }
        if (district) filters.district_db = { $regex: district, $options: "i" }
        if (state) filters.state_db = { $regex: state, $options: 'i' }
        if (country) filters.country_db = { $regex: country, $options: 'i' }
        if (product) filters["product_db.label"] = { $regex: product, $options: "i" }
        if (amc) filters["tracking_db.amc_db.completed"] = true
        if (hot) filters["tracking_db.hot_db.completed"] = hot
        if (followUp) filters["tracking_db.follow_up_db.completed"] = followUp;
        if (demo) filters["tracking_db.demo_db.completed"] = demo
        if (installation) filters["tracking_db.installation_db.completed"] = installation
        if (defaulter) filters["tracking_db.defaulter_db.completed"] = defaulter
        if (recovery) filters["tracking_db.recovery_db.completed"] = recovery
        if (lost) filters["tracking_db.lost_db.completed"] = lost
        if (dateFrom && dateTo) filters.date_db = { $gte: dateFrom, $lte: dateTo }
        if (deactivate === true) { filters.isActive_db = false }
        else {
            filters.isActive_db = true;

        }

        const result = await clientSubscriptionModel.find(filters).sort({ client_id: 1 }).skip(skip).limit(limit)
        const totalCount = await clientSubscriptionModel.countDocuments(filters)

        // ===============ADDING VIEW PERMISSION IN RECORDS================================================

        let mergedRecords
        if (masterData.roleType === "Superadmin") {
            mergedRecords = result.map(doc => ({
                ...(doc.toObject ? doc.toObject() : doc),
                isView: true,
                isDelete: true,
                isUpdate: true,
                isEdit: true,
            }));

        } else {
            if (product) {
                const selectProdPerm = masterData.masterData.productPermissions.filter((prod) => prod.productName === product)
                const allowedPerm = selectProdPerm[0].permission
                const allowedRegion = selectProdPerm[0].region

                mergedRecords = applyRBAC(result, allowedRegion, allowedPerm, masterData.permission)
            } else {
                mergedRecords = applyRBACwithoutProduct(result, masterData.masterData.productPermissions, masterData.permission)
            }
        }
        res.status(200).json({ message: "Client det.completedails filter result", page: page, limit: limit, totalCount: totalCount, resultCount: result.length, result: mergedRecords, db: "User Database" })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const CheckUserIdforExcelSheet = async (req, res) => {
    try {
        const clientId = req.params.id
        const result = await clientSubscriptionModel.findOne({ client_id: clientId })
        res.status(200).json({ message: "User found", result })
    } catch (err) {
        console.log('internal error', err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const deactivateUserData = async (req, res) => {
    try {
        const clientId = req.params.id;
        const result = await clientSubscriptionModel.findOneAndUpdate(
            { client_id: clientId, isActive_db: true },
            { $set: { isActive_db: false } },
            { new: true },
        )
        const resultHistory = await clientHistoryModel.updateMany(
            { client_id: clientId, isActive_db: true, database_status_db: "User" },
            { $set: { isActive_db: false } },
            { new: true },
        )
        console.log("hsitory",resultHistory)
        res.status(200).json({ message: `${clientId} deactivated successfully with history ${resultHistory.modifiedCount}`, result })
    } catch (err) {
        res.status(500).json({ message: "Error during deactivation", err: err.message });
        console.log("Error during deactivation", err)
    }
}
const activateUserData = async (req, res) => {
    try {
        const clientId = req.params.id;
        const result = await clientSubscriptionModel.findOneAndUpdate(
            { client_id: clientId, isActive_db: false },
            { $set: { isActive_db: true } },
            { new: true },
        )
        const resultHistory = await clientHistoryModel.updateMany(
            { client_id: clientId, isActive_db: false, database_status_db:"User" },
            { $set: { isActive_db: true } },
            { new: true },
        )
        console.log("r===========",result,clientId)
        res.status(200).json({ message: `${clientId} activated successfully with history ${resultHistory.modifiedCount}`, result })
    } catch (err) {
        res.status(500).json({ message: "Error during activation", err: err.message })
        console.log("Error during activation ", err)
    }
}

//SEARCHING CLIENT TRHOUGH NAME, BUSINESS,MOBILE, ADDRESS,PIN, ETC TO GET ALL MATCH DETAILS 
const searchAllUserThroughQuery = async (req, res) => {
    try {
        const { name, opticalName, mobile, address, pincode, district, state, clientId, email } = req.query;
        console.log("searches are", name, opticalName, mobile, address, pincode, district, state, clientId, email)
        let filters = {}
        let andConditions = [];

        if (name) { andConditions.push({ client_name_db: { $regex: name.trim(), $options: "i" } }) }
        if (pincode && pincode.length === 6) { andConditions.push({ pincode_db: { $regex: pincode, $options: "i" } }) }
        if (district) { andConditions.push({ district_db: { $regex: district, $options: "i" } }) }
        if (state) { andConditions.push({ state_db: { $regex: state, $options: "i" } }) }
        if (clientId) { andConditions.push({ client_id: { $regex: clientId, $options: "i" } }) }
        if (opticalName) {
            andConditions.push({
                $or: [
                    { optical_name1_db: { $regex: opticalName, $options: "i" } },
                    { optical_name2_db: { $regex: opticalName, $options: "i" } },
                    { optical_name3_db: { $regex: opticalName, $options: "i" } }
                ]
            })
        }

        if (mobile) {
            andConditions.push({
                $or: [
                    { mobile_1_db: { $regex: mobile, $options: "i" } },
                    { mobile_2_db: { $regex: mobile, $options: "i" } },
                    { mobile_3_db: { $regex: mobile, $options: "i" } },
                ]
            })
        }

        if (address) {
            andConditions.push({
                $or: [
                    { address_1_db: { $regex: address, $options: "i" } },
                    { address_2_db: { $regex: address, $options: "i" } },
                    { address_3_db: { $regex: address, $options: "i" } },
                ]
            })
        }

        if (email) {
            andConditions.push({
                $or: [
                    { email_1_db: { $regex: email, $options: "i" } },
                    { email_2_db: { $regex: email, $options: "i" } },
                    { email_3_db: { $regex: email, $options: "i" } },
                ]
            })
        }
        let finalFilters = {};
        if (andConditions.length > 0) {
            finalFilters.$and = andConditions;
        }
        const result = await clientSubscriptionModel.find(finalFilters).sort({ client_id: 1 })
        if (result.length === 0) {
            return res.status(200).json({ message: "No Search found", totalCount: result.length, result: result });
        }
        res.status(200).json({ message: "Searches found", totalCount: result.length, result: result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}


//This is post request because i am passing array get not support array so using post method
const checkAlreadyDataExist = async (req, res) => {
    try {
        const { bussinessNames, masterData, numbers, emails, pincode, district, state } = req.body;
        console.log("regexArray", masterData, bussinessNames, numbers, emails, pincode, district, state)


        let filters = { $and: [] }
        if (bussinessNames) {
            const nameField = bussinessNames?.map((t) => (t.value.trim()))
            const regexArray = nameField?.map(val => new RegExp(val, "i"))

            const opticalNameOr = [
                { optical_name1_db: { $in: regexArray } },
                { optical_name2_db: { $in: regexArray } },
                { optical_name3_db: { $in: regexArray } },
            ]
            filters.$and.push({ $or: opticalNameOr })
        }

        if (numbers) {
            const mobileField = numbers.map((t) => t.value.trim().toString())
            const mobileOr = [
                { mobile_1_db: { $in: mobileField } },
                { mobile_2_db: { $in: mobileField } },
                { mobile_3_db: { $in: mobileField } },
            ]
            filters.$and.push({ $or: mobileOr })
        }

        if (emails) {
            const emailField = emails.map((i) => i.value.trim())
            const regexEmail = emailField.map(val => new RegExp(val, "i"))
            const emailOr = [
                { email_1_db: { $in: regexEmail } },
                { email_2_db: { $in: regexEmail } },
                { email_3_db: { $in: regexEmail } },
            ]
            filters.$and.push({ $or: emailOr })
        }
        if (pincode) {
            filters.$and.push({ pincode_db: pincode })
        }
        if (district) {
            filters.$and.push({ district_db: district })
        }
        if (state) {
            filters.$and.push({ state_db: state })
        }
        const result = await clientSubscriptionModel.find(filters)
        let mergedRecords;
        if (masterData.roleType === "Superadmin") {
            mergedRecords = result.map(doc => ({
                ...(doc.toObject ? doc.toObject() : doc),
                isView: true,
                isDelete: true,
                isUpdate: true,
                isEdit: true,
            }));
        } else {
            mergedRecords = applyRBACwithoutProduct(result, masterData.masterData.productPermissions, masterData.masterData.permission)
        }

        res.status(200).json({ message: `Client already exist`, totalCount: result.length, result: mergedRecords })
    } catch (err) {
        res.status(500).json({ message: "Error during deactivation", err: err.message });
        console.log("Error during deactivation", err)
    }
}

module.exports = {activateUserData, createSubscripbeUser, checkAlreadyDataExist, searchAllUserThroughQuery, CheckUserIdforExcelSheet, filterClientSubscriptionData, getAllUserSubsriptionIds, updateUserScription, searchUserSubsciption, CheckUserSubsciptionToRedirect, deactivateUserData }  