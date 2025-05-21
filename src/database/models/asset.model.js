import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
    fullName: { 
      type: String
    },
    shortName: { 
      type: String
    },
    detail: { 
      type: String 
    },
    currentPrice: { 
      type: Number 
    },
    priceChange: { 
      type: Number 
    },
    priceChangeInPercent: { 
      type: Number 
    },
    url: { 
      type: String 
    },
    type: { 
      type: String 
    }
  }, { timestamps: true });
  
  export const Asset = mongoose.model("asset", assetSchema);
  