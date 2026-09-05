const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()
const crypto = require("crypto")

const generateAccessToken = (userData) => {
    return jwt.sign({
        userId: userData.generateUniqueId,
        userName:userData.name,
        roleType: userData.roleType,
        permission: {
            create_P: userData.create_P,
            uploadFile_P: userData.uploadFile_P,
            download_P: userData.download_P,
            delete_P :userData.delete_P
        },
        // masterData: userData.master_data_db
    },
        process.env.SECRET_ACCESS_TOKEN,
        { expiresIn: "15m" },
    )
}

const generateRefreshToken = () => {
    console.log("crypt", crypto.randomBytes(40).toString("hex"))
    return crypto.randomBytes(64).toString("hex");
}

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.SECRET_ACCESS_TOKEN)

}

const decodeToken = async (req, res) => {
    try {
        console.log("user",req.user)
        return res.status(200).json({
            success: true,
            userData: req.user   // middleware already did the job
        });
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, decodeToken }