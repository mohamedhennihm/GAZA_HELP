import mongoose from "mongoose";

// Function to connect to MongoDB
export const connectDB = async () => {
  try {
    if (!process.env.URI_DB) {
      throw new Error("MongoDB connection string (URI_DB) is not defined in .env");
    }

    await mongoose.connect(process.env.URI_DB);

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit process if DB connection fails
  }
};