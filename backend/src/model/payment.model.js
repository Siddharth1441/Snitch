import mongoose from "mongoose";
import priceShema from "./price.schema.js";

const paymentShema = new mongoose.Schema({
    status:{
        type:String,
        emum:["pending","paid","failed"],
        default:"pending"
    },
    price:{
        type:priceShema,
        required:true
    },
    razorpay:{
        orderId:String,
        paymentId:String,
        signature:String
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    orderItems:[
        {
            title:String,
            productId:mongoose.Schema.Types.ObjectId,
            variantId:mongoose.Schema.Types.ObjectId,
            quantity:Number,
            description:String,
            images:[{url:String}],
            price:priceShema
        }
    ]
})

const paymentModel = mongoose.model("payment",paymentShema)

export default paymentModel