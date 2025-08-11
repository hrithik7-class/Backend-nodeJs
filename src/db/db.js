import mongoose from "mongoose";
import { DB_Name } from "../constants.js";
export const DB = async()=>{
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`)
        console.log(`mongoDB connected ${conn.connection.host}`);
        
    } catch (error) {
        console.log("Error in Database",error)
        process.exit(1); 
    }
}