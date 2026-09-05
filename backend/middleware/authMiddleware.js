const { verifyAccessToken } = require("../utils/Authenthecation")

const authMiddleware = (req, res, next) => {
    try {
        const authHeaders = req.headers.authorization;
        if (!authHeaders) {
            return res.status(401).json({ message: "No access token provided" })
        }

        const token = authHeaders.split(" ")[1]

        // console.log("token",token)
        const decodeToken = verifyAccessToken(token)
        console.log("decode",decodeToken)
        if (!decodeToken) return res.status(401).json({ message: "Invalid or expired access token" })


        // 3. Attach user info to request 
        req.user = {
            userId: decodeToken.userId,
            roleType: decodeToken.roleType,
            userName:decodeToken.userName,
            permission: decodeToken.permission,
            // masterData: decodeToken.masterData
        }
          next();
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

module.exports = {authMiddleware}