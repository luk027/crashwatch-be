import mongoose from "mongoose";

export const connectDB = async() =>{
    await mongoose.connect(process.env.MONGODB_URL)
        .then(() => console.log(`MongoDB is Connected!`))
        .catch((err) => console.log(`MongoDB Error, `,err));
}