import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { config } from "../config/config.js";

async function sendTokenResponse(user, res) {

    const token = jwt.sign({
        id: user._id,

    },config.JWT_SECRET)
}

const registerUser = async (req, res) => {

    const { email, contact, password, fullname, role } = req.body;

    try {
        const existingUser = await userModel.findOne({
            $or: [{ email }, { contact }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or contact already exists' });
        }

        const user = await userModel.create({
            email, contact, password, fullname, role
        });
        const 


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}   