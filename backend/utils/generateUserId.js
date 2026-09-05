const { UserModel } = require("../models/user")

// GET AUTO USER ID GENERATOR i.e --> E01_SA, E02_SA, A01_SA
const generateUserId = async (role, createdById) => {
    console.log("Generating ID for role:", role, "createdBy:", createdById);
    const count = await UserModel.countDocuments({
        roleName: role,
        createdBy: createdById,
    })
    console.log("Existing user count for this combo:", count);
    const numberCount = String(count + 1).padStart(2, '0');
    let prefix = '';
    const firstLetter = role[0] 
    prefix = `${firstLetter}${numberCount}_${createdById}`;

console.log("Generated Prefix:", prefix);
    return prefix;
}

//THIS DISPLAY generateUserId ON FRONTEND SCREEN
const getGenerateUserId = async (req, res) => {
    try {
        const { roleName, createdBy } = req.body;
        console.log("generatedUserId is ", roleName);
        const result = await generateUserId(roleName, createdBy)
        console.log("generatedUserId is ", result);
        res.status(200).json({ message: "generateUserId is ", result })
    } catch (err) {
        console.log("internal error in fetch", err)
        res.status(500).json({ message: "internal error in fetch", err: err.message })
    }
}

module.exports = { generateUserId, getGenerateUserId };   