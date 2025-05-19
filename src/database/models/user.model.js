import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required!"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: [true, "Email must be unique!"],
        lowercase: [true, "Email must be in lowercase!"],
        trim: true,
    },
    password: {
        type: String,   
        required: [true, "Password is required!"]
    },
    watchlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "watchItem"
        }
    ],
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    }
}, { timestamps: true });

export const User = mongoose.model('user', userSchema);