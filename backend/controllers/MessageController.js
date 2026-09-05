const {WhatAppMessageModel} = require("../models/MessageModel")

const saveTemplate = async(req,res)=>{
    try{
        const {templateName,templateId, product, body} = req.body
        const result = await WhatAppMessageModel.create({
                templateName_db:templateName,
                templateId_db:templateId,
                product_db:product,
                body_db:body,
                // imageUrl_db:String,
        })
        res.status(201).json({message:"Message Template Created Successfully",result})
    }catch(err){
        console.log("internal error",err)
        res.status(500).json({message:"internal error",err:err.message})
    }
}

const updateTemplate = async(req,res)=>{
    try{
        const id = req.params.id
        const {templateName,templateId, product, body} = req.body
        const result = await WhatAppMessageModel.updateOne(
            {_id:id},{
                templateName_db:templateName,
                templateId_db:templateId,
                product_db:product,
                body_db:body,
                // imageUrl_db:String,
        },
    {new:true}
)
        res.status(200).json({message:"Message Template Updated Successfully",result})
    }catch(err){
        console.log("internal error",err)
        res.status(500).json({message:"internal error",err:err.message})
    }
}
const deleteTemplate = async(req,res)=>{
    try{
        const id = req.params.id
        const result = await WhatAppMessageModel.deleteOne({_id:id})
        res.status(200).json({message:"Message Template deleted Successfully",result})
    }catch(err){
        console.log("internal error",err)
        res.status(500).json({message:"internal error",err:err.message})
    }
}

//FETCH ALL TEMPLATES
const getTemplate = async(req,res)=>{
    try{
        const result = await WhatAppMessageModel.find()
        res.status(200).json({message:"Message Template Fetch Successfully",result})
    }catch(err){
        console.log("internal error",err)
        res.status(500).json({message:"internal error",err:err.message})
    }
}

// FETCH TEMPLATE PRODUCTWISE
const getProductWiseTemplate = async(req,res)=>{
    try{
        const product = req.params.id;
        const result = await WhatAppMessageModel.find({product_db:product})
        res.status(200).json({message:"Message Template Fetch Successfully",result})
    }catch(err){
        console.log("internal error",err)
        res.status(500).json({message:"internal error",err:err.message})
    }
}

module.exports= {saveTemplate, updateTemplate, deleteTemplate, getTemplate,getProductWiseTemplate}