import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";
import { config } from "../config/config.js";

async function sendTokenResponse(user, res,message) {

    const token = jwt.sign({
        id: user._id,

    },config.JWT_SECRET,{
        expiresIn: "7d"
    })

    res.cookie("token", token)

    res.status(200).json({
        message,
        success:true,
        user:{
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role,
        }
    })
}

 export const register = async (req, res) => {

    const { email, contact, password, fullname, isSeller } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    try {
        const existingUser = await userModel.findOne({
            $or: [{ email: normalizedEmail }, { contact }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or contact already exists' });
        }

        const user = await userModel.create({
            email: normalizedEmail, contact, password, fullname, role: isSeller ? 'seller' : 'buyer'
        });
        await sendTokenResponse(user, res, 'User registered successfully')

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}   

export const login = async (req, res) => {

    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    
    const user = await userModel.findOne({ email: normalizedEmail });

    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    await sendTokenResponse(user, res, 'User logged in successfully')
}

export const googleCallback = async (req, res) => {
  
    const {id,displayName,emails,photos} = req.user

    const email = emails[0].value;
    const profilePicture = photos[0].value

    let user = await userModel.findOne({ email });

    if (!user) {
        user = await userModel.create({
            email,
            fullname: displayName,
            googleId: id,

        })
    }  

    const token = jwt.sign({
        id: user._id,
    },config.JWT_SECRET,{
        expiresIn: "7d"
    })

    res.cookie("token", token)

    res.redirect('http://localhost:5173');
}