const mongoose = require("mongoose");
const { pinCodeModel } = require("../models/dumpIndiaData")
const { rawDataModel } = require("../models/rawDataModel")
const { districtnames, statenames } = require("../utils/MasterPlaceList")
const path = require("path")
const fs = require("fs");

//FETCH STATE,DISTRICT, COUTNRY FROM PINCODE
const searchPincode = async (req, res) => {
    try {
        const { pincode } = req.query;

        // Build filter object
        let filter = {};
        if (pincode) filter.pincode_db = pincode.trim();

        const results = await pinCodeModel.findOne(filter)
        if (!results) return res.status(404).json({ message: "Pincode not found. !Please contact to superadmin" })
        res.status(200).json({ results })

    } catch (err) {
        console.log("search failed internal error", err)
        res.status(500).json({ message: "search failed dur to internal error", err: err.message })
    }
}

const getStateDistrictVillageName = async (req, res) => {
    try {
        const { state, district, taluka, village, pincode } = req.query;

        const filter = {};
        if (state) filter.state_db = state;
        if (district) filter.district_db = district;
        if (taluka) filter.taluka_db = taluka;
        if (village) filter.village_db = village;
        if (pincode) filter.pincode_db = pincode;



        const statelist = await pinCodeModel.distinct("state_db", filter)
        const districtlist = await pinCodeModel.distinct("district_db", filter)
        const talukalist = await pinCodeModel.distinct("taluka_db", filter)
        const villagelist = await pinCodeModel.distinct("village_db", filter)
        const pincodelist = await pinCodeModel.distinct("pincode_db", filter)

        res.json({
            statename: statelist,
            districtname: districtlist,
            talukaname: talukalist,
            villagename: villagelist,
            pincodename: pincodelist,
        })

    } catch (err) {
        console.log("search failed internal error", err)
        res.status(500).json({ message: "search failed dur to internal error", err: err.message })
    }
}

const createPincode = async (req, res) => {
    try {
        const { pincode, state, country, taluka, village, district, } = req.body;
        const existing = await pinCodeModel.findOne({ pincode_db: pincode });
        if (existing) {
            return res.status(200).json({
                message: "Pincode already exists in database",
                result: existing
            });
        }

        const result = await pinCodeModel.create({
            pincode_db: pincode,
            state_db: state,
            district_db: district,
            taluka_db: taluka,
            village_db: village,
            country_db: country,
            latterPincode_id: "#NewPincode$",
        })
        console.log("New Pincode Created Successfully", result);
        res.status(201).json({ message: "New Pincode Created Successfully", result })
    } catch (err) {
        console.log("Internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const getLatterPincode = async (req, res) => {
    try {
        const total = await pinCodeModel.countDocuments()
        const result = await pinCodeModel.find({
            latterPincode_id: "#NewPincode$"
        }).sort({ _id: 1 })
        console.log("New Pincode found Successfully", result);
        res.status(201).json({ message: "New Pincode found Successfully", result, total })
    } catch (err) {
        console.log("Internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const updateLatterPincode = async (req, res) => {
    try {
        const { searchPincode, pincode, state, country, taluka, village, district, } = req.body;
        const result = await pinCodeModel.findOneAndUpdate(
            { pincode_db: searchPincode },
            {
                $set: {

                    pincode_db: pincode,
                    state_db: state,
                    district_db: district,
                    taluka_db: taluka,
                    village_db: village,
                    country_db: country,
                    latterPincode_id: "#NewPincode$",
                }
            },
            { new: true }
        )
        console.log("New Pincode found Successfully", result);
        res.status(201).json({ message: "New Pincode found Successfully", result })
    } catch (err) {
        console.log("Internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const deleteLatterPincode = async (req, res) => {
    try {
        const { pincode } = req.body;
        const result = await pinCodeModel.findOneAndDelete({ pincode_db: pincode })
        console.log("New Pincode delete Successfully", result);
        res.status(201).json({ message: "New Pincode delete Successfully", result })
    } catch (err) {
        console.log("Internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//FETCH  STATE,DISTRICT,COUNTRY,PINCODE WHICH PRESENT IN DB
const fetchPlaceRawDB = async (req, res) => {
    try {
        let districtArray = await rawDataModel.distinct("district_db")
        let stateArray = await rawDataModel.distinct("state_db")
        let countryArray = await rawDataModel.distinct("country_db")
        let pincodeArray = await rawDataModel.distinct("pincode_db")

        const newDistrict = districtArray.map(d => d.trim().toUpperCase()).sort()
        const newState = stateArray.map(s => s.trim().toUpperCase()).sort()
        const newCountry = countryArray.map(c => c.trim().toUpperCase()).sort()
        const newPincode = pincodeArray.map(p => p.trim().toUpperCase()).sort()

        res.status(200).json({ message: "pincode founds", districtArray: newDistrict, stateArray: newState, countryArray: newCountry, pincodeArray: newPincode })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}


//TO SAVE/STORE SAMPLE EXCEL PINCODE FILE IN UPLOAD FOLDER
const sampleExcelFile = async (req, res) => {
    try {
        const filepath = path.join(__dirname, "../sampleFile/sample.csv");
        res.download(filepath, "sample.csv", (err) => {
            if (err) {
                console.error("Error sending sample file:", err);
                if (!res.headersSent) {
                    res.status(500).send("Could not download the file.");
                }
            }
        });
    } catch (err) {
        console.log("internal error", err)
        if (!res.headersSent) {
            res.status(500).json({ message: "Internal error", err: err.message });
        }
    }
}


const updateStateDistrictName = async (req, res) => {
    try {
        const { name, prevName, changeName } = req.body;
        if (name === "district") {
            const index = districtnames.findIndex(d => d === prevName)
            console.log("index", index, districtnames[index])
            districtnames[index] = changeName
        }
        if (name === "state") {
            const index = statenames.findIndex(d => d === prevName)
            console.log("index", index, statenames[index], changeName)
            statenames[index] = changeName
        }

        // Rewrite the file with updated arrays
        const filePath = path.join(__dirname, "../utils/MasterPlaceList.js");
        console.log("filepath", filePath)
        const content = `
const statenames = ${JSON.stringify(statenames, null, 4)};
const districtnames = ${JSON.stringify(districtnames, null, 4)};
module.exports = { districtnames, statenames };
`;

        fs.writeFileSync(filePath, content);

        res.status(200).json({ message: "Updated Successfully" })
    } catch (err) {
        console.log("Internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const getStateDistrictName = async (req, res) => {
    try {
        const { name, search } = req.query;
        let result
        console.log("search", search)



        if (name === "district") {
            if (!search) {
                result = districtnames
            } else {
                result = districtnames.filter(districtName => {
                    return districtName.toUpperCase().includes(search)
                })
            }
        } else if (name === "state") {
            if (!search) {
                result = statenames
            } else {

                result = statenames.filter(stateName => {
                    return stateName.toUpperCase().includes(search)
                })
            }
        }
        res.status(200).json({ mesage: "name are", result })
    } catch (err) {
        console.log("Internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//FOR SEARCH PAGE FILTERING PINCODE AFTER SELECTING STATE DISTRICT

const filterPincodeForAssignTask = async (req, res) => {
    try {
        const { district } = req.query;

        let filters = {}

        if (district) {
            filters.district_db = district
        }
        const pin = await rawDataModel.find(filters)
        const result = pin?.map((p) => (p.pincode_db))
        res.status(200).json({ message: "pincode found", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}



module.exports = { deleteLatterPincode, filterPincodeForAssignTask, sampleExcelFile, fetchPlaceRawDB, updateLatterPincode, searchPincode, getLatterPincode, createPincode, getStateDistrictVillageName, updateStateDistrictName, getStateDistrictName }


//aggregation pipeline used
// app.get("/api/pincodes", async (req, res) => {
//   try {
//     const {
//       state,
//       district,
//       taluka,
//       village,
//       pincode,
//       sortBy,
//       sortOrder = "asc",
//       lastId,
//       limit = 20,
//     } = req.query;

//     const pipeline = [];

//     // Filtering
//     if (state) pipeline.push({ $match: { state_db: state.trim().toUpperCase() } });
//     if (district) pipeline.push({ $match: { district_db: district.trim().toUpperCase() } });
//     if (taluka) pipeline.push({ $match: { taluka_db: taluka.trim().toUpperCase() } });
//     if (village) pipeline.push({ $match: { village_db: village.trim().toUpperCase() } });
//     if (pincode) pipeline.push({ $match: { pincode_db: pincode.trim() } });

//     // Cursor pagination
//     if (lastId) {
//       pipeline.push({ $match: { _id: { $gt: mongoose.Types.ObjectId(lastId) } } });
//     }

//     // Sorting
//     let sortStage = {};
//     if (sortBy) {
//       sortStage[sortBy] = sortOrder === "desc" ? -1 : 1;
//     } else {
//       sortStage._id = 1;
//     }
//     pipeline.push({ $sort: sortStage });

//     // Limit
//     pipeline.push({ $limit: parseInt(limit) });

//     // Run aggregation
//     const results = await pinCodeModel.aggregate(pipeline);

//     const newLastId = results.length ? results[results.length - 1]._id : null;

//     res.json({
//       data: results,
//       lastId: newLastId,
//       count: results.length,
//     });
//   } catch (err) {
//     console.error("Aggregation search API error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
