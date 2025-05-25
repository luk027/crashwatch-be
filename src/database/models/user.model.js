import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required!"],
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [30, 'Name can not be more than 30 characters long'],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: [true, "Email must be unique!"],
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address'],
        trim: true
    },
    password: {
        type: String,   
        required: [true, "Password is required!"],
        minlength: [5, 'Password must be at least 5 characters long']
    },
    watchlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "asset"
        }
    ],
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: { 
        type: String 
    },
    otpExpiry: { 
        type: Date 
    }
}, { timestamps: true });

export const User = mongoose.model('user', userSchema);