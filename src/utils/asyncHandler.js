const asyncHandler =  (requestHandler) => async (req , res, next )=>{
   try {
      requestHandler(req,res,next)
   } catch (error) {
    console.log()
   }
}

export {asyncHandler}