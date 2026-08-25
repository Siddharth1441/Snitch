import mongoose from "mongoose";
import priceShema from "./price.schema.js"
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
       type:priceShema,
       required:true
    },
    images: [
        {
            url: {
                type: String,
                required: true
            }
        }
    ],
    varients: [
        {
            images: [{
                uri: {
                    type: String,
                    required: false
                }
            }],
            stock: {
                type: Number,
                default: 0
            },
            attributes: {
                type: mongoose.Schema.Types.Mixed,
                default: {}
            },
            price:{
                type:priceShema
            }
        }
    ]
}, {
    timestamps: true
})

const productModel = mongoose.model('product', productSchema);

export default productModel;
