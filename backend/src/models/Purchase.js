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
        default:0,
    },

    title:{
        type:String,
        default:"TMDB VIP Subscription",
    },

    poster:{
        type:String,
        default:"",
    },

    contentType:{
        type:String,
        default:"subscription",
    },

    plan:{
        type:String,
        enum:["monthly", "quarterly", "yearly", "custom"],
        default:"monthly",
    },

    startDate:{
        type:Date,
        default:null,
    },

    expiresAt:{
        type:Date,
        default:null,
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

export default mongoose.model("Purchase",purchaseSchema);