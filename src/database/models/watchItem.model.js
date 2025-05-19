import mongoose from "mongoose";

const watchItemSchema = new mongoose.Schema({
    fullName: { type: String },
    shortName: { type: String },
    detail: { type: String },
    currentPrice: { type: Number },
    priceChange: { type: Number },
    priceChangeInPercent: { type: Number },
    url: { type: String },
    type: { type: String },
    addedAt: { type: Date, default: Date.now },
  });
  
  export const WatchItem = mongoose.model("watchItem", watchItemSchema);
  