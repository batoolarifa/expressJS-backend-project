import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total videos ,  total likes etc.
    //  total subscribers, ,



    const totalViewsAndTotalVideos = await Video.aggregate([
        {
            $match: {
                videoOwner: req.user._id
            }
        },
        {
            $group: {
                _id: "$videoOwner",
                totalViews: {
                    $sum: "$views"
                },
                totalVideos: {
                    $sum: 1
                }


            }
        }

    ])

    const totalLikes = await Like.aggregate([
        {
            $match: {
                video :  { $in: Video.find({videoOwner: req.user._id}).select("_id") }
            }
        },
        {
            $count:"totalLikes"
        
        }
        
    ])


    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel : req.user._id
            }
        },
        {
            $count: "totalSubscribers"
            
        }
    ])

    const channelStats = {

        totalViews: totalViewsAndTotalVideos[0]?.totalViews,
        totalVideos: totalViewsAndTotalVideos[0]?.totalVideos,
        totalLikes: totalLikes[0]?.totalLikes,
        totalSubscribers: totalSubscribers[0]?.totalSubscribers
    }

    if(!channelStats) {
        throw new ApiError(400, "There is something wrong while getting channel stats")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, channelStats, "Channel stats fetched successfully", ))
})
    



        
     
   


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const  channelVideos = await Subscription.aggregate([
        {
            $match: {
                 channel: req.user._id
            }
        },
        {
           $lookup: {
            from: "videos",
            localField: "channel",
            foreignField: "videoOwner",
            as: "channelVideos"
           
            
           } 
        }
    ])


    return res.status(200)
    .json(new ApiResponse(200, channelVideos[0]?.channelVideos, "Channel video are fetched successfully"))
})


export {
    getChannelStats, 
    getChannelVideos
    }
