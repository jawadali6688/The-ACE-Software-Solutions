import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler( async (req, resp, next)=> {
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
     if (!token || typeof token !== "string") {
        throw new ApiError(401, "Invalid Access Token, User not logged in, Please login first!!");
      }
    
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET )
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
     if (!user) {
         throw new ApiError(401, "User is not logged in, Please Login first!!")
     }
     req.user = user;
     next()
   } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
   }  
})
