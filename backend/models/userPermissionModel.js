const mongoose = require("mongoose")

const regionBlockSchema = new mongoose.Schema({
    name_db:{type:String},
    districtId_db:{type:mongoose.Schema.Types.ObjectId, ref:"districtModel", required: true},

    pincodeIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"pincodeModel",
    }]
})

const productSchema = new mongoose.Schema({
    name_db:{type:String},
    area_db:{type:String},
})

const userProductPermissionSchema = new mongoose.Schema({
  userId_db: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  productId_db: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "productModel",
    required: true,
    index: true
  },

  permissions_db: {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false }
  },

  scopeType_db: {
    type: String,
    enum: ["ALL_COUNTRY", "STATE", "DISTRICT", "REGION_BLOCK"],
    required: true
  },

  scopeRefs_db: [{
    type: mongoose.Schema.Types.ObjectId,
    required: false
  }]

}, { timestamps: true })


regionBlockSchema.index({districtId_db:1})
productSchema.index({name_db:1});
userProductPermissionSchema.index(
  { userId_db: 1, productId_db: 1 },
  { unique: true }
)
userProductPermissionSchema.index({ scopeType_db: 1 })


const regionBlockModel = mongoose.model("regionBlockModel", regionBlockSchema)
const productModel = mongoose.model("productModel", productSchema)
const userProductPermissionModel = mongoose.model("userProductPermissionModel", userProductPermissionSchema)

module.exports = {regionBlockModel, productModel, userProductPermissionModel}; 