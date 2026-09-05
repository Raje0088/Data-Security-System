const express = require("express")
const router = express.Router()
const { getAllUserSubsriptionIds, filterClientSubscriptionData, CheckUserIdforExcelSheet, CheckUserSubsciptionToRedirect, createSubscripbeUser, updateUserScription,
    searchUserSubsciption, deactivateUserData,activateUserData, checkAlreadyDataExist, searchAllUserThroughQuery } = require("../controllers/clientSubscriptionControlller")

router.get("/check-isUser/:id", CheckUserSubsciptionToRedirect)


router.post("/create-subscribe-user", createSubscripbeUser)
router.put("/update-subscribe-user/:id", updateUserScription)
router.get("/search-subscribe-user/:id", searchUserSubsciption)
router.get("/get-usersubscribeids", getAllUserSubsriptionIds)
router.post("/filter-clientsubscribedata", filterClientSubscriptionData)
router.get("/checkuseridpresent/:id", CheckUserIdforExcelSheet)
router.put("/deactivate-user/:id", deactivateUserData)
router.put("/deactivate-user/:id", activateUserData)
router.post("/check-already-exist", checkAlreadyDataExist)
router.get("/search-alluser-match", searchAllUserThroughQuery)

module.exports = router      