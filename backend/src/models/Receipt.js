import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
{
    purchase:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Purchase",
        required:true,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    receiptNumber:{
        type:String,
        unique:true,
    },
    razorpayOrderId:String,
    razorpayPaymentId:String,
    contentId:Number,
    title:String,
    contentType:{
        type:String,
        enum:["movie","tv","subscription"],
    },
    amount:Number,
    currency:{
        type:String,
        default:"INR",
    },
    status:{
        type:String,
        enum:["paid","refunded"],
        default:"paid",
    },
    paidAt:{
        type:Date,
        default:Date.now,
    }
},
{
    timestamps:true,
});

export default mongoose.model("Receipt",receiptSchema);