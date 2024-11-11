import { Like } from "../models/like.model";
import { Video } from "../models/video.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import {Comment} from "../models/comment.model"
import { Tweet } from "../models/tweet.model";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    console.log("Video ID:", videoId);
     
    const userId = req.user._id

    if (!videoId?.trim()) {
        throw new ApiError(400, "No Video id exists")        
     }

     
    const video = await Video.findOne({videoId, userId})
    
    if(video){
        await video.remove()
        return res
               .status(200)
               .json(new ApiResponse(200, "Unliked Video successfully"))


    }
    else {
        const newLikeForVideo = await new Like.create(
            {
                video: videoId,
                likedBy: userId
            }
        )
        
        return res
        .status(200).json(new ApiResponse(200, newLikeForVideo, " Liked Video successfully"))
}

})




const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    console.log("Comment ID:", commentId);
     
    const userId = req.user._id
    
    if (!commentId?.trim()) {
        throw new ApiError(400, "No comment id exists") 
     }

     
    const comment = await Comment.findOne({commentId, userId})
    
    if(comment){
        await comment.remove()
        return res
               .status(200)
               .json(new ApiResponse(200, "Unliked Comment successfully"))


    }
    else {
        const newLikeForComment = await new Like.create(
            {
                comment: commentId,
                likedBy: userId
            }
        )
        
        return res
        .status(200).json(new ApiResponse(200, newLikeForComment, " Liked Comment successfully"))
}

})








const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    console.log("Tweet ID:", tweetId);
     
    const userId = req.user._id
    
    if (!tweetId?.trim()) {
        throw new ApiError(400, "No tweet id found") 
     }

     
    const tweet = await Tweet.findOne({tweetId, userId})
    
    if(tweet){
        await tweet.remove()
        return res
               .status(200)
               .json(new ApiResponse(200, "Unliked Tweet successfully"))


    }
    else {
        const newLikeForTweet = await new Like.create(
            {
                tweet: tweetId,
                likedBy: userId
            }
        )
        
        return res
        .status(200).json(new ApiResponse(200, newLikeForTweet , " Liked Tweet successfully"))
}

})




const getLikedVideos = asyncHandler(async (req, res) => {

    const userLikedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "LikedVideos"
            }
        }
    ])

    if (!userLikedVideos?.length) {
        throw new ApiError(404, "No Liked Videos found")
        
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200, userLikedVideos[0], " Liked Videos fetched successfully")
    )


})










export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike

}












     
    

