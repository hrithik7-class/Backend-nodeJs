// using promise and then
export const asyncHandler = (requestHandle)=>{
    return (req,res,next)=>{
    Promise.resolve(requestHandle(req,res,next))
    .then(()=>{})
    .catch((error)=>next(error))
    }
}
// At last they returned the anomynous function..
//------------------------------------------------------------------------------


// export const asyncHandler= (func)=> async(req,res,next)=>{
//     try {
//         await func (req,res, next)
        
//     } catch (error) {
//         console.error("Error Message:",error.meassage)
//         throw error;
        
//     }

// }// my fav usinfg try and catch ...

