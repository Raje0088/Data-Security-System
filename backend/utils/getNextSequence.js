const { Counter } = require("../models/counterModel")

//get next counter uniquely is DYNAMIC for any field like srno, client visiting id, invoice no, etc. --> from CounterModel
//in counterKey just name any NAME you want and for that new document create in db to track its counter
const getNextGobalCounterSequence = async (counterKey) => {
    const counter = await Counter.findOneAndUpdate(
        { _id: counterKey },
        {
            $inc: { sequence_value: 1 },
        },
        { new: true, upsert: true }, // new:true returnupdated doc, upsert:true creates if not exist
    )
    if (!counter || counter.sequence_value === undefined) {
        // throw new Error("Failed to get sequene value")
        return 1
    }
    return counter.sequence_value;
}
const getNextGobalCounterSequenceForRaw = async (counterKey, newValue) => {
    const counter = await Counter.findOneAndUpdate(
        { _id: counterKey },
        { $set: { sequence_value: newValue } },
        { new: true, upsert: true }, // new:true returnupdated doc, upsert:true creates if not exist
    )
    if (!counter || counter.sequence_value === undefined) {
        throw new Error("Failed to get sequene value")
    }
    return counter.sequence_value;
}


//THIS IS NEXT BUTTON COUNTER VALUE FROM CLIENT/USER PAGE
const getLastNextValue = async (counterKey) => {
    const lastValue = await Counter.findOne({ _id: counterKey })
    if (!lastValue || lastValue.sequence_value === undefined) {
        // throw new Error("Failed to get sequene value")
        return 1;
    }
    return lastValue.sequence_value + 1;
}

// why rawDataModel.findOne().sort({clientid:-1}) failed ? 
// becoz if two request send at same time then same id will return lead to error
module.exports = { getNextGobalCounterSequence, getNextGobalCounterSequenceForRaw, getLastNextValue }