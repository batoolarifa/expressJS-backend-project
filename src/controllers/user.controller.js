import { asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { use } from "bcrypt/promises.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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


export { registerUser}