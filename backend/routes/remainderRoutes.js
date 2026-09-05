const express = require("express")
const router = express.Router()
const {getRemainders,getCompleteRemainer,getAllRemainderForAssignTask,deleteReminder,getUserWiseReminder} = require("../controllers/remainderController")

router.get("/remainder",getRemainders)
router.get("/status",getCompleteRemainer)
router.get("/get-assign-remainder",getAllRemainderForAssignTask)
router.get("/user-reminder",getUserWiseReminder)
router.delete("/rem-del/:id",deleteReminder)
module.exports = router