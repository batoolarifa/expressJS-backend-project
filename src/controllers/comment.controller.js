import { asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Comment } from "../models/comment.model.js"


const addComment = asyncHandler(async (req, res) => {
    
    const { videoId } = req.params
    const { content } = req.body

    if (!videoId || !content) { 
        throw new ApiError(400, "Both videoId and content are required")
    }
    
    const comment = await Comment.create({
        content,   
        video: videoId,
        owner: req.user._id
    })
    return res
           .status(200)
           .json(new ApiResponse(200, comment, "Comment added successfully"))

})



const updateComment = asyncHandler( async (req , res) => {
    const { commentId } = req.params
    const { content } = req.body

    console.log("Content:", content);
    console.log("comment ID:", commentId);
    
    if (!content) {
        throw new ApiError(400,"Content is required for updation")
    }
    
    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
           content
        }
                 
        },
        { new: true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Your Comment is updated successfully"))
})


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId} = req.params
    console.log("Comment ID:", commentId);
    
    if (!commentId?.trim()) {
        throw new ApiError(400, "No Comment id is found")
    }
    
    
    const  commentToBeDeleted= await Comment.findByIdAndDelete(commentId)
    
    if (!commentToBeDeleted) {
        throw new ApiError(400, "There is something wrong while deleting the comment")

    }
    
    return res.status(200).json(
    new ApiResponse(200, {}, "Comment  is deleted successfully")
     )


})


const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    console.log("Video ID:", videoId);

    if (!videoId?.trim()) {
      throw new ApiError(400, "Video id is required")        
    }

    const filter = {videoId}
    
    if(query) {
        filter.content = {
                     $regex: query,
                    $options: 'i'           
        }
    }

    const comment = await Video.find(filter).skip((page - 1)* limit).limit(parseInt(limit))
    
    return res
    .status(200)
    .json(new ApiResponse(200, comment, "All comments for the video are retrieved successfully"))



})



export{
    addComment,
    updateComment,
    deleteComment,
    getVideoComments
}