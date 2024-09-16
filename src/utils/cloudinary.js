import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';


cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
    const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto"
    })
    console.log("File is uploaded on cloudinary and the file path is: ", response.url)
    fs.unlinkSync(localFilePath);
    return response

    } catch (error) {
        fs.unlinkSync(localFilePath); 
        return null 
    }
}
export {uploadOnCloudinary}

