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
            seller:mongoose.Schema.Types.ObjectId,
            quantity:Number,
            description:String,
            images:[{url:String, uri:String}],
            price:priceShema
        }
    ],
    shippingAddress:{
        fullname:String,
        phone:String,
        line1:String,
        line2:String,
        city:String,
        state:String,
        pincode:String,
        country:String
    },
    fulfillmentStatus:{
        type:String,
        enum:["processing","shipped","delivered","cancelled"],
        default:"processing"
    }
}, { timestamps: true })


const paymentModel = mongoose.model("payment",paymentShema)

export default paymentModel