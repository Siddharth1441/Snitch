import mongoose from "mongoose";
import bycrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    contact: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId 
        }
    },
    fullname: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['buyer', 'seller'],
        default: 'buyer'
    },
    googleId: {
        type: String,
    },
    addresses: [
        {
            fullname: { type: String, required: true },
            phone: { type: String, required: true },
            line1: { type: String, required: true },
            line2: { type: String, default: '' },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            country: { type: String, default: 'India' },
            isDefault: { type: Boolean, default: false }
        }
    ]

})

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const hash = await bycrypt.hash(this.password, 10);
    this.password = hash;
})


userSchema.methods.comparePassword = async function (password) {
    return await bycrypt.compare(password, this.password);
}


const userModel = mongoose.model('User', userSchema);

export default userModel;