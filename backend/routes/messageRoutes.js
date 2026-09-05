const {saveTemplate, updateTemplate, deleteTemplate, getTemplate,getProductWiseTemplate} = require("../controllers/MessageController")
const express = require("express")
const router = express.Router()

router.post("/save-template",saveTemplate)
router.put("/update-template/:id",updateTemplate)
router.delete("/delete-template/:id",deleteTemplate)
router.get("/get-template",getTemplate)
router.get("/get-prod-template/:id",getProductWiseTemplate)

module.exports = router