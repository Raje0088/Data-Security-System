const { rawDataModel } = require("../models/rawDataModel")
const { clientModel } = require("../models/clientModel")
const { clientSubscriptionModel } = require("../models/clientSubscriptionModel")
const stringSimilarity = require("string-similarity")

// const findDuplicateRecord = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         console.log("page", page)
//         const limit = 10;
//         const skip = (page - 1) * limit;
//         const totalRawRecordCount = await rawDataModel.countDocuments()
//         const totalCounts = await rawDataModel.aggregate([
//             {
//                 $addFields: {
//                     opticalNameSafe: { $cond: [{ $eq: ["$optical_name1_db", ""] }, "EMPTY", "$optical_name1_db"] },
//                     clientNameSafe: { $cond: [{ $eq: ["$client_name_db", ""] }, "EMPTY", "$client_name_db"] },
//                     pincodeSafe: { $cond: [{ $eq: ["$pincode_db", ""] }, "EMPTY", "$pincode_db"] },
//                     email1Safe: { $cond: [{ $eq: ["$email_1_db", ""] }, "EMPTY", "$email_1_db"] },
//                     email2Safe: { $cond: [{ $eq: ["$email_2_db", ""] }, "EMPTY", "$email_2_db"] },
//                     email3Safe: { $cond: [{ $eq: ["$email_3_db", ""] }, "EMPTY", "$email_3_db"] },
//                     mobile1Safe: { $cond: [{ $eq: ["$mobile_1_db", ""] }, "EMPTY", "$mobile_1_db"] },
//                     mobile2Safe: { $cond: [{ $eq: ["$mobile_2_db", ""] }, "EMPTY", "$mobile_2_db"] },
//                     mobile3Safe: { $cond: [{ $eq: ["$mobile_3_db", ""] }, "EMPTY", "$mobile_3_db"] },
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         opticalName: "$opticalNameSafe",
//                         clientName: "$clientNameSafe",
//                         pincode: "$pincodeSafe",
//                         email1: "$email1Safe",
//                         email2: "$email2Safe",
//                         email3: "$email3Safe",
//                         mobile1: "$mobile1Safe",
//                         mobile2: "$mobile2Safe",
//                         mobile3: "$mobile3Safe",
//                     },
//                     count: { $sum: 1 },
//                     docs: { $push: "$$ROOT" }
//                 }
//             },
//             {
//                 $match: {
//                     count: { $gt: 1 }
//                 }
//             },
//             {
//                 $count: "totalGroups"
//             },
//         ]).allowDiskUse(true)
//         const result = await rawDataModel.aggregate([
//             {
//                 $addFields: {
//                     opticalNameSafe: { $cond: [{ $eq: ["$optical_name1_db", ""] }, "EMPTY", "$optical_name1_db"] },
//                     clientNameSafe: { $cond: [{ $eq: ["$client_name_db", ""] }, "EMPTY", "$client_name_db"] },
//                     pincodeSafe: { $cond: [{ $eq: ["$pincode_db", ""] }, "EMPTY", "$pincode_db"] },
//                     email1Safe: { $cond: [{ $eq: ["$email_1_db", ""] }, "EMPTY", "$email_1_db"] },
//                     email2Safe: { $cond: [{ $eq: ["$email_2_db", ""] }, "EMPTY", "$email_2_db"] },
//                     email3Safe: { $cond: [{ $eq: ["$email_3_db", ""] }, "EMPTY", "$email_3_db"] },
//                     mobile1Safe: { $cond: [{ $eq: ["$mobile_1_db", ""] }, "EMPTY", "$mobile_1_db"] },
//                     mobile2Safe: { $cond: [{ $eq: ["$mobile_2_db", ""] }, "EMPTY", "$mobile_2_db"] },
//                     mobile3Safe: { $cond: [{ $eq: ["$mobile_3_db", ""] }, "EMPTY", "$mobile_3_db"] },
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         opticalName: "$opticalNameSafe",
//                         clientName: "$clientNameSafe",
//                         pincode: "$pincodeSafe",
//                         email1: "$email1Safe",
//                         email2: "$email2Safe",
//                         email3: "$email3Safe",
//                         mobile1: "$mobile1Safe",
//                         mobile2: "$mobile2Safe",
//                         mobile3: "$mobile3Safe",
//                     },
//                     count: { $sum: 1 },
//                     docs: { $push: "$$ROOT" },
//                     limit:{limit},
//                 }
//             },
//             {
//                 $match: {
//                     count: { $gt: 1 }
//                 }
//             },
//             {
//                 $skip: skip
//             },
//             { $limit: limit }
//         ]).allowDiskUse(true)

//         console.log("resul", totalCounts)

//         res.status(200).json({ message: `Total duplicate records founds ${result.length}`, limit: limit, result, totalCounts, totalRawRecordCount });
//     } catch (err) {
//         console.log("intenal error", err)
//     }
// }
const findDuplicateRecord = async (req, res) => {
    try {
        const { opticalName = "true", clientName = "true" } = req.query
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;
        let groupById = {

            emails: "$emails",
            mobile: "$mobiles",
            pincode: "$pincode_db",
        }

        // in url boolean value like true or false convert to string as "true"/"false" so i change it to string comparison
        if (opticalName === "true") {
             groupById.opticalName= {$toLower: { $trim: { input: "$optical_name1_db" } }}
            // groupById.opticalName = { $toLower: "$optical_name1_db" };
        }
        if (clientName === "true") {
            groupById.clientName = {
                $toLower: { $trim: { input: { $ifNull: ["$client_name_db", ""] } } }
            };
        }
        const totalRawRecordCount = await rawDataModel.countDocuments()

        const aggregationTotalCount = await rawDataModel.aggregate([
            {
                $match: { isSkip_db: "false" },
            },
            {
                $addFields: {
                    mobiles: {
                        $filter: {
                            input: ["$mobile_1_db", "$mobile_2_db", "$mobile_3_db"],
                            as: "mobile",
                            cond: { $ne: ["$$mobile", ""] }
                        }

                    },
                    emails: {
                        $filter: {
                            input: ["$email_1_db", "$email_2_db", "$email_3_db"],
                            as: "email",
                            cond: { $ne: ["$$email", ""] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    mobiles: { $sortArray: { input: "$mobiles", sortBy: 1 } },
                    emails: { $sortArray: { input: "$emails", sortBy: 1 } }
                }
            },
            {
                $group: {
                    _id: groupById,
                    count: { $sum: 1 },
                    doc: { $push: "$client_id" },

                }
            },
            {
                $match: {
                    count: { $gte: 2 }
                }
            },
        ], { allowDiskUse: true })
        console.log("groupbyid", groupById)
        const aggregationResult = await rawDataModel.aggregate([
            {
                $match: { isSkip_db: "false" },
            },
            {
                $addFields: {
                    mobiles: {
                        $filter: {
                            input: ["$mobile_1_db", "$mobile_2_db", "$mobile_3_db"],
                            as: "mobile",
                            cond: { $ne: ["$$mobile", ""] }
                        }

                    },
                    emails: {
                        $filter: {
                            input: ["$email_1_db", "$email_2_db", "$email_3_db"],
                            as: "email",
                            cond: { $ne: ["$$email", ""] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    mobiles: { $sortArray: { input: "$mobiles", sortBy: 1 } },
                    emails: { $sortArray: { input: "$emails", sortBy: 1 } }
                }
            },
            {
                $group: {
                    _id: groupById,
                    count: { $sum: 1 },
                    doc: { $push: "$client_id" },

                }
            },
            {
                $match: {
                    count: { $gte: 2 }
                }
            },
            {
                $limit: limit,
            }
        ], { allowDiskUse: true })

        console.log("aggregationTotalCount", aggregationTotalCount.length);
        let arr = []
        for (const item of aggregationResult) {
            const data = await Promise.all(item.doc.map(async (id) => await rawDataModel.findOne({ client_id: id })))
            arr.push(data)
        }


        res.status(200).json({ message: `Total duplicate records founds ${limit}`, arr, totalDuplicateRecord: aggregationTotalCount.length, totalRawRecordCount });
    } catch (err) {
        console.log("intenal error", err)
    }
}


const findDuplicateRecordBySearch = async (req, res) => {
    try {
        const {
            clientId,
            opticalName,
            clientName,
            email,
            pincode,
            mobile
        } = req.query;

        const totalRawRecord = await rawDataModel.countDocuments()
        console.log("req.query", opticalName,
            clientName,
            email,
            pincode,
            mobile)
        if (!clientId && !opticalName && !clientName && !email && !pincode && !mobile) {
            return res.status(400).json({ message: "At least one field required" });
        }

        const matchOrConditions = [];
        matchOrConditions.push({ isActive_db: true })
        if (clientId) {
            matchOrConditions.push({ client_id: clientId });
        }

        // Client Name (AND condition)
        if (clientName) {
            matchOrConditions.push({ client_name_db: { $regex: clientName.trim(), $options: "i" } });
        }

        // Pincode (AND condition)
        if (pincode) {
            matchOrConditions.push({ pincode_db: pincode })
        }

        // Email fields (OR condition)
        if (email) {
            matchOrConditions.push({
                $or: [
                    { email_1_db: { $regex: email.trim(), $options: "i" } },
                    { email_2_db: { $regex: email.trim(), $options: "i" } },
                    { email_3_db: { $regex: email.trim(), $options: "i" } }
                ]
            });
        }

        // Mobile fields (OR condition)
        if (mobile) {
            matchOrConditions.push({
                $or: [

                    { mobile_1_db: { $regex: mobile, $options: "i" } },
                    { mobile_2_db: { $regex: mobile, $options: "i" } },
                    { mobile_3_db: { $regex: mobile, $options: "i" } }
                ]
            });
        }

        // Optical Name fields (OR condition)
        if (opticalName) {
            matchOrConditions.push({
                $or: [
                    { optical_name1_db: { $regex: opticalName.trim(), $options: "i" } },
                    { optical_name2_db: { $regex: opticalName.trim(), $options: "i" } },
                    { optical_name3_db: { $regex: opticalName.trim(), $options: "i" } }
                ]
            });
        }

        // Combine OR conditions
        const filters = matchOrConditions.length > 0 ? { $and: matchOrConditions } : {};

        // Execute query
        const result = await rawDataModel.find(filters).sort({ client_id: 1 });

        res.status(200).json({
            message: `Total duplicate records found: ${result.length}`,
            result,
            totalRawRecord
        });

    } catch (err) {
        console.error("internal error", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const mergeAndDelete = async (req, res) => {
    try {
        const { clientId, clientName, opticalName1, opticalName2, opticalName3,
            mobile1, mobile2,
            mobile3, email1, email2,
            email3, address1, address2, address3, district, state,
            country, pincode, selectedClients } = req.body;

        console.log("req.body", req.body)
        if (!Array.isArray(selectedClients) || selectedClients.length <= 1) {
            return res.status(400).json({ message: "No selected clients provided" });
        }
        const result = await rawDataModel.findOneAndUpdate(
            { client_id: clientId },
            {
                $set: {
                    optical_name1_db: opticalName1,
                    optical_name2_db: opticalName2,
                    optical_name3_db: opticalName3,
                    client_name_db: clientName,
                    address_1_db: address1,
                    address_2_db: address2,
                    address_3_db: address3,
                    district_db: district,
                    state_db: state,
                    country_db: country,
                    pincode_db: pincode,
                    mobile_1_db: mobile1,
                    mobile_2_db: mobile2,
                    mobile_3_db: mobile3,
                    email_1_db: email1,
                    email_2_db: email2,
                    email_3_db: email3,
                }
            },
            {
                new: true,
            }
        )

        await Promise.all(selectedClients.map(async (doc) => {
            if (doc !== clientId) {
                await rawDataModel.deleteOne({ client_id: doc })
            }
        }))
        console.log(`merge completed in clientId ${clientId}`, result)
        res.status(200).json({ message: `merge completed in clientId ${clientId}` })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const deleteRawDBClient = async (req, res) => {
    try {
        const Id = req.params.id;
        console.log("id------", Id)
        const result = await rawDataModel.findOneAndUpdate({ client_id: Id },
            {
                $set: {
                    isActive_db: false,
                }
            },
            {
                new: true,
            }
        )

        console.log(`merge completed in clientId ${Id}`, result)
        res.status(200).json({ message: `deletion completed in clientId ${Id}` })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const MergeAnddeleteAllRawDBClient = async (req, res) => {
    try {
        const { selectedClients, mergeId } = req.body;

        console.log("id", selectedClients, mergeId)
        if (!Array.isArray(selectedClients) || selectedClients.length <= 1) {
            return res.status(400).json({ message: "No selected clients provided" });
        }
        await Promise.all(selectedClients.map(async (doc) => {
            if (doc !== mergeId) {
                await rawDataModel.deleteOne({ client_id: doc })
            }
        }))
        console.log(`merge completed in clientId ${mergeId}`)
        res.status(200).json({ message: `Merge completed in clientId ${mergeId}` })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const getMobiles = (obj) => {
    return [
        obj.mobile_1_db?.trim(),
        obj.mobile_2_db?.trim(),
        obj.mobile_3_db?.trim(),
    ].filter(Boolean) // remove undefined or empty
}
const extractAllMobiles = (list) => {
    const allMobiles = new Set();
    list.forEach(obj => {
        getMobiles(obj).forEach(mob => allMobiles.add(mob));
    });
    return allMobiles;
};

const filterByFuzzyNameMatch = (rawClient, matchedList) => {
    const name = rawClient.client_name_db?.toLowerCase().trim();
    const optical = rawClient.optical_name1_db?.toLowerCase().trim();
    const rawMobiles = getMobiles(rawClient);

    const allClientMobiles = extractAllMobiles(matchedList)

    return matchedList.filter((client) => {
        const cname = client.client_name_db?.toLowerCase().trim();
        const oname = client.optical_name1_db.toLowerCase().trim();

        const nameScore = stringSimilarity.compareTwoStrings(name, cname)
        const opticalScore = stringSimilarity.compareTwoStrings(optical, oname)

        const isFuzzyMatch = nameScore > 0.8 && opticalScore > 0.8

        // const clientMobiles = getMobiles(client);
        const hasMobileOverlap = rawMobiles.some((mob) => allClientMobiles.has(mob));

        return isFuzzyMatch || hasMobileOverlap
    })
}

// const mergeAndDeleteFromAllDB = async (req, res) => {
//     try {
//         const limit = 5, page = 1;
//         const skip = (page - 1) * limit
//         const totalMigrateCount = await rawDataModel.aggregate([
//             {
//                 $group: {
//                     _id: {
//                         client_name_db: "$client_name_db",
//                         optical_name1_db: "$optical_name1_db",
//                         pincode_db: "$pincode_db",
//                     },
//                     doc: { $push: "$$ROOT" },
//                     count: { $sum: 1 }
//                 }
//             },
//             {
//                 $match: { count: { $gte: 1 } }
//             },
//             {
//                 $lookup: {
//                     from: "clientmodels",
//                     let: {
//                         cname: "$_id.client_name_db",
//                         oname: "$_id.optical_name1_db",
//                         pin: "$_id.pincode_db",
//                     },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$client_name_db", "$$cname"] },
//                                         { $eq: ["$optical_name1_db", "$$oname"] },
//                                         { $eq: ["$pincode_db", "$$pin"] },
//                                     ]
//                                 }
//                             }
//                         }
//                     ],
//                     as: "matchedClients"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "clientsubscriptionmodels",
//                     let: {
//                         cname: "$_id.client_name_db",
//                         oname: "$_id.optical_name1_db",
//                         pin: "$_id.pincode_db",

//                     },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$client_name_db", "$$cname"] },
//                                         { $eq: ["$optical_name1_db", "$$oname"] },
//                                         { $eq: ["$pincode_db", "$$pin"] },

//                                     ]
//                                 }
//                             }
//                         }
//                     ],
//                     as: "matchedSubscriptions"
//                 }
//             },
//             {
//                 $addFields: {
//                     rawCount: "$count",
//                     clientCount: { $size: "$matchedClients" },
//                     subscriptionCount: { $size: "$matchedSubscriptions" }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     rawCount: 1,
//                     clientCount: 1,
//                     subscriptionCount: 1,
//                     rawDocs: "$doc",
//                     matchedClients: 1,
//                     matchedSubscriptions: 1
//                 }
//             },
//             {
//                 $count: "totalGroups",
//             }
//         ])
//         console.log("totlamigrrate count", totalMigrateCount)
//         const aggregationResult = await rawDataModel.aggregate([
//             {
//                 $group: {
//                     _id: {
//                         client_name_db: "$client_name_db",
//                         optical_name1_db: "$optical_name1_db",
//                         pincode_db: "$pincode_db",
//                     },
//                     doc: { $push: "$$ROOT" },
//                     count: { $sum: 1 }
//                 }
//             },
//             {
//                 $match: { count: { $gte: 1 } }
//             },
//             {
//                 $lookup: {
//                     from: "clientmodels",
//                     let: {
//                         cname: "$_id.client_name_db",
//                         oname: "$_id.optical_name1_db",
//                         pin: "$_id.pincode_db",
//                     },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$client_name_db", "$$cname"] },
//                                         { $eq: ["$optical_name1_db", "$$oname"] },
//                                         { $eq: ["$pincode_db", "$$pin"] },
//                                     ]
//                                 }
//                             }
//                         }
//                     ],
//                     as: "matchedClients"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "clientsubscriptionmodels",
//                     let: {
//                         cname: "$_id.client_name_db",
//                         oname: "$_id.optical_name1_db",
//                         pin: "$_id.pincode_db",

//                     },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$client_name_db", "$$cname"] },
//                                         { $eq: ["$optical_name1_db", "$$oname"] },
//                                         { $eq: ["$pincode_db", "$$pin"] },

//                                     ]
//                                 }
//                             }
//                         }
//                     ],
//                     as: "matchedSubscriptions"
//                 }
//             },
//             {
//                 $addFields: {
//                     rawCount: "$count",
//                     clientCount: { $size: "$matchedClients" },
//                     subscriptionCount: { $size: "$matchedSubscriptions" }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     rawCount: 1,
//                     clientCount: 1,
//                     subscriptionCount: 1,
//                     rawDocs: "$doc",
//                     matchedClients: 1,
//                     matchedSubscriptions: 1
//                 }
//             },
//             // {
//             //     $sort:{client_id:1},
//             // },
//             {
//                 $skip: skip
//             },
//             { $limit: limit }
//         ]).option({ allowDiskUse: true }).exec();

//         const refinedResult = aggregationResult.map((group) => {
//             const raw = group.rawDocs[0];
//             const fuzzyClients = filterByFuzzyNameMatch(raw, group.matchedClients)
//             const fuzzySubs = filterByFuzzyNameMatch(raw, group.matchedSubscriptions)

//             return {
//                 ...group,
//                 fuzzyMatchedClients: fuzzyClients,
//                 fuzzyMatchedSubscriptions: fuzzySubs,
//                 fuzzyClientCount: fuzzyClients.length,
//                 fuzzySubscriptionCount: fuzzySubs.length
//             };
//         })
//         res.status(200).json({
//             message: "Fuzzy Matched Duplicates Across DBs",
//             duplicates: refinedResult,
//             totalCount: refinedResult.length,
//             totalMigrateCount
//         });

//     } catch (err) {
//         console.error("Aggregation error", err);
//         res.status(500).json({ message: "Internal error", error: err.message });
//     }
// };


const mergeAndDeleteFromAllDB = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        console.log("page", page)
        // const page = 1
        const limit = 5
        const skip = (page - 1) * limit
        const totalMigrateCount = await rawDataModel.countDocuments({ isActive_db: true });
        totalPage = Math.ceil(totalMigrateCount / limit)

        const clientDoc = await rawDataModel.find({ isActive_db: true }, { client_id: 1, _id: 0 }).skip(skip).limit(limit).sort({ client_id: 1 }).lean()
        const clientId = clientDoc.map((item) => item.client_id)
        // console.log("client", clientId)

        const aggregationResult = await rawDataModel.aggregate([
            { $match: { client_id: { $in: clientId }, isActive_db: true } },
            // {
            //     $addFields: {
            //         mobiles: {
            //             $filter: {
            //                 input: ["$mobile_1_db", "$mobile_2_db", "$mobile_3_db"],
            //                 as: "mobile",
            //                 cond: { $ne: ["$$mobile", ""] }
            //             }
            //         },
            //         emails: {
            //             $filter: {
            //                 input: ["$email_1_db", "$email_2_db", "$email_3_db"],
            //                 as: "email",
            //                 cond: { $ne: ["$email", ""] }
            //             }
            //         },
            //     }
            // },
            // {
            //     $addFields: {
            //         mobiles: { $sortArray: { input: "$mobiles", sortBy: 1 } },
            //         emails: { $sortArray: { input: "$emails", sortBy: 1 } }
            //     }
            // },
            {
                $group: {
                    _id: {
                        client_name_db: { $toLower: "$client_name_db" },
                        optical_name1_db: { $toLower: "$optical_name1_db" },
                        pincode_db: "$pincode_db",
                        // mobile_db: "$mobiles",
                        // email_db: "$emails",
                    },
                    doc: { $push: "$client_id" },
                    count: { $sum: 1 }
                }
            },
            {
                $match: { count: { $gte: 1 } }
            },
            {
                $lookup: {
                    from: "clientmodels",
                    let: {
                        cname: "$_id.client_name_db",
                        oname: "$_id.optical_name1_db",
                        pin: "$_id.pincode_db",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $regexMatch: {
                                                input: { $toLower: "$client_name_db" },
                                                regex: "$$cname",
                                                options: "i"
                                            },
                                        },
                                        {
                                            $regexMatch: {
                                                input: { $toLower: "$optical_name1_db" },
                                                regex: "$$oname",
                                                options: "i"
                                            }
                                        },
                                        { $eq: ["$pincode_db", "$$pin"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "matchedClients",
                }
            },
            {
                $lookup: {
                    from: "clientsubscriptionmodels",
                    let: {
                        cname: "$_id.client_name_db",
                        oname: "$_id.optical_name1_db",
                        pin: "$_id.pincode_db",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $regexMatch: {
                                                input: { $toLower: "$client_name_db" },
                                                regex: "$$cname",
                                                options: "i"
                                            },
                                        },
                                        {
                                            $regexMatch: {
                                                input: { $toLower: "$optical_name1_db" },
                                                regex: "$$oname",
                                                options: "i"
                                            }
                                        },
                                        { $eq: ["$pincode_db", "$$pin"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "matchedSubscriptions"
                }
            },
            {
                $addFields: {
                    rawCount: "$count",
                    clientCount: { $size: "$matchedClients" },
                    subscriptionCount: { $size: "$matchedSubscriptions" }
                }
            },
            {
                $project: {
                    _id: 1,
                    rawCount: 1,
                    clientCount: 1,
                    subscriptionCount: 1,
                    rawDocs: "$doc",
                    matchedClients: 1,
                    matchedSubscriptions: 1
                }
            },
            {
                $sort: { client_id: 1 }
            },
            { $limit: limit }
        ]).option({ allowDiskUse: true }).exec();

        // console.log("aggregationResult", aggregationResult)

        let arr = []
        for (const item of aggregationResult) {
            const obj = await Promise.all(item.rawDocs.map(async (id) => await rawDataModel.findOne({ client_id: id })))
            arr.push(obj)
        }
        const flattenedArr = arr.flat();
        const refinedResult = aggregationResult.map((group) => {
            const fullDocs = group.rawDocs.map(id => {
                return flattenedArr.find(doc => String(doc.client_id) === String(id))
            }).filter(Boolean)

            return {
                ...group,
                rawDocs: fullDocs,
                fuzzyMatchedClients: group.matchedClients,
                fuzzyMatchedSubscriptions: group.matchedSubscriptions,
                fuzzyClientCount: group.clientCount,
                fuzzySubscriptionCount: group.subscriptionCount
            };
        })

        res.status(200).json({
            message: "Fuzzy Matched Duplicates Across DBs",
            duplicates: refinedResult,
            totalCount: refinedResult.length,
            totalMigrateCount,
            totalPage
        });


    } catch (err) {
        console.error("Aggregation error", err);
        res.status(500).json({ message: "Internal error", error: err.message });
    }
};




const updateDataMergeAndDelete = async (req, res) => {
    try {
        const { newData, selectNewDataOption, userId } = req.body

        console.log(newData, selectNewDataOption, 'yo',)
        if (!newData.clientId) {
            res.status(400).json({ message: "missing client Id" })
        }
        const resultRaw = await rawDataModel.findOneAndUpdate(
            { client_id: newData.clientId },
            {
                $set: {
                    userId_db: userId,
                    client_id: newData.clientId,

                    optical_name1_db: newData.opticalName1,
                    optical_name2_db: newData.opticalName2,
                    optical_name3_db: newData.opticalName3,

                    client_name_db: newData.clientName,
                    address_1_db: newData.address,

                    mobile_1_db: newData.mobile1,
                    mobile_2_db: newData.mobile2,
                    mobile_3_db: newData.mobile3,

                    email_1_db: newData.email1,
                    email_2_db: newData.email2,
                    email_3_db: newData.email2,

                    pincode_db: newData.pincode,
                    district_db: newData.district,
                    state_db: newData.state,
                    country_db: newData.country,
                    isActive_db: false,

                }
            },
            { new: true }
        )
        const resultClient = await clientModel.findOneAndUpdate(
            { client_id: newData.clientId },
            {
                $set: {
                    userId_db: userId,
                    client_id: newData.clientId,

                    optical_name1_db: newData.opticalName1,
                    optical_name2_db: newData.opticalName2,
                    optical_name3_db: newData.opticalName3,

                    client_name_db: newData.clientName,
                    address_1_db: newData.address,

                    mobile_1_db: newData.mobile1,
                    mobile_2_db: newData.mobile2,
                    mobile_3_db: newData.mobile3,

                    email_1_db: newData.email1,
                    email_2_db: newData.email2,
                    email_3_db: newData.email2,

                    pincode_db: newData.pincode,
                    district_db: newData.district,
                    state_db: newData.state,
                    country_db: newData.country,

                }
            },
            { new: true }
        )
        const resultClientSubscriber = await clientSubscriptionModel.findOneAndUpdate(
            { client_id: newData.clientId },
            {
                $set: {
                    userId_db: userId,
                    client_id: newData.clientId,

                    optical_name1_db: newData.opticalName1,
                    optical_name2_db: newData.opticalName2,
                    optical_name3_db: newData.opticalName3,

                    client_name_db: newData.clientName,
                    address_1_db: newData.address,

                    mobile_1_db: newData.mobile1,
                    mobile_2_db: newData.mobile2,
                    mobile_3_db: newData.mobile3,

                    email_1_db: newData.email1,
                    email_2_db: newData.email2,
                    email_3_db: newData.email2,

                    pincode_db: newData.pincode,
                    district_db: newData.district,
                    state_db: newData.state,
                    country_db: newData.country,

                }
            },
            { new: true }
        )

        await Promise.all(selectNewDataOption.map(async (doc) => {
            if (doc !== newData.clientId) {
                await rawDataModel.deleteOne({ client_id: doc })
                // await clientModel.deleteOne({ client_id: doc })
                // await clientSubscriptionModel.deleteOne({ client_id: doc })
            }
        }))

        console.log(`merge completed in clientId ${newData.clientId}`)
        res.status(200).json({ message: `Merge completed in clientId ${newData.clientId}` })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err })
    }
}

const skipRawDuplicateRecord = async (req, res) => {
    try {
        const { selectedClientId } = req.body;
        console.log("seelId", selectedClientId)
        if (!selectedClientId) {
            return res.status(404).json({ message: "ClientId cannot be empty" })
        }
        let result;
        await Promise.all(selectedClientId.map(async (doc) => {
            result = await rawDataModel.findOneAndUpdate({ client_id: doc },
                {
                    $set: {
                        isSkip_db: true,
                    }
                },
                {
                    new: true,
                }
            )
        }))
        console.log(`Skip ClientId are`, result)
        res.status(200).json({ message: `Group Hide Successfully`, result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err })
    }
}


const undoSkipDuplicate = async (req, res) => {
    try {
        await rawDataModel.updateMany(
            { isSkip_db: "true" },  // only docs where field does not exist
            { $set: { isSkip_db: "false" } }      // add new field with default value
        );
        console.log("done")
        res.status(200).json({ message: `Undo Skip Successfully` })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err })
    }
}

module.exports = { mergeAndDeleteFromAllDB, skipRawDuplicateRecord, updateDataMergeAndDelete, findDuplicateRecord, MergeAnddeleteAllRawDBClient, findDuplicateRecordBySearch, mergeAndDelete, deleteRawDBClient, undoSkipDuplicate }