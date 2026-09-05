const express = require("express");
// const { UserModel } = require("../models/user.js");
const router = express.Router();
const {createUser,updateUser,getAllUser,searchUserById, filterUserBySearch,userIdExist,deleteUser, getUserHistory} = require("../controllers/userController.js")
const {saveUserForm,searchUserTaskFormId,getUserAssignFormHistory} = require("../controllers/userTaskController.js")
const {authMiddleware} = require("../middleware/authMiddleware.js")

//UserCreate Route
router.post('/createUser',createUser)
router.put("/updateUser/:id",updateUser )
router.get("/search-all-user",getAllUser)
router.get("/search-by-user/:id",searchUserById)
router.get("/filter-user",filterUserBySearch)
router.get("/checked-userId",userIdExist);
router.delete("/delete-user/:id",deleteUser )
router.get("/user-history/:id",getUserHistory)
 




// // ==============USER FORM ROUTES ======================
router.post("/user-task-form",saveUserForm)
router.get("/get-userForm/:id",searchUserTaskFormId)
router.get("/get-userForm-history/:id",getUserAssignFormHistory)

 
module.exports = router