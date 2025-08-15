import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { APiResponse } from '../utils/apiResponse.js'
import User from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloundinary.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { refreshToken, accessToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generation access and refresh token");
    }
}

export const registerUer = asyncHandler(async (req, res) => {
    // first  take out the user model from the impot
    //then take the deta from the user req.body()
    //first check if user is already  exist with this email...
    // if user didn't fill the filed of the registration field then give error..
    //check the images and avater 
    //upload the imahes in cloudinary...
    // create the  neew user  new keyword and model name include and before saving this call bcrupt, pre method ..and then send th res 201..
    const { fullName, username, email, password } = req.body;
    if ([fullName, username, email, password].some((field) => field?.trim() === " ")) {
        throw new ApiError(400, "All field are required")
    };

    const Existinguser = await User.findOne({
        $or: [
            { email }, { password }
        ]
    });
    if (Existinguser) {
        throw new ApiError(409, `${Existinguser} Already have this user`)
    };

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    // if(!coverImageLocalPath){
    //     throw new ApiError(400,"coverImage file is required")
    // }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await new User.create({
        username: username.toLowerCase(),
        fullName,
        password,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    const createdUser = User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user!");
    }
    res.status(201).json(
        new APiResponse(200, "User Ragistrated successfully")
    )

})

export const loginUser = asyncHandler(async (req, res) => {

    const { username, fullName, password } = req.body;
    if ([username, fullName, password].some((field) => field?.trime()) === "") {
        throw new ApiError(400, "All field are required");
    };

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (user) {
        throw new ApiError(404, "User is already exist!");
    };


    const ispasswordvalid = await user.comparePassword(password)
    if (!ispasswordvalid) {
        throw new ApiError(401, "Invalid used credential")
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user.id).select("-password , -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new APiResponse(200, {
            logedInUser, refreshToken, accessToken
        },
            "User LoggedIn successfully"))


})

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
        .clearCookies("accessToken", options)
        .clearCookies("refreshTOken", options)
        .json(200, {


        }, "user logout successfully")



})

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refeshToken || req.boby.refeshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }
    try {
        const decordedToken = jwt.verify(
            incomingRefreshToken,
            REFRESH_TOKEN_SECRET
        )
        const user = await User.fingById(decordedToken._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refeshToken) {
            throw new ApiError(401, "refresh token in expired or used!");
        }
        const options = {
            httpOnly: true,
            secure: true
        }

        const { newRefreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)
        res.status(200)
            .cookies("accessToken", accessToken, options)
            .cookies("refreshToken", newRefreshToken, options)
            .json(200, {
                accessToken, refeshToken: newRefreshToken
            }, "Access token refresh succesfully.")

    } catch (error) {
        throw new ApiError(401, error.message)

    }

})

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findBYId(req.user._id);
    const ispasswordtrue = await user.comparePassword(oldPassword);
    if (!ispasswordtrue) {
        throw new ApiError(400, "Incorrect  password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    res.status(200).json(200, {}, "Password change successfully")

})

export const currentuser = asyncHandler(async (req, res) => {

    return res.status(200).json(200, req.user, "current user fetched")

})

export const changeDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.boy;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName,
                email
            },

        },
        { new: true }
    ).select("-password")
    res.status(200, new APiResponse(200, user, "User detail upadted successfully"))
});

export const avatarfileUpdate = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(401, "Avatar File is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.path) {
        throw new ApiError(401, "Error while Avatar file uploading in cloudinary")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }

        },
        {
            new: true
        }).select("-password")
    return res.status(200).json(200, user, "Avatar Image updated successfully")

})

export const coverImagefileUpdate = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(401, "Avatar File is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.path) {
        throw new ApiError(401, "Error while coverImage file uploading in cloudinary")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }

        },
        {
            new: true
        }).select("-password")
    return res.status(200).json(200, user, "coverImage updated successfully")

})
export const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(404, "User is missing")
    }
    const channel = await User.aggreggate([
        {
            $match: {
                username: username?.toLowerCase()
            }

        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreign: "channel",
                as: "subscribers"
            },

        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreign: "subcriber",
                as: "subscribeTo"
            }
        },
        {
            $addfields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribeToCount: {
                    $size: "$subscribeTo"
                },
                isCheckSubscribeOrNot: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                email: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribeToCount: 1,
                isCheckSubscribeOrNot: 1,
                avatar: 1,
                coverImage: 1

            }
        }
    ])
    console.log(channel)
    if (!channel.length) {
        throw new ApiError(404, "chennel not found ")
    }
    return res.status(200)
        .json(new APiResponse(200, channel[0], "user channel fetch successfully"))
})
export const getUserWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggreggate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)

            },
        },
        {
            $lookup: {
                from: "Video",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "User",
                            localField: "onwer",
                            foreignField: "_id",
                            as: "onwer",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullName:1,
                                        avatar:1
                                    }
                                }
                            ]

                        },

                    },
                    {
                        $addfields:{
                            onwer:{
                              $first:"$owner"
                            }
                        }
                    }
                ]
            }
        },
        
    ])

    res.status(200)
    .json(new APiResponse(200, user[0].watchHistory , "watchHistory data fetch successfully"))
})