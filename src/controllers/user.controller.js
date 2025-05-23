import { User } from "../database/models/user.model.js";
import { Asset } from "../database/models/asset.model.js";
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
//Generate Random Password
const generateRandomPassword = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*!";
    let password = "";
    for(let i=0; i<8; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
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

        const token = generateAuthToken(user._id);
        let options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        res.cookie("token", token, options).status(200).json({
            success: true,
            message: "User verified successfully!",
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

export const forgotPassword = async(req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found!" });
        };
        if(!user.isVerified) {
            return res.status(401).json({ message: "User not verified!" });
        };
        let newPassword = generateRandomPassword();
        user.password = newPassword;
        await user.save();

        //Send updated password email
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Forgot Password For CrashWatch",
            text: `Your new password is ${newPassword}. Please change it after logging in.`
        });
    } catch (error) {
        console.log("Error While forgot password", error.message);
        res.status(500).json({ message: "Internal Server Error!" });
        
    }
}

export const updateUserData = async(req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    const userId = req.user._id;
    try {
        if(!username && !oldPassword && !newPassword) {
            return res.status(400).json({ message: "Please provide data to update!" });
        }
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        if(!user.isVerified) {
            return res.status(401).json({ message: "User not verified!" });
        }
        if(username) {
            user.username = username;
        }
        if(oldPassword && newPassword) {
            const passwordMatch = await bcrypt.compare(oldPassword, user.password);
            if(!passwordMatch) {
                return res.status(401).json({ message: "Invalid Password!" });
            }
            const hashPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashPassword;
        }
        await user.save();
        res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
        console.log("Error While updating password", error.message);
        res.status(500).json({ message: "Internal Server Error!" });
    }
}

export const addResultToWatchlist = async(req, res) => {
    const { name, shortName, link, pairType, isCrypto, country } = req.body;
    const userId = req.user._id;
    try {
      if (!name || !shortName || !link || !pairType || !isCrypto || !country) {
        return res.status(400).json({ message: "All fields are required!" });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }
      if (!user.isVerified) {
        return res.status(401).json({ message: "User not verified!" });
      }
  
      // Check if the asset already exists
      const existingAsset = await Asset.findOne({ name, shortName, link });
      if (existingAsset) {
        return res.status(409).json({ message: "Asset already exists in watchlist!" });
      }
  
      // Create a new asset
      const newAsset = new Asset({
        name,
        shortName,
        link,
        pairType,
        isCrypto,
        country,
      });

      const data = await newAsset.save();
      user.watchlist.push(data._id);
      await user.save();
      
      res.status(201).json({
        success: true,
        message: "Asset added to watchlist successfully!",
        data: newAsset,
      });
    } catch (error) {
        console.log("Error While adding to watchlist", error.message);
        res.status(500).json({ message: "Internal Server Error!" });
    }
  }