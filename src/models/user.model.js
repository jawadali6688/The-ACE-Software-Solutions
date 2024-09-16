import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: false,
        default: "url of any default photo"
    },
    fullName: {
        type: String,
        required: false
    },
    cnicNumber: {
        type: Number,
        required: false
    },
    phoneNumber: {
        type: Number,
        required: false
    },
    fullAddress: {
        type: String,
        required: false
    },
    accountType: {
        type: String,
        enum: ["Student", "Staff", "Admin"],
        default: "Student"
    }
},
  { timestamps: true }
);

// Pre-save hook to hash passwords using bcrypt before saving
userSchema.pre("save", async function (next) {
  try {
    // Only hash the password if it's modified or new
    if (!this.isModified("password")) {
      return next();
    }

    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password along with the new salt
    const hashedPassword = await bcrypt.hash(this.password, salt);

    // Replace the plain text password with the hashed password
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.error(`Error while hashing password: ${error}`);
    next(error);
  }
});

// Schema methods for password verification and token generation

userSchema.methods.isPasswordCorrect = async function (password) {
  console.log("User password", password)
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
