
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId} = req.params
    console.log("ChannelID:", channelId);

    if (!channelId?.trim()) {
        throw new ApiError(400, "No ChannelId is found")
        
    }

    const channelSubscribers = await Subscription.find({
        channel: channelId
    })

    const subscribersCount = channelSubscribers.length

    return res
           .status(200)
           .json(new ApiResponse(200, {subscribersCount}, "Channel subscribers fetched successfully"))
})


const getSubscribedChannels  = asyncHandler(async (req, res) => {
    const { subscriberId} = req.params
    console.log("SubscriberID:", subscriberId);

    if (!subscriberId?.trim()) {
        throw new ApiError(400, "No subscriberId is found")
        
    }

    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId
    })

    const subscribedChannelsCount = subscribedChannels.length

    return res
           .status(200)
           .json(new ApiResponse(200, {subscribedChannelsCount}, "Subscribed channels fetched successfully"))
})




const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    console.log("ChannelID:", channelId);

  
})
export {
    getUserChannelSubscribers,
    toggleSubscription,
    getSubscribedChannels
}