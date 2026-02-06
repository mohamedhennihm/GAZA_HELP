import mongoose from "mongoose";

// Function to connect to MongoDB
export const connectDB = async () => {
  try {
    if (!process.env.DB_URI) {
      throw new Error("MongoDB connection string (URI_DB) is not defined in .env");
    }

    await mongoose.connect(process.env.DB_URI);

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit process if DB connection fails
  }
};