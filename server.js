import express from "express";
import { PORT } from "./src/config/env.js";
import authRoute from "./src/routes/authRoute.js";
import { connectDB } from "./src/config/db.js";


const app = express();


app.use(express.json());


connectDB();


app.get("/", (req, res) => {
  res.send("Hani Dawajani's API is running"); 
});


app.use("/api/auth", authRoute);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});