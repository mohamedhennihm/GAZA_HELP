import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  money: {
    type: Number, // integer representation
    default: 0,
    min: 0,
  },
  phoneNumber: {
    type: String, // store as string to handle leading zeros, country codes
    required: true,
    trim: true,
  },
  review: {
    type: Number, // average rating
    default: 0,
    min: 0,
    max: 5,
  },
  professions: {
    type: [String], // array of strings to allow multiple professions
    enum: [
      "Doctor",
      "Teacher",
      "builder",
      "painter",
      "Mechanic",
      "Nurse",
    ],
    default: [],
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);