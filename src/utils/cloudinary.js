import {v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_SECRET 

});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        // console.log("file is uploaded on cloudinary ", response.url);
         console.log("file is uploaded on cloudinary and response is: ", response);
        fs.unlinkSync(localFilePath)
        return response;
   
   
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary files as the
        return null;                            // upload operation got failed 
        
    }
}


const deleteFromCloudinary = async (publicIdOfFile) => {
    try {
        await cloudinary.uploader.destroy(publicIdOfFile);
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        throw new ApiError(500, "Existing file could not be deleted from Cloudinary");
    }
}



export { uploadOnCloudinary , deleteFromCloudinary}




