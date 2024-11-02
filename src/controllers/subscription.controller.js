
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"



const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId} = req.params
    console.log("ChannelID:", subscriberId);

    if (!subscriberId?.trim()) {
        throw new ApiError(400, "No Channel id is found")
        
    }

    const channelSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: subscriberId
            }
        },
        {
            $count: "subscribersCount"
        }
    
    
    ])

    if (!channelSubscribers) {
        throw new ApiError(404, "No channel subscribers found")
        
    }
    return res
           .status(200)
           .json(new ApiResponse(200,  channelSubscribers[0].subscribersCount, "Channel subscribers fetched successfully"))
})



const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    console.log("Subscriber id", channelId);

    if (!channelId?.trim()) {
        throw new ApiError(400, "No Channel id is found")
        
    }

    const subscribedChannels  = await Subscription.aggregate([
        {
            $match: {
                subscriber: channelId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannelDetails"
            }
        },
        {
            $unwind: "$subscribedChannelsDetails"
        },
        {
            $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    subscribedChannelsCount: 1,
                    avatar: 1,
                    coverImage: 1,
    
    
                          
                
            }
           
        }
    
    ])

    console.log("Subscribed channels", subscribedChannels);

    if (!subscribedChannels) {
        throw new ApiError(404, "No  subscribed channels found")
        
    }
    return res
           .status(200)
           .json(new ApiResponse(200, subscribedChannels[0]?.subscribedChannelDetails, "Subscribed channels fetched successfully"))
})







const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    console.log("ChannelID:", channelId);

    const userId = req.user._id

    console.log("UserID:", userId);

    if (!channelId?.trim()) {
       throw new ApiError(400, "No Channel exists")        
    }

    const subscription = await Subscription.findOne({channelId, userID})

    if(subscription){
        await subscription.remove()
        return res
               .status(200)
               .json(new ApiResponse(200, "Unsubscribed successfully"))

    }
    else {
        const newSubscription = await new Subscription.create(
            {
                channelId,
                userId
            }
        )

        return res
               .status(200).json(new ApiResponse(200, newSubscription, "Subscribed successfully"))
    }




})


export {
    getUserChannelSubscribers,
    toggleSubscription,
    getSubscribedChannels,
}