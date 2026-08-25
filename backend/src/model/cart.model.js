import mongoose from "mongoose";
import priceShema from "./price.schema.js";

const cartSchema  = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        requried:true
    },
    items:[
        {
            product:{
                type:mongoose.Schema.ObjectId,
                ref:'product',
                required:true
            },
            varient:{
                type:mongoose.Schema.ObjectId,
                ref:'variant',

            },
            quantity:{
                type:mongoose.Schema.ObjectId,
                default:1
            },
            price:{
                type : priceShema,
                required:true
            }
        }
    ]
})

const cartModel = mongoose.model('cart',cartSchema)
export default cartModel