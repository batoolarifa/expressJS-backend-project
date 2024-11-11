import { Playlist } from "../models/playlist.model";
import mongoose, {isValidObjectId} from "mongoose"
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    console.log("Name:", name);

    console.log("Description:", description);

    if (!name || !description){
      throw new ApiError(400, "Name and description are required")        
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos:  []

    })
 
    return res
               .status(200).json(new ApiResponse(200, playlist, "Playlist created successfully"))
})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectIdvideoId) {
        throw new ApiError(400, "Invalid playlistId or videoId")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        {
            new: true
        }
    
    )
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
        
    }

    return res
               .status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"))



})


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const playlist = await Playlist.findById(playlistId)

    
    if (!playlist) {
        throw new ApiError(400, "Playlist not found")
    }
   
    return res
    .status(200)
    .json( new ApiResponse(200 , playlist, "Playlist fetched successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    console.log("Playlist ID:", playlistId);
    
    
    if (!playlistId?.trim()) {
    throw new ApiError(400, "No Playlist id is found")
    }

    const  playlistToBeDeleted= await Playlist.findByIdAndDelete(playlistId)
    
    console.log("Playlist to be deleted", playlistToBeDeleted);
    
    if (!playlistToBeDeleted) {
       throw new ApiError(400, "There is something wrong while deleting the playlist")

    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist  is deleted successfully")
         )
    
     


    

})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectIdvideoId) {
        throw new ApiError(400, "Invalid playlistId or videoId ")
    }

    const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
        $pull: {
            videos: videoId
        }
    },
    {  
          new: true
        }
    )

    if (!playlist) {
        throw new ApiError(404, "Playlist not found to remove video")
        
    }

    return res
               .status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully "))



    

})


const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId ")
    }
    
    if (!name || !description) {
        throw new ApiError(400, "Both name and description are required")
    }

    const updatedplaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description,
        }
                 
        },
        { new: true}
    )

    if(!updatedplaylist) {
        throw new ApiError(404, "Playlist not found to update")
    }

    return res
    .status(200)
    .json( new ApiResponse(200 ,  updatePlaylist, "Playlist is  updated  successfully"))

})


const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    const userPlaylist = await Playlist.aggregate([
        {
            $match:{
                owner: userId
            }
        },
        {
            $lookup:{
                from:"videos",
                localField: "videos",
                foreignField: "_id",
                as: "userPlaylistVideos"
            }
        }
    ])
    
    if (!userPlaylist?.length) {
        throw new ApiError(404, "Playlist does not exists")
        
    }
    
    return res
          .status(200)
          .json(new ApiResponse(200, userPlaylist[0], " User Playlists are fetched successfully")
    )
})















export {
    getPlaylistById,
    createPlaylist,
    addVideoToPlaylist,
    deletePlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    getUserPlaylists


}




      


    