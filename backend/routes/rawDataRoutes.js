
const express = require("express")
const router = express.Router();
const { rawDataDump, createNewRawDBRecord, getrawDataDump, getrawDataNewFormId, deactivateRawData, activateRawData, filterRawData,rawSampleFile ,rawDBExcelUploadData,getLastGlobalId,gilterDataFromAllDB, deleteRawDBData} = require("../controllers/rawDataController")
const { findDuplicateRecord,MergeAnddeleteAllRawDBClient, findDuplicateRecordBySearch, mergeAndDelete, deleteRawDBClient,mergeAndDeleteFromAllDB,skipRawDuplicateRecord ,undoSkipDuplicate} = require("../controllers/DuplicateAndMergeDataController")
const assetPath = require("../utils/assetPath")
const path= require("path")
const fs = require("fs");
const multer = require("multer")
// router.use("/uploadExcel",express.static(path.join(__dirname,"../uploadExcel")))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, assetPath.uploadExcel)
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
})

const upload = multer({ storage: storage })

// In routes file (e.g., rawDataRoutes.js)
router.post("/raw-data-dump", upload.single("uploadExcelSheet"), (req, res) => {
    const filename = req.file.filename;
    res.status(202).json({ message: "Upload received", filename });
});

router.get("/stream-insert/:filename", rawDataDump);
router.get("/search-raw-data/:id", getrawDataDump)
router.post("/create-raw-data/", createNewRawDBRecord)
router.get("/get-last-client-id", getrawDataNewFormId)
router.put("/deactivate-rawdata/:id", deactivateRawData)
router.put("/activate-rawdata/:id", activateRawData)
router.post("/filters-rawdata", filterRawData)
router.post("/filters-alldb", gilterDataFromAllDB)
router.get("/duplicate-records-rawdata", findDuplicateRecord)
router.get("/search-duplicate-records-rawdata", findDuplicateRecordBySearch)
router.post("/mergeanddelete", mergeAndDelete)
router.delete("/duplicate-delete/:id", deleteRawDBClient)
router.post("/duplicate-mergedelete", MergeAnddeleteAllRawDBClient)
router.get("/samplefile", rawSampleFile)
router.get("/excel-data/:id", rawDBExcelUploadData)
router.get("/mergefrom-alldb", mergeAndDeleteFromAllDB)
router.post("/skip-ids", skipRawDuplicateRecord)
router.get("/undo-skip", undoSkipDuplicate)
router.get("/global-id", getLastGlobalId)
router.delete("/delete-allrawId",deleteRawDBData)


module.exports = router;