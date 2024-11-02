import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"



const createTweet = asyncHandler(async (req, res) => {
 

    const {content } =  req.body

    if (!content) {
        throw new ApiError(400, "Content is required")
        
    }

    const tweet = Tweet.create({
        content,
        owner: req.user._id
    })
        
    return res.status(200)
             .json(new ApiResponse(200, tweet, "Tweet created successfully"))


})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body
    
    console.log("Content:", content);
    console.log("Tweet ID:", tweetId);
    
    if (!content) {
        throw new ApiError(400,"Content is required for the tweet updation")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
           content
        }
                 
        },
        { new: true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Your Tweet is updated successfully"))
    
})


const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params
    console.log("Tweet ID:", tweetId);

     
    if (!tweetId?.trim()) {
        throw new ApiError(400, "No Tweet id is found")
    }

    const  tweetToBeDeleted = await Tweet.findByIdAndDelete(tweetId)
    
    if (!tweetToBeDeleted) {
        throw new ApiError(400, "There is something wrong while deleting the tweet")

    }
    
    return res.status(200).json(
    new ApiResponse(200, {}, "Tweet is deleted successfully")
     )

})


const getUserTweets = asyncHandler(async (req, res) => {

    const userTweets = await User.aggregate([
        {
            $match: {
                 _id: req.user._id


            }
        },

        {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "allUserTweets"
            }
        }
    ])

    if (!userTweets?.length) {
        throw new ApiError(404, "Tweets does not exists")
        
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200, userTweets[0], "All User  Tweets are fetched successfully")
    )

})




    
    
    

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets

}
    
   