import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
    name: { 
      type: String,
      required: [true, "Asset name is required!"],
      trim: true
    },
    shortName: {   //shortName aka symbol
      type: String,
      trim: true,
    },
    link: { 
      type: String,
      trim: true
    },
    pairType: { 
      type: String  
    },
    isCrypto: { 
      type: Boolean,
      default: false
    }
  }, { timestamps: true });
  
  export const Asset = mongoose.model("asset", assetSchema);
  