import express from "express"
import { config } from "dotenv";
config();

const app = express();

const PORT = process.env.PORT || 5000 ;
express.json();

app.get("/",()=>{
    console.log("hani dawajani's api");
});


app.listen(PORT,()=>{
    console.log(PORT);
});