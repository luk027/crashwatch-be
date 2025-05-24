import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./database/connection/connectDB.js";
import { userRouter } from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 8000;

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  
app.use("/api/user", userRouter);

//listening to server and connecting the database
try {
  app.listen(PORT, () => {
    console.log(`Server is running at PORT: ${PORT}`);
    connectDB();
  });
} catch (error) {
  console.log(`Server connection error, `, error);
}