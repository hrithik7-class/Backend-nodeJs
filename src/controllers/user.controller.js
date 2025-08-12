import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {APiResponse} from '../utils/apiResponse.js'
import User from "../models/user.model.js"
import {uploadOnCloudinary } from "../utils/cloundinary.js"
const registerUer = asyncHandler(async (req , res)=>{
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

     const Existinguser = User.findOne({
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

    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage file is required")
    }
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
export default registerUer