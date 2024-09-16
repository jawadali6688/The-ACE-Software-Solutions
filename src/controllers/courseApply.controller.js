import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { CourseApply } from "../models/courseApply.model";
import { ApiResponse } from "../utils/ApiResponse.js"

const applyForCourse = asyncHandler(async (req, resp) => {
    const { courseName, applicantFullName, applicantPhone, lastDegree, currentEducation, reasonToApply, findUsFrom  } = req.body

    try {
        if (!courseName || !applicantFullName || !applicantPhone || !lastDegree || !applicantCnic ) {
            throw new ApiError(401, "Please fill neccessery fields!", null)
        }

        const courseApplicationForm = await CourseApply.create({
            courseName, applicantFullName, applicantPhone, lastDegree, currentEducation, reasonToApply, findUsFrom

        })

        if (!courseApplicationForm) {
            throw new ApiError(501, "There is an internal server error", null)
        }

        return resp.status(201).json(new ApiResponse(201, courseApplicationForm, "Successfully applied in course"))

        


    } catch (error) {
        throw new ApiError(503, "Internal Server Error", error)
    }
})


export {
    applyForCourse
}