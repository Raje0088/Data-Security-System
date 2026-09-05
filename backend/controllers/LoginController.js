const { UserModel } = require("../models/user")
const { loginRecordModel } = require("../models/LoginRecordModel")
const bcrypt = require('bcryptjs');
const requestIp = require('request-ip')
const geoip = require('geoip-lite');
const { generateAccessToken, generateRefreshToken, verifyAccessToken } = require("../utils/Authenthecation")

// const userLogin = async (req, res) => {
//     try {
//         const { userId, password } = req.body;
//         const result = await Secure_User_Data_Model.findOne({ userID: userId })
//         if (!result) return res.status(500).json({ message: "User Id not Found" })

//         const ipResponse = await fetch("https://api.ipify.org?format=json");
//         const { ip } = await ipResponse.json();

//         console.log("Public IP:", ip);
//         const response = await fetch(`http://ip-api.com/json/${ip}`);
//         const data = await response.json()

//         // console.log("data", data)

//         const record = await loginRecordModel.create({
//             userId_db: userId,
//             loginTime_db: new Date().toLocaleTimeString("en-GB"),
//             date_db: new Date().toLocaleDateString("en-GB"),
//             location_db:data.city,
//             ip_db:ip,
//             lat_db:data.lat,
//             lon_db:data.lon,
//         })

//         console.log("login records", record)

//         const matchPassword = await bcrypt.compare(password, result.password);
//         if (matchPassword) {
//             return res.status(200).json({ message: "Password Match", userLoginId: userId })
//         } else {
//             return res.status(500).json({ message: "Password not Match" })
//         }

//     } catch (err) {
//         console.log("internal error", err)
//     }
// }

const userLogin = async (req, res) => {
    try {
        const date = new Date().toISOString().split("T")[0]
        const { userId, password } = req.body;
        const result = await UserModel.findOne({ userID: userId });
        if (!result) return res.status(500).json({ message: "User Id not Found" });

        // Get LAN/internal IP of the client
        let ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Remove IPv6 prefix if present (::ffff:)
        if (ip.startsWith("::ffff:")) ip = ip.split("::ffff:")[1];

        // Lookup location using geoip-lite
        const geo = geoip.lookup(ip) || { city: "Local Network", ll: [0, 0] };
        const data = { city: geo.city, lat: geo.ll[0], lon: geo.ll[1] };
        // Record login
        const record = await loginRecordModel.create({
            userId_db: userId,
            loginTime_db: new Date().toLocaleTimeString("en-GB"),
            date_db: date,
            location_db: data.city,
            ip_db: ip,
            lat_db: data.lat,
            lon_db: data.lon,
            start_db: new Date().getTime(),
            session_db: true
        });

        // console.log("login records======================", record, result);

        // Check password
        const matchPassword = await bcrypt.compare(password, result.password);

        const accessToken = generateAccessToken(result)
        const refreshToken = generateRefreshToken()
        if (!matchPassword) {
            return res.status(500).json({ message: "Password not Match" });
        }

        result.refreshToken = refreshToken
        await result.save()

        // console.log("yo", accessToken, refreshToken)

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,       // ❗ false for localhost
            sameSite: "none",     // ❗ allow frontend → backend cookies
            path: "/",           // ❗ important
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        res.status(200).json({ message: "!Password Match. Login Successful ", accessToken ,masterData:result.master_data_db});

    } catch (err) {
        console.log("internal error", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const userLogout = async (req, res) => {
    try {
        const { userLoginId } = req.body;
        const date = new Date().toISOString().split("T")[0]
        const time = new Date().toLocaleTimeString("en-GB");
        console.log("userLoginId", userLoginId.userId)
        const existingLogin = await loginRecordModel.findOne({ userId_db: userLoginId.userId, date_db: date, session_db: true })
        if (!existingLogin) return res.status(400).json({ message: `Login session not available for ${userLoginId.userId}` })

        const end = new Date().getTime()
        const totalSecond = Math.floor((end - existingLogin?.start_db) / 1000);
        const hr = Math.floor(totalSecond / 3600)
        const min = Math.floor((totalSecond % 3600) / 60)
        const sec = Math.floor(totalSecond % 60)

        const totalDuration = `${hr}hr ${min}min ${sec}sec`
        const result = await loginRecordModel.findOneAndUpdate(
            { userId_db: userLoginId.userId, date_db: date, session_db: true },
            {
                $set: {
                    logoutTime_db: time,
                    totalHours_db: totalDuration,
                    session_db: false,
                    end_db: end,
                }
            }
        )

        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(200).json({ message: "Logged out without refresh token" });
        }
        const user = await UserModel.findOne({ refreshToken: refreshToken })
        if (user) {
            user.refreshToken = null
            user.save()
        }
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
        });

        res.status(200).json({ message: `${userLoginId.userId} Logout Successfully`, result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const refresh = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        console.log("token",token)
        if (!token) return res.status(500).json({ message: "No refresh token found" })

        const user = await UserModel.findOne({ refreshToken: token })
     if (!user) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Invalid refresh token" });
    }

        const newAccessToken = generateAccessToken(user)
        const newRefreshToken = generateRefreshToken();
        // console.log("newRefreshToken",newRefreshToken)

        user.refreshToken = newRefreshToken
        await user.save()

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,       // ❗ false for localhost
            sameSite: "none",     // ❗ allow frontend → backend cookies
            path: "/",           // ❗ important
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({ accessToken: newAccessToken,masterData:user.master_data_db })
    } catch (err) {
        console.log("internal errro", err)
        res.status(500).json({ messge: "internal errror", err: err.message })
    }
}

module.exports = { userLogin, userLogout, refresh }