import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// verify user is login jwtverify


const publishVideo = asyncHandler( async(req, res) => {
     const{title , description} = req.body
     
     if (
        [title, description].some((field) => 
     field?.trim() === "")
    ) {
 
       throw new ApiError(400, "All fields are required to publish a video")
     }


    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    
    console.log("Video details: ", videoLocalPath);

    if (!(videoLocalPath && thumbnailLocalPath)) {
        throw new ApiError(400, "Both Video and thumbnail is required for publishing a video ")
        
    }


    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    console.log("Uploaded Video:", uploadedVideo)

    if (!(uploadedVideo && thumbnail)) {
        throw new ApiError(400, "Both Video and thumbnail is required for publishing a video...")

    }

    const video = await Video.create({
        title,
        description,
        thumbnail: thumbnail.url,
        videoFile: videoFile.url,
        
    })
    return res.status(201).json(
        new ApiResponse(200, video , "Video is uploaded Successfully")
    )



})



// const getAllVideos = asyncHandler( async(req , res) => {
//     //
// })

// const deleteVideo = asyncHandler( async( req, res) => {
//     const { videoId } = req.params
//     if (!videoId?.trim()) {
//         throw new ApiError(400, "No VideoId is found")
        
//     }


// })
