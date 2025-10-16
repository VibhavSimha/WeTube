import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadToCloud, deleteFromCloudinary } from "../utils/couldinary.js"
import { upload } from "../middlewares/multer.middlewares.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body

    //validation
    if ([fullname, username, email, password].some((field) => field?.trim() === "")) throw new ApiError(400, "All fields are required")
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existingUser) {
        throw new ApiError(409, "User with email or usename already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file missing")
    }
    if (!coverLocalPath) {
        throw new ApiError(400, "CoverImage file missing")
    }
    //Not optimal upload
    // const avatarResponse=await uploadToCloud(avatarLocalPath);
    // const coverResponse="";
    // if(coverLocalPath){
    //     coverResponse=await uploadToCloud(coverLocalPath);
    // }

    let avatar;
    try {
        avatar = await uploadToCloud(avatarLocalPath);
        console.log("Uploaded avatar ", avatar);

    } catch (error) {
        console.log("Error uploading avatar", error);
        throw new ApiError(500, "Failed to upload avatar")
    }
    let coverImage;
    try {
        coverImage = await uploadToCloud(coverLocalPath);
        console.log("Uploaded avatar ", coverImage);

    } catch (error) {
        console.log("Error uploading cover image", error);
        throw new ApiError(500, "Failed to upload cover image")
    }

    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken")//Reliable confirmation back from db
        if (!createdUser) {
            throw new ApiError(500, "Database Error")
        }
        return res.status(201).json(new ApiResponse(200, createdUser, "User Registered Successfully"))
    } catch (error) {
        console.log("User creation failed");
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }
        throw new ApiError(500, "Something went wrong registering a user and images were deleted")
    }
})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User does not exist")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken; //Model schema
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong when generating access and refresh token")
    }
}

const loginUser = asyncHandler(async (req, res) => {
    //get data from body
    const { username, password, email } = req.body
    //validation
    if (!email) throw new ApiError(400, "Email is required")

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(409, "User not found")
    }
    //Validate password

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(404, "Invalid password")

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");//Object retured without password and refreshToken
    if (!loggedInUser) throw new ApiError(404, "Logged in user not found")

    const options = {
        httpsOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToekn", refreshToken, options)
        .json(new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"
        ))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,

            }
        },
        { new: true }
    )

    const options = {
        httpsOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .clearCokkie("accessToken", options)
        .clearCokkie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfullly"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken; //Cookies are sufficient for desktop app, mobile app may be from req.body
    if (!incomingRefreshToken) {
        throw ApiError(401, "Refresh token is required");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token or expired")
        }
        const options = {
            httpsOnly: true,
            secure: process.env.NODE_ENV === "production",
        }
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);//New name for refresh token for clarity
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cokkie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200, { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                ));
    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing access token");
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    //use auth.middleware
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(400, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) throw new ApiError(401, "Invalid Old Password");

    user.password = newPassword; //Model hook automatically bcrypts like a middleware on "save"
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    //Use auth.middleware

    const user = req.user;
    if (!user) throw new ApiError(400, "User not found");

    return res.status(200).json(new ApiResponse(200, { user: user, id: user._id }, "Current User Details fetched"))

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    //use auth.middleware
    const { fullname, username, email } = req.body;
    if (!fullname || !username || !email) {
        throw new ApiError(400, "All details not received")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname: fullname,
                username: username,
                email: email
            }
        },
        { new: true } //Return the updated document
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, user, "Details updated successfully"));
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    //User auth.middleware
    const user = req.user;
    if (!user) {
        throw new ApiError(400, "User not found")
    }
    else {
        const avatarLocalPath = req.files?.avatar?.[0]?.path;
        try {
            const avatar = await uploadToCloud(avatarLocalPath);
            user.avatar = avatar.url;
            console.log("Avatar updated")

        }
        catch (error) {
            throw new ApiError(500, "Avatar Update failed", error)
        }
    }

    return res.status(200).json(new ApiResponse(200, {}, "Avatar Updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    //User auth.middleware
    const user = req.user;
    if (!user) {
        throw new ApiError(400, "User not found")
    }
    else {
        const coverImageLocalPath = req.files?.avatar?.[0]?.path;
        try {
            const coverImage = await uploadToCloud(coverImageLocalPath);
            user.coverImage = coverImage.url;
            console.log("Cover Image updated")

        }
        catch (error) {
            throw new ApiError(500, "Cover Image Update failed", error)
        }
    }

    return res.status(200).json(new ApiResponse(200, {}, "Cover Image Updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "Username is Required")
    }

    const channel = await User.aggregate(
        [
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup:{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField:"subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers" // '$' needed as created in 'as'
                    },
                    channelsSubscribedToCount: {
                        $size : "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id,"$subscribers.subscriber"]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                //Project only required data:
                $project:{
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    coverImage: 1,
                    email: 1
                }
            }
        ]
    )

    if(!channel?.length){
        throw new ApiError(404, "Channel not found")
    }

    return res.status(200).json(new ApiResponse(200,channel[0],"Channel profile fetched"));

})

const getWatchHIstory = asyncHandler(async (req, res) => {
    const user = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id), // Cannot plainly pass req.user to mongoose have to typcast. ObjectId is deprecated
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [ //To add additional criteria and filter
                        //To find owner of the video
                        {
                            $lookup:{
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullname: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ]
    )

    if(!user?.length){
        throw new ApiError(404,"Watch History not found");
    }

    return res.status(200).json(new ApiResponse(200,user[0]?.watchHistory,"Watch history fetched successfully"))
})

export {
    registerUser, loginUser, refreshAccessToken, logoutUser, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHIstory
}