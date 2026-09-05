const mongoose = require("mongoose")

const WhatAppSchema = new mongoose.Schema({
    templateName_db:String,
    templateId_db:String,
    product_db:String,
    body_db:String,
    imageUrl_db:String,

},{timeStamps:true})

const WhatAppMessageModel = mongoose.model("WhatAppMessageModel",WhatAppSchema)

module.exports = {WhatAppMessageModel};