import { asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { use } from "bcrypt/promises.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import res from "express/lib/response.js";
import jwt from "jsonwebtoken";

const generateAccessAndrRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSafe: false })

        return{ accessToken, refreshToken}
    
    
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
        
    }
}







const registerUser = asyncHandler( async ( req, res) => {
    // get user details from frontend : req.body
    // validation  user details -> not empty
    // check if user already exists: email or username
    // check for images , check for avatar(compulsory)
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove the password & refreshToken field from response
    // check for user creation
    // return response
    

   const { fullName , email,  username, password} = req.body
   //console.log("BODY REQUEST: ", req.body)

   if (
       [fullName, email, username , password].some((field) => 
    field?.trim() === "")
   ) {

      throw new ApiError(400, "All fields are required")
    }

    const existedUser =  await User.findOne({
        $or: [{ username }, { email }]
    })

    console.log("UserExisted: ", existedUser);


    if (existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    
    //console.log("The File path for avatar in REQ.FILES: ", req.files);
    //console.log("AvatorLocalPath: " , avatarLocalPath);
    
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    
    //console.log("The File path for coverImage in REQ.FILES: ", req.files);
    //console.log("CoverImageLocalPath: " , coverImageLocalPath);


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    //console.log("Avatar: " , avatar);
    //console.log("CoverImage: " , coverImage);

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //console.log("User: " , user);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    //console.log("CreatedUser: " , createdUser);


    if (!createdUser) {
        throw ApiError(500, "Something went wrong while registering the user")

    }

    return res.status(201).json(
        new ApiResponse(200, createdUser , "User Registered Successfully")
    )

} )




const loginUser = asyncHandler(async ( req, res) => {

    // User gives crendential details : email and password
    // check user-email in DB and password
    // validate the access token for the user
    // if user found grant him access using the token
    // else throught error user does not exist 



    // req body -> data
    // username or email
    // find the user
    // password check
    // generate access and refresh token
    // send cookies


    const { email, username , password } = req.body
    //console.log(email);

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")

    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })


    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid =  await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } =  await generateAccessAndrRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password  -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
           .status(200)
           .cookie("accessToken", accessToken, options)
           .cookie("refreshToken", refreshToken, options)
           .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                 "User logged In Successfully"
            )
           )

})


const logoutUser = asyncHandler( async ( req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
           .status(200)
           .clearCookie("accessToken", options)
           .clearCookie("refreshToken",options)
           .json(
            new ApiResponse(200, {} , "User logged Out Successfully")
           )



    
})


const refreshAccessToken = asyncHandler( async(req, res) => {
    // check if the refresh token exists

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken


    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    // verify incomingRefreshToken using jwt

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
           process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
    
        const { accessToken, newRefreshToken } = await generateAccessAndrRefreshTokens(user._id)
        
        return res
        .status(200)
        .cookie("accessToken", accessToken ,options)
        .cookie("refreshToken", newRefreshToken ,options)
        .json(
            new ApiResponse(
                200, 
                { accessToken , refreshToken: newRefreshToken },
                "Access token refreshed successfully"
            )
        )
        
    }  catch (error) {
        throw new ApiError(401,  error?.message || "Invalid refresh token")

        
    }
    
    
})

const changeCurrentPassword = asyncHandler( async(req, res) => {
    const {oldPassword , newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "invalid old password")
        
    }

    user.password = newPassword
    await user.save({ validateBeforeSafe: false })

    return res
           .status(200)
           .json( new ApiResponse(200 ,{}, "Password Changed Successfully" ))

})



const getCurrentUser = asyncHandler( async( req, res) => {
    return res
           .status(200)
           .json(200 , req.user, "Current user fetched successfully")
})


const updateAccountDetails = asyncHandler( async (req, res) => {
    const {fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError("All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                 fullName,
                 email
            }
                 
        },
        { new: true}
    ).select("-password")


    return res
           .status(200)
           .json(new ApiResponse(200, user, "Account details updated successfully"))
})


// const updateUserAvatar =  asyncHandler( async (req, res) => {
//     const avatarLocalPath = req.file?.path

//     if (!avatarLocalPath) {
//         throw new ApiError(400, "Avatar file is missing")
//     }

//     const avatar = await uploadOnCloudinary(avatarLocalPath)

//     if (!avatar.url) {
//         throw new ApiError(400, "Error while uploading on avatar")
        
//     }


//     const user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set:{
//                  avatar: avatar.url
//             }
                 
//         },
//         { new: true}
//     ).select("-password")

    
//     return res
//            .status(200)
//            .json( new ApiResponse(200, user , "Avatar Image updated  successfully"))

// })



const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const user = await User.findById(req.user?._id);
    
    // Check if the user already has an avatar and delete it from Cloudinary
    if (user?.avatar) {
        // Assuming the avatar URL is something like 'https://res.cloudinary.com/your_cloud_name/image/upload/v12345678/publicId.jpg'
        // We extract 'publicId' (before the file extension).
        const publicId = user.avatar.split('/').slice(-1)[0].split('.')[0]; // Extract publicId from URL
        try {
            await deleteFromCloudinary(publicId); // Delete old avatar
        } catch (error) {
            throw new ApiError(500, "Could not delete the existing avatar from Cloudinary");
        }
    }

    // Upload new avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading the avatar");
    }

    // Update the user's avatar URL
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Avatar Image updated successfully"));
});



















const updateUserCoverImage =  asyncHandler( async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                 coverImage: coverImage.url
            }
                 
        },
        { new: true}
    ).select("-password")


})

    
    return res
           .status(200)
           .json( new ApiResponse(200,  user , "Cover Image  updated successfully"))





export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}