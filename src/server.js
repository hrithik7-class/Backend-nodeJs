import express from "express";
import dotenv from "dotenv";
import { DB } from "./db/db.js";

dotenv.config({ path: ['.env.local', '.env'] });
const app = express();

const PORT = process.env.PORT;
app.use(express.json());

DB()
.then(()=>{
    app.listen(PORT, () => {
    console.log(`Port is running on ${PORT}`)
})})
.catch((error)=>{
    console.log(error);
})


























// app.use('/', (req, res) => {
//     res.send("hie you wassup?")
// })


/*
   require("dotenv").config({path:"./env"})
  (async () => {
    try {
        const conn = await mongoose.connect(`mongodb://${process.env.MONGO_URI}${DB_Name}`)
        app.on("error", (error) => {
            console.error("Error", error)
            throw error
        })

        app.listen(PORT, () => {
            console.log(`Port is running on ${PORT}`)
        })
    } catch (error) {
        console.log(error.message || "Error in db connection")
    }
})()
way to make db connection in a single file. now anther way.*/
