import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
    name: { 
      type: String
    },
    shortName: { 
      type: String
    },
    link: { 
      type: String 
    },
    pairType: { 
      type: String  
    },
    isCrypto: { 
      type: Boolean 
    },
    country: { 
      type: String 
    },
    currentPrice: { 
      type: Number 
    },
    change: { 
      type: Number 
    },
    dayRange: { 
      type: Number 
    },
    technicalSummary: {
      type: String 
    }
  }, { timestamps: true });
  
  export const Asset = mongoose.model("asset", assetSchema);
  