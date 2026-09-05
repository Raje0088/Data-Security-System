const { client } = require("../config/redis")
const { rawDataModel } = require("../models/rawDataModel")
const { clientModel } = require("../models/clientModel")
const { clientSubscriptionModel } = require("../models/clientSubscriptionModel");
const { pinCodeModel } = require("../models/dumpIndiaData")

const filterArea = async () => {
    try {
        // await client.flushDb();
        const data = await client.get("states")
        if (data) {
            console.log("Redis cache already exists. Skipping rebuild.");
            return;
        }


        const allData = await pinCodeModel.find({}, { state_db: 1, district_db: 1, pincode_db: 1 })
        console.log("dfkasd")
        const uniqueState = new Set()
        const districtMap = {}
        const pincodeMap = {}

        for (const item of allData) {
            const { state_db, district_db, pincode_db } = item

            if (!state_db || !district_db || !pincode_db) continue;

            uniqueState.add(state_db)
            if (!districtMap[state_db]) districtMap[state_db] = new Set()
            districtMap[state_db].add(district_db)

            const key = `${state_db}:${district_db}`

            if (!pincodeMap[key]) pincodeMap[key] = new Set()
            pincodeMap[key].add(pincode_db)
        }
        // console.log("deleted------------", uniqueState)
        await client.set("states", JSON.stringify([...uniqueState]))

        for (const state in districtMap) {
            await client.set(`districts:${state}`, JSON.stringify([...districtMap[state]]))
        }
        for (const dist in pincodeMap) {
            // console.log("sdjflalsdjfsd",dist)
            await client.set(`pincodes:${dist}`, JSON.stringify([...pincodeMap[dist]]))
        }
        console.log("processing completed")
    } catch (err) {
        console.log("internal error", err)
        // res.status(500).json({ message: "internal error", err: err.message })
    }
}

const getFilterState = async (req, res) => {
    try {
        const { stateArray, districtArray } = req.body;
        console.log("req.body", req.body)

        const states = await client.get("states")
        let districts = [], pincodes = [];

        if (stateArray.length > 0) {
            const districtRawArray = await Promise.all(stateArray.map((state) => (client.get(`districts:${state}`))))
            districts = districtRawArray.filter(Boolean).map((item, idx) => {
                const distArray = JSON.parse(item).sort()
                return distArray.map((dist) => ({ districtName: dist, stateName: stateArray[idx] }))
            }).flat()
            console.log("dist", districts)
        }
        const data = await client.get(`pincodes:MAHARASHTRA:AKOLA`)
        // console.log("akola", data)

        let pincodeKeys = [];
        for (const state of stateArray) {
            const districtsRaw = await client.get(`districts:${state}`)
            const districtsForState = districtsRaw ? JSON.parse(districtsRaw) : []

            const selectedDistricts = districtArray.length > 0 ? districtArray.filter((d)=> districtsForState.includes(d)) : districtsForState
            
            for(const dist of selectedDistricts){
                pincodeKeys.push({state,dist, keys:`pincodes:${state}:${dist}`})
            }
    
        }

        const  pincodeRawArray = await Promise.all(pincodeKeys.map(i=> client.get(i.keys)))

         pincodes = pincodeRawArray.filter(Boolean).map((item,idx)=>{
            const  pinArray=JSON.parse(item).sort();
            const {state,dist} = pincodeKeys[idx]
            return pinArray.map((pin)=>({
                pincode:pin,
                districtName:dist,
                stateName:state,
            }))
        }).flat()
 
        res.status(200).json({
            message: "Redis States found",
            stateList: JSON.parse(states).sort(),
            districtList: districts,
            pincodeList: pincodes.sort(),
        })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

module.exports = { filterArea, getFilterState }