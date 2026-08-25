import mongoose from "mongoose";

const priceShema = new mongoose.Schema({
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            enum: ['USD', 'EUR', 'GBP', 'INR'],
            default: 'INR'
        }
   
 },{
    _id: false,
    _v :false
 })

export default priceShema