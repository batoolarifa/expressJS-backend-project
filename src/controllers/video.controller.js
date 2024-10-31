import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";

// verify user is login jwtverify


const publishAVideo = asyncHandler( async(req, res) => {
     const{title , description} = req.body
     
     if (
        [title, description].some((field) => 
     field?.trim() === "")
    ) {
 
       throw new ApiError(400, "All fields are required to publish a video")
     }


    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    
    //console.log("Video details: ", videoLocalPath);

    if (!(videoLocalPath && thumbnailLocalPath)) {
        throw new ApiError(400, "Both Video and thumbnail is required for publishing a video ")
        
    }


    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    //console.log("Uploaded Video:", uploadedVideo);
    //console.log("The duration of videos", uploadedVideo.duration);

    if(!(uploadedVideo && thumbnail)) {
        throw new ApiError(400, "Both Video and thumbnail is required for publishing a video...")

    }

    const video = await Video.create({
        title,
        description,
        thumbnail: thumbnail.url,
        videoFile: uploadedVideo.url,
        duration: uploadedVideo.duration,
        videoOwner: req.user._id
        
    })
    return res.status(201).json(
        new ApiResponse(200, video , "Video is uploaded Successfully")
    )



})


const deleteVideo = asyncHandler( async( req, res) => {
    const { videoId } = req.params

    console.log("VideoID:", videoId);
    if (!videoId?.trim()) {
        throw new ApiError(400, "No VideoId is found")
        
    }

    const  videoToBeDeleted= await Video.findByIdAndDelete(videoId)
    
     //console.log("Video to be deleted", videoToBeDeleted);
     if (!videoToBeDeleted) {
        throw new ApiError(400, "There is something wrong while deleting the video")

     }
      

     if (videoToBeDeleted?.videoFile || videoToBeDeleted?.thumbnail) {
        
        const publicIdOfVideo = videoToBeDeleted?.videoFile.split('/').slice(-1)[0].split('.')[0];
        const publicIdOfThumbnail = videoToBeDeleted?.thumbnail.split('/').slice(-1)[0].split('.')[0];

        console.log("PublicID of video", publicIdOfVideo);
        console.log("PublicID of video", publicIdOfThumbnail);

        try {
            
            await deleteFromCloudinary(publicIdOfVideo, 'video');
            await deleteFromCloudinary(publicIdOfThumbnail);
        } catch (error) {
            throw new ApiError(500, "Could not delete the existing video and thumbnail from Cloudinary");
        }
    }



    return res.status(200).json(
    new ApiResponse(200, {}, "Video  is deleted successfully")
     )

})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    return res
           .status(200)
           .json( new ApiResponse(200 , video, "Video fetched successfully"))
})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    console.log("VideoID:", videoId);
    const {title , description} =  req.body
    const thumbnailLocalPath = req.file?.path
    
    if (!title || !description) {
        throw new ApiError(400,"Both title and description are required")
    }
    
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is missing")
    }

    const video = await Video.findById(videoId);
    console.log("Video", video);

    if (!video) {
        throw new ApiError(404, "Video not found ");
    }

    let thumbnail;
  
   if (thumbnailLocalPath){   
        if (video?.thumbnail) {
             const publicId = video.thumbnail.split('/').slice(-1)[0].split('.')[0]; // Extract publicId from URL
             try {
                await deleteFromCloudinary(publicId); 
            } catch (error) {
                throw new ApiError(500, "Could not delete the existing thumbnail from Cloudinary");
        }
    
    }
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath)


    if (!thumbnail.url) {
        throw new ApiError(400, "Error while uploading thumbnail")
        
       }
    }

    console.log("Uploaded thumbnail:", thumbnail);
    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                 thumbnail: thumbnail.url
            }
                 
        },
        { new: true}
    )
    
    return res
    .status(200)
    .json( new ApiResponse(200 ,  updatedVideo , "Thumbnail is  updated  successfully"))

})



const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId) {
        throw new ApiResponse(400, "VideoId is required")
        
    }

    const video = await Video.findById(videoId)
     
    if (!video) {
        throw new ApiError(404, "Video not found for toggling publish status")
        
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
           .status(200)
           .json(new ApiResponse(200, video, "Publish status is toggled successfully"))
})



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
    //console.log("Query", query);
    //console.log("SortBy", sortBy);
    //console.log("SortType", sortType);

    const filter = {}

    if(query) {
        filter.title = {
                     $regex: query, $options: 'i'           
        }
    }

    

    if (userId) {
        
        filter.videoOwner = userId
        
    }

    const video = await Video.find(filter).sort({
        [sortBy || "createdAt"]: sortType || "desc"})
        .skip((page - 1)* limit)
        .limit(parseInt(limit))

    return res
           .status(200)
           .json(new ApiResponse(200, video, "The videos are fetched successfully"))


    //TODO: get all videos based on query, sort, pagination
})








export{
    publishAVideo,
    deleteVideo,
    getVideoById,
    updateVideo,
    togglePublishStatus,
    getAllVideos
    
}