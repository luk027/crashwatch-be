import jwt from "jsonwebtoken";
import User from "../database/models/user.model.js"

export const authenticateUser = async(req, res) => {
    try {
        let token = req.headers.authorization.split(" ")[1];
        if(!token){
            return res.status(401).json({ message: "Authorization token is required!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) {
            return res.status(401).json({ message: "Invalid token: userId not found!" });
        }

        const user = await User.findById(decoded.userId);
        if(!user) {
            return res.status(401).json({ message: "User not found!" });
        }
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}