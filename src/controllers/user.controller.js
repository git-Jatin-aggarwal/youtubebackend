import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefereshToken = async(userId)=>{
   try {
     const user =  await User.findById(userId)
    const accessToken =  user.generateAccessToken()
    const refershToken =   user.generateRefreshToken()
    user.refershToken =refershToken
   await  user.save({ValidateBeforeSave : false})
      
   return {accessToken ,refershToken}


   } catch (error) {
      throw new ApiError(500 , "something went wrong while creating refresh and access token")
   }
}

const registerUser = asyncHandler( async (req,res)=>{
   const {fullName , email , username, password} =req.body

   if(
            [fullName ,email ,username,password].some((field)=>field?.trim()==="")
   ){
         throw new ApiError(400, "All field is required")
   }
   
 const existedUser = await User.findOne({$or:[{username},{email}]})

 if (existedUser) {
   throw new ApiError(409, "User with email or username already exists")
}

   const avatarLocalPath =   req.files?.avatar[0]?.path
   // const coverImageLocalPath =   req.files?.coverImage[0]?.path

   let coverImageLocalPath;
  if (req.files && Array.isArray( req.files.coverlmage) && req.files.coverlmage.length > 0){coverImageLocalPath = req.files.coverlmage [O] .coverlmageLocalPathpathl}

   if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is required")
   }

 const avatar =  await uploadCloudinary(avatarLocalPath)
 const coverImage =  await uploadCloudinary(coverImageLocalPath)
 if(!avatar){
    throw new ApiError(400, "Avatar is required")
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
    throw new ApiError(500, "something went wrong while registring the user")
   }

   return res.status(201).json(
    new Apiresponse(200,createdUser,"User register Successfully")
   )

   
})

const loginUser = asyncHandler(async(req ,res)=>{
   const {email, username, password} =req.body

   if(!(username || !email)){
      throw new ApiError(400, "username or email is required")
   }

  const user = await User.findOne({
      $or: [{username} ,{email}]
   })

  if(!user){
   throw new ApiError(400 , "user does not exists ")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)


  if(!isPasswordValid){
   throw new ApiError(400 , "Password is Incorrect")
  }

const {accessToken ,refershToken}=  await generateAccessAndRefereshToken(user._id)
const userLogin =  await User.findById(user._Id).select("-password -refreshToken")

const options = {
   httpOnly: true,
   secure:true
}

return res.status(200).cookie("accessToken", accessToken,options).cookie("refreshToken",refershToken,options).json(new Apiresponse(
   200,{
      user:userLogin ,accessToken ,refershToken
   },
   "User logged successfully "
))



    
})


const logoutUser =   asyncHandler(async(req ,res)=>{
  await User.findByIdAndUpdate(
      req.user._id,{
         $set:{
            refreshToken: undefined
         }
      },{
         new: true
      }
   )
   const options = {
      httpOnly: true,
      secure:true
   }

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new Apiresponse(200,{},"User Loggout "))
})


const refreshAccessToken =  asyncHandler(async(req ,res)=>{

   const incomingRefershToken =  req.cookies.refershToken || req.body.refershToken     

   if(!incomingRefershToken){
      throw new ApiError(400,"unauthorized request")
   }

  const decodeToken = jwt.verify(incomingRefershToken,process.env.REFRESH_TOKEN_SECRET)

const user= await User.findById(decodeToken?._id)
if(user){
   throw new ApiError(400,"Invalid Refresh Token")
}

if(incomingRefershToken !== user?.refreshToken){
   throw new ApiError(400,"Refresh Token is expired")

}

const options= {
   httpOnly: true,
   secure :true
}
const Token = await generateAccessAndRefereshToken(user._id)
return res
.status(200)
.cookie("accessToken" , Token.accessToken ,options)
.cookie("refreshToken" , Token.refershToken ,options)
.json(new Apiresponse(200 ))

})


export {registerUser , logoutUser , loginUser, refreshAccessToken}