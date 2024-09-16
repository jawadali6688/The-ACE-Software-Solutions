import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


// Generating access and refresh token
const generateAccessAndRefreshTokens = async (userId) => {
    try {
      const user = await User.findById(userId);
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();
      console.log("The Refresh Token", refreshToken);
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(500, "There is Problem while generation Tokens");
    }
  };


// register user
const registerUser = asyncHandler(async (req, resp) => {
    const {
      username,
      email,
      password,
      
    } = req.body;
  
   try {
    if ([email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
      }
  
    
      const existedUser = await User.findOne({ $or: [{ email }] });
      if (existedUser) {
        throw new ApiError(409, "User with this Username or Email already exists");
      }
    
      let avatarUrl = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"; // Default value for avatar URL
    
      if (req.files && req.files.avatar && req.files.avatar[0]) {
        // If avatarLocalPath is defined, upload to Cloudinary
        const avatarLocalPath = req.files.avatar[0].path;
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        avatarUrl = avatar.url;
      }
    
      const user = await User.create({
        fullName,
        email,
        avatar: avatarUrl, // Use the uploaded avatar URL or the default value
        username,
        password,
        
      });
    
      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      );
      if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the User");
      }
    
      return resp
        .status(200)
        .json(new ApiResponse(200, createdUser, "User registered successfully"));

   } catch (error) {
        throw new ApiError(503, "Internal Server Error", error)
   }

});

// login user
const loginUser = asyncHandler(async (req, resp) => {
    const { email, password } = req.body;
    console.log(email, password)
    try {
      if (!email) {
        throw new ApiError(401, "Email is required", [
          "Email field cannot be empty",
        ]);
      }
      if (!password) {
        throw new ApiError(401, "Password is required", [
          ["Password field cannot be empty"],
        ]);
      }
      const user = await User.findOne({
        $or: [{ email }],
      });
      if (!user) {
        throw new ApiError(404, "User does not exist", ["User does not exist"]);
      }
      const isPasswordValid = await user.isPasswordCorrect(password);
    
      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Credentials");
      }
      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
      );
      const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
      );
      const options = {
        httpOnly: false,
        secure: false,
      };
      console.log(loggedInUser)
      return resp
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            {
              user: loggedInUser,
              accessToken,
              refreshToken,
            },
            "User Logged In Successfully"
          )
        );
    } catch (error) {
      console.log(error)
      throw new ApiResponse(error)
    }
  });


// logout user
const logoOutUser = asyncHandler(async (req, resp) => {
    try {
        User.findByIdAndUpdate(
            req.user._id,
            {
              $set: {
                refreshToken: undefined,
              },
            },
            {
              new: true,
            }
          );
          const options = {
            httpOnly: false,
            secure: false,
          };
          return resp
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User Logout Successfully"));
    } catch (error) {
        throw new ApiError(503, "Internal Server Error", error)
    }
  });

// forgot password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    console.log(email, "This is email");
    try {
      if (!email) {
        throw new ApiError(401, "Email cannot be empty");
      }
      const userExist = await User.findOne({ email });
      if (!userExist) {
        throw new ApiError(404, "User does not exist!");
      }
  
      const token = jwt.sign(
        { email: email, _id: userExist._id },
        process.env.FORGOT_TOKEN_SECRET,
        { expiresIn: "5m" }
      );
      const link = `http://localhost:5173/reset_password/${userExist._id}/${token}`;
      console.log(`Password reset link: ${link}`);
    } catch (error) {
      console.log(error);
    }
    
  });

// reset password
const resetPassword = asyncHandler(async (req, resp) => {
    try {
      const { id, token } = req.params;
      const { password } = req.body;
      const userExist = await User.findOne({ _id: id });
      console.log(userExist);
      if (!userExist) {
        throw new ApiError("User not found!");
      }
      const verify = jwt.verify(token, process.env.FORGOT_TOKEN_SECRET);
      const user = verify.email;
      if (!user) {
        throw new ApiError("Something went wrong or Token Expired");
      }
      if (!password) {
        throw new ApiError("Password cannot be empty");
      }
      const salt = await bcrypt.genSalt(10);
  
      // Hash the password along with the new salt
      const hashedPassword = await bcrypt.hash(password, salt);
      const resetedPassword = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            password: hashedPassword,
          },
        }
      );
      const updatedUser = await User.findOne({ email: user }).select(
        "-password -refreshToken"
      );
      return resp
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Password Changed Successfully"));
    } catch (error) {
      throw new ApiError(400, "Error while changing the password");
    }
  });

// Refreshing access token
const refreshAccessToken = asyncHandler(async (req, resp) => {

   const incomingRefreshToken =
     req.cookies.refreshToken || req.body.refreshToken;
   if (!incomingRefreshToken) {
     throw new ApiError(401, "Unauthorized request!!");
   }
 
   try {
     const decodedToken = jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
     );
 
     if (!decodedToken) {
       throw new ApiError(401, "Not a Valid Incoming Refresh token");
     }
 
     const user = await User.findById(decodedToken?._id);
 
     if (!user) {
       throw new ApiError(401, "Invalid Refresh Token");
     }
 
     if (incomingRefreshToken !== user?.refreshToken) {
       throw new ApiError(401, "Refresh Token is expired or used");
     }
 
     const options = {
       httpOnly: false,
       secure: false,
     };
 
     const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
       user._id
     );
     return resp
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json(
         new ApiResponse(
           200,
           { accessToken, refreshToken },
           "Access Token Refreshed Successfully"
         )
       );
   } catch (error) {
     console.log(error)
     throw new ApiError(401, error?.message || "Invalid refresh Token");
   }
 });



export {
    registerUser,
    loginUser,
    resetPassword,
    forgotPassword,
    refreshAccessToken,
    logoOutUser
}