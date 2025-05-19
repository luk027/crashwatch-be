import User from "../database/models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateAuthToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "3d" });
}

export const signup = async(req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const isExistingUser = await User.findOne({ email });
        if(isExistingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashPassword,
            role
        });
        await newUser.save();
        res.status(201).json({ message: "User created successfully!" });
    } catch (error) {
        console.log("Error While SignUp", error.message);
        res.status(500).json({ message: "Internal Server Error!" });
    }
}

export const login = async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch) {
            return res.status(401).json({ message: "Invalid Password!" });
        }
        
        const token = generateAuthToken(user._id);
        let options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        res.cookie("token", token, options).status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
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

export const forgotPassword = async(req, res) => {
    //pending
}