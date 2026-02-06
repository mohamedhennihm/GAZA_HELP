import express from "express";
import { config } from "dotenv";
import authRoute from "./routes/authRoute.js";
import { connectDB } from "./config/db.js";

config(); 

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());


connectDB();


app.get("/", (req, res) => {
  res.send("Hani Dawajani's API is running"); 
});


app.use("/api/auth", authRoute);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});