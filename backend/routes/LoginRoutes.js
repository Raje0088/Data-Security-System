const express = require("express")
const router = express.Router()
const {userLogin, userLogout ,refresh,} = require("../controllers/LoginController")
const {authMiddleware} = require("../middleware/authMiddleware")
const {decodeToken} = require("../utils/Authenthecation")

router.post("/login",userLogin)
router.post("/logout",userLogout)

router.post("/refresh",refresh) 
router.get("/decode", authMiddleware, decodeToken);

module.exports = router 