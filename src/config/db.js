import mongoose from "mongoose";
import { DB_URI } from "./env.js";

// Function to connect to MongoDB
export const connectDB = async () => {
  try {
    if (!DB_URI) {
      throw new Error("MongoDB connection string (URI_DB) is not defined in .env");
    }

    await mongoose.connect(DB_URI);

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit process if DB connection fails
  }
};