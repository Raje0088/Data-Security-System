const { UserModel, userHistorModel } = require("../models/user.js")
const { PermissionModel } = require("../models/user.js");
const { Secure_User_Data_Model } = require("../models/user.js");
const { generateUserId } = require("../utils/generateUserId.js")
const { getDateAndTime } = require("../utils/getLocalTimeAndDate.js")
const bcrypt = require('bcryptjs');

//CREATING NEW USER, ADMIN
const createUser = async (req, res) => {
    try {
        console.log("REQ BODY:", req.body);
        const { roleName, name, mobile,
            division, email, assignProduct,
            createdById,
            create_P,
            update_P,
            delete_P,
            edit_P,
            view_P,
            uploadFile_P,
            permissionData,
            download_P, userIdText, passwordText, } = req.body;
console.log("permsissionData",permissionData)
        const emailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailValidation.test(email)) return res.status(400).json({ message: "Invalid Email, email must contain @" })

        const mobileValidation = /^\d{10}$/;
        if (!mobileValidation.test(mobile)) return res.status(400).json({ message: "Mobile must be 10 digits" })

        if (!userIdText) return res.status(404).json({ message: "Please provide User Id" })

        const isExistMobile = await UserModel.findOne({ mobile: mobile })
        if (isExistMobile) return res.status(404).json({ message: "Mobile already exist.Please another number" })
        const isExistEmail = await UserModel.findOne({ email: email })
        if (isExistEmail) return res.status(404).json({ message: "Email already exist.Please another email" })

        const generateUniqueId = await generateUserId(roleName, createdById);
        console.log("generatedUniqueId yo", generateUniqueId)
        let roleType;
        if (roleName === "ADMIN" || roleName === "MANAGER") {
            roleType = "Admin"
        } else {
            roleType = "Executive"
        }

        const hashPassword = await bcrypt.hash(passwordText, 10)
        console.log("hasPas", hashPassword)

        const result = await UserModel.create(
            {
                roleName,
                name,
                mobile,
                division,
                email,
                assignProduct,
                generateUniqueId: generateUniqueId,
                createdBy: createdById,
                create_P,
                update_P,
                delete_P,
                edit_P,
                view_P,
                uploadFile_P,
                download_P,
                password: hashPassword,
                roleType: roleType,
                userID: userIdText,
                "master_data_db.productPermissions":permissionData,
            }
        );
        console.log("User Created Successfully", result);
        await userHistorModel.create({ userHistory: result })
        res.status(201).json({ message: "User Created Successfully", user: result });
    } catch (err) {
        console.log("internal error", err);
        res.status(500).json({ message: "internal error", err: err.message });
    }
}

const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { roleName, name, mobile,
            division, email, assignProduct,
            updatedById,
            create_P,
            update_P,
            delete_P,
            edit_P,
            view_P,
            uploadFile_P,
            permissionData,
            download_P, userIdText, passwordText, } = req.body;

        const emailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailValidation.test(email)) return res.status(400).json({ message: "Invalid Email, email must contain @" })

        const mobileValidation = /^\d{10}$/;
        if (!mobileValidation.test(mobile)) return res.status(400).json({ message: "Mobile must be 10 digits" })


        const hashPassword = await bcrypt.hash(passwordText, 10)
        let roleType;
        if (roleName === "ADMIN" || roleName === "MANAGER") {
            roleType = "Admin"
        } else {
            roleType = "Executive"
        }

        const result = await UserModel.findOneAndUpdate(
            { generateUniqueId: id },
            {
                "$set":
                {
                    roleName,
                    name,
                    mobile,
                    division,
                    email,
                    assignProduct,
                    updatedBy: updatedById,
                    create_P,
                    update_P,
                    delete_P,
                    edit_P,
                    view_P,
                    uploadFile_P,
                    download_P,
                    password: hashPassword,
                    userID: userIdText,
                    roleType: roleType,
                    "master_data_db.productPermissions":permissionData,
                }
            },
            { new: true } // return updated document
        )
        console.log("User updated successfully")
        await userHistorModel.create({ userHistory: result })
        res.status(200).json({ message: "User updated successfully", user: result })
    } catch (err) {
        console.log("User not updated", err);
        res.status(500).json({ message: "user not updated", err: err.message })
    }
}

const getAllUser = async (req, res) => {
    try {
        const result = await UserModel.find({ isActive: "Active" })
        res.status(200).json({ message: "All User Data", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const searchUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await UserModel.findOne({ generateUniqueId: id });
        res.status(200).json({ message: "User found", result });

    } catch (err) {
        console.log("Search failed ", err)
        res.status(500).json({ message: "search failed in usermodel", err: err.message })
    }
}

const filterUserBySearch = async (req, res) => {
    try {
        const { name, email, mobile, division, roleName, assignProduct, searchField } = req.query;
        console.log("req query", req.query)
        let filters = {}
        if (searchField) filters.generateUniqueId = searchField
        if (name) filters.name = { $regex: name, $options: "i" }
        if (email) filters.email = { $regex: email, $options: "i" }
        if (mobile) filters.mobile = mobile
        filters.isActive = "Active"
        const result = await UserModel.find(filters);
        res.status(200).json({ message: `Total User found ${result.length}`, result });

    } catch (err) {
        console.log("Search failed ", err)
        res.status(500).json({ message: "search failed in usermodel", err: err.message })
    }
}




const userIdExist = async (req, res) => {
    const { userId, uniqueUserIdGenerator } = req.query;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const isUserId = await UserModel.findOne({ userID: userId, generateUniqueId: { $ne: uniqueUserIdGenerator } });
    console.log("exist", !!isUserId, uniqueUserIdGenerator)
    res.json({ exists: !!isUserId });
}



const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await UserModel.findOneAndUpdate(
            {
                generateUniqueId: id
            },
            {
                $set: {
                    isActive: "Deactive",
                }
            },
            {
                new: true,
            }
        );
        console.log("User Deleted Successfully");
        await userHistorModel.create({ userHistory: result })
        res.status(200).json({ message: "User Deactived Successfully", user: result })
    } catch (err) {
        console.log("User Not Delete")
        res.status(500).json({ err: err.message });
    }

}

const getUserHistory = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await userHistorModel.find({ "userHistory.generateUniqueId": id }).sort({ _id: 1 });
        res.status(200).json({ message: "User History found", result });

    } catch (err) {
        console.log("Search failed ", err)
        res.status(500).json({ message: "search failed in usermodel", err: err.message })
    }
}

// module.exports = { updateUserIdAndPassword, searchUserByNameorMobileorEmail, createUser, updateUser, getAllUsers, deleteUser, deletePermssion, deleteUserIdPassword, addPermission, updatePermission, userIdExist, UserIdAndPassword, getNextUserId, searchByUserModel, searchByPermissionModel, searchByUserIdPasswordModel, searchAllUser, searchAllPermission, searchAllId }
module.exports = { createUser, updateUser, getAllUser, searchUserById, filterUserBySearch, deleteUser, userIdExist, getUserHistory }