export const getMe = async (req,res,next)=>{
    return res.status(200).json({
        success:true,
        user:req.user
    });
}