import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new mongoose.Schema({
    
    fullName:{
        type:String,
        required:true,
        index:true,
        trim:true
    },
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        min:[6,"Password length minimum 6"]
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref :"Video"
        }
    ],
    avatar:{
        type:String,
        required:true,
        enum:["avt1" ,"avt2", "avt3"] 
    },
    coverImage:{
        type:String,
        ///cloundinary work..loading
    },
    refreshToken:{
        type:String,
    }
    
},{timestamps:true})

// use the pre hook, before saving data we hash the password.
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
         this.password = await bcrypt.hash(this.password , salt);
         next();  
    } catch (error) {
        next(error)
    }
})
 // when user try to login so he pass the email and password , but we already hash the 
 // password and user passwrod is plan password for this we compare the both first
 // decrypt and compair and give the access , one thing more for all these thing we
 // need custom method using method ---

 userSchema.methods.comparePassword = async function (password){
   return await bcrypt.compare(password, this.password)
 }


 userSchema.methods.generateAccessToken = async function () {
   return await jwt.sign(
    {_id:this._id , email:email , fullName:fullName},
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:"1d" })
 }

  userSchema.methods.generateRefreshToken = async function () {
   return await jwt.sign(
    {_id:this._id },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:"8d"})
 }

export const User = mongoose.model("User",userSchema)