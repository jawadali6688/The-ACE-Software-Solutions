import mongoose from "mongoose";

const courseApplySchema = new mongoose.Schema(
  {
    courseName: {
        type: String,
        enum: ["Web Development", "Office Management", "Graphic Designing"]
    },
    applicantFullName: {
        type: String,
        required: true
    },
    applicantPhone: {
        type: Number,
        required: true
    },
    applicantCnic: {
        type: Number,
        required: true
    },
    lastDegree: {
        type: String,
        required: true
    },
    currentEducation: {
        type: String,
        required: true
    },
    reasonToApply: {
        type: String,
        required: false
    },
    findUsFrom: {
        type: String,
        required: false
    },
  },
  {
    timestamps: true,
  }
);

export const CourseApply = mongoose.model("CourseApply", chatSchema)
