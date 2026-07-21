import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
{
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    contentId:{
        type:Number,
        required:true,
    },

    title:{
        type:String,
        required:true,
    },

    poster:{
        type:String,
        default:"",
    },

    contentType:{
        type:String,
        enum:["movie","tv"],
        required:true,
    },

    amount:{
        type:Number,
        required:true,
    },

    razorpayOrderId:{
        type:String,
        default:"",
    },

    razorpayPaymentId:{
        type:String,
        default:"",
    },

    status:{
        type:String,
        enum:[
            "pending",
            "paid",
            "failed"
        ],
        default:"pending",
    }
},
{
    timestamps:true,
});

purchaseSchema.index({
    user:1,contentId:1,contentType:1
},{
    unique:true
});

export default mongoose.model("Purchase",purchaseSchema);