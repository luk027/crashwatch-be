import { User } from "../database/models/user.model.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//Generate JWT Token
const generateAuthToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "3d" });
}

//Generate OTP
const generateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 9000);
}

//Send Email
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

export const signup = async(req, res) => {
    const { username, email, password, role, isVerified } = req.body;
    try {
        const isExistingUser = await User.findOne({ email });
        if(isExistingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
        const newUser = await User.create({
            username,
            email,
            password: hashPassword,
            role,
            otp,
            otpExpiry
        });
        await newUser.save();

        //Send verification email
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "OTP Verification For CrashWatch",
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`
        });

        res.status(201).json({ message: `User ${username} is registered. Please verify OTP sent to ${email}.` });
    } catch (error) {
        console.log("Error While SignUp", error.message);
        res.status(500).json({ message: "Internal Server Error!" });
    }
}

export const verifyOTP = async(req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found!" });
        };
        if(user.isVerified){
            return res.status(400).json({ message: "User already verified!" });
        };
        if(user.otp !==otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP!" });
        };
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ message: "User verified successfully!" });
    } catch (error) {
        console.log("Error While verifying OTP", error.message);
    }
}

export const resendOTP = async(req, res) => {
    try {
        const { email } = req.body;
        const user = user.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found!" });
        };
        if(user.isVerified){
            return res.status(400).json({ message: "User already verified!" });
        };
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Resend OTP Verification For CrashWatch",
            text: `Resend OTP is ${otp}. It is valid for 5 minutes.`
        });

        res.json({ message: `Resend OTP sent to ${email}.` });
    } catch (error) {
        console.log("Error While Resending OTP", error.message);
    }
}

export const login = async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found!" });
        };
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch) {
            return res.status(401).json({ message: "Invalid Password!" });
        };
        if(!user.isVerified) {
            return res.status(401).json({ message: "User not verified!" });
        }
        
        const token = generateAuthToken(user._id);
        let options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        res.cookie("token", token, options).status(200).json({
            success: true,
            message: "Logged in successfully!",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                verified: user.verified,
            },
            token
        });


    } catch (error) {
        console.log("Error While login", error.message);
        res.status(500).json({ message: "Internal Server Error!" });
    }
}

export const logout = async(req, res) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true
        }).status(200).json({ message: "Logged out successfully!" });
    } catch (error) {
        console.log("Error While logout", error.message);
        res.status(500).json({ message: "Internal Server Error!" });
    }
}

export const updatePassword = async(req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;
    try {
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if(!passwordMatch) {
            return res.status(401).json({ message: "Invalid Password!" });
        }
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        await user.save();
        res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
        console.log("Error While updating password", error.message);
        res.status(500).json({ message: "Internal Server Error!" });
    }
}
