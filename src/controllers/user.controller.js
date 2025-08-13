import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {APiResponse} from '../utils/apiResponse.js'
import User from "../models/user.model.js"
import {uploadOnCloudinary } from "../utils/cloundinary.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const  user = User.findById(userId);
        const  accessToken = user.generateAccessToken();
        const  refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})
        return {refreshToken ,accessToken}
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generation access and refresh token");
    }
}


export const registerUer = asyncHandler(async (req , res)=>{
    // first  take out the user model from the impot
    //then take the deta from the user req.body()
    //first check if user is already  exist with this email...
    // if user didn't fill the filed of the registration field then give error..
    //check the images and avater 
    //upload the imahes in cloudinary...
    // create the  neew user  new keyword and model name include and before saving this call bcrupt, pre method ..and then send th res 201..
     const {fullName , username , email, password } = req.body;
     if([fullName , username , email , password].some((field)=>field?.trim()=== " ")){
        throw new ApiError(400,"All field are required")
     };

     const Existinguser = await User.findOne({
        $or:[
            {email} ,{password}
        ]
     });
     if(Existinguser){
        throw new ApiError(409 , `${ Existinguser } Already have this user`)
     };

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0 ){
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    // if(!coverImageLocalPath){
    //     throw new ApiError(400,"coverImage file is required")
    // }
    const  avatar = await uploadOnCloudinary(avatarLocalPath);
    const  coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await new User.create({
        username: username.toLowerCase(),
        fullName,
        password,
        email,
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })
    const createdUser = User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user!");
    } 
    res.status(201).json(
        new APiResponse(200,"User Ragistrated successfully")
    )

} )

export const loginUser =asyncHandler(async (req,res) =>{

    const {username ,fullName , password} = req.body;
     if([username , fullName , password].some((field)=>field?.trime()) === ""){
        throw new ApiError(400,"All field are required");
     };

     const user =await User.findOne({
        $or:[ { email } , { username } ]
     });

     if(user){
        throw new ApiError(404 , "User is already exist!");
     };


    const ispasswordvalid =  await user.comparePassword(password)
    if(!ispasswordvalid){
        throw new ApiError(401 , "Invalid used credential")
    };

   const {accessToken , refreshToken} = await  generateAccessAndRefreshToken(user._id);

   const loggedInUser = await User.findById(user.id).select("-password , -refreshToken");

   const options ={
    httpOnly:true,
    secure:true
   };
   return res.status(200)
   .cookie("accessToken" , accessToken , options)
   .cookie("refreshToken",refreshToken , options)
   .json( new APiResponse(200,{
    logedInUser , refreshToken , accessToken 
   },
   "User LoggedIn successfully"))
   
     
})

export const logoutUser = asyncHandler(async (req,res)=>{
   await User.findByIdAndUpdate(req.user._id,{
    $set:{ 
         refreshToken:undefined
    }},
    {
      new:true
    }
)

   const options ={
    httpOnly:true,
    secure:true
   };

   return res.status(200)
   .clearCookies("accessToken" ,options)
   .clearCookies("refreshTOken", options)
   .json(200,{
      

   }, "user logout successfully")


   
})

export const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refeshToken || req.boby.refeshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }
    try {
        const decordedToken = jwt.verify(
        incomingRefreshToken,
        REFRESH_TOKEN_SECRET
    )
    const user = await User.fingById(decordedToken._id)
     if(!user){
        throw new ApiError(401, "Invalid refresh token");
    }

    if(incomingRefreshToken !== user?.refeshToken){
        throw new ApiError(401, "refresh token in expired or used!");
    }
    const options ={
        httpOnly:true,
        secure:true
    }
    
   const {newRefreshToken , accessToken}=  await generateAccessAndRefreshToken(user._id)
   res.status(200)
   .cookies("accessToken", accessToken , options)
   .cookies("refreshToken" , newRefreshToken ,options)
   .json( 200,{
      accessToken , refeshToken : newRefreshToken
   },"Access token refresh succesfully.")
        
    } catch (error) {
        throw new ApiError(401, error.message)
        
    }
    
})
