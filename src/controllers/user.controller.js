import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler( async (req,res)=>{
   const {fullName , email , username, password} =req.body
   console.log(email);

   if(
            [fullName ,email ,username,password].some((field)=>field?.trim()==="")
   ){
         throw new ApiError(400, "All field is required")
   }
   
 const existedUser =  User.findOne({$or:[{username},{email}]})

 if(existedUser.username){
    throw ApiError(409, "Username already exits")
 }else if(existedUser.email){
    throw ApiError(409, "email already exits")
 }

   const avatarLocalPath =   req.files?.avatar[0]?.path
   const coverImageLocalPath =   req.files?.coverImage[0]?.path

   if(!avatarLocalPath){
    throw ApiError(400, "Avatar is required")
   }

 const avatar =  await uploadCloudinary(avatarLocalPath)
 const coverImage =  await uploadCloudinary(coverImageLocalPath)
 if(!avatar){
    throw ApiError(400, "Avatar is required")
   }

  const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select("-password -refreshToken")
   if(!createdUser){
    throw ApiError(500, "something went wrong while registring the user")
   }

   return res.status(201).json(
    new Apiresponse(200,createdUser,"User register Successfully")
   )
})

export {registerUser}