
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const verifyJWT =asyncHandler(async (req,_,next)=>{
    const token = req.cookies.accessToken || req.body.accessToken || req.header("Autorization")?.replace("Bearer ",""); // Sometimes the request is automatically added with a header with Authorization with Bearer <Token>
    //req.headers is case sensitive for input param whereas req.header is not case sensitive
    if(!token){
        throw new ApiError(401,"Unathorized")
    }
    try{
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401,"Unauthorized")
        }

        req.user=user;
        next(); //Transfer control from middleware to controller
    }
    catch(error){
        throw new ApiError(401,error?.nessage || "Invalid access token")
    }
})