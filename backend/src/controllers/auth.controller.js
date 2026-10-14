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
            addresses: user.addresses || [],
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
  
    const {id, displayName, emails} = req.user
    const email = emails[0].value;

    let user = await userModel.findOne({ email });
    const isNewUser = !user;

    if (isNewUser) {
        // Create user with no role set yet — they'll complete profile next
        user = await userModel.create({
            email,
            fullname: displayName,
            googleId: id,
        })
    }  

    if (isNewUser) {
        // Issue a short-lived "setup" token so they can complete their profile
        const setupToken = jwt.sign({
            id: user._id,
            needsSetup: true,
        }, config.JWT_SECRET, { expiresIn: '30m' });

        return res.redirect(`${config.FRONTEND_URL}/complete-profile?token=${setupToken}`);
    }

    // Existing Google user — log in directly
    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token);
    return res.redirect(config.FRONTEND_URL);
}

export const completeProfile = async (req, res) => {
    try {
        // Token comes from Authorization header (Bearer <setup_token>)
        const token = req.headers.authorization?.split(' ')[1] || req.body.token;
        if (!token) return res.status(401).json({ message: 'Unauthorized', success: false })

        const decoded = jwt.verify(token, config.JWT_SECRET);
        if (!decoded.needsSetup) {
            return res.status(400).json({ message: 'This token is not a setup token', success: false })
        }

        const { isSeller, contact } = req.body;
        const role = isSeller ? 'seller' : 'buyer';

        const user = await userModel.findByIdAndUpdate(
            decoded.id,
            { role, ...(contact ? { contact: contact.replace(/\D/g, '') } : {}) },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found', success: false })

        await sendTokenResponse(user, res, 'Profile completed successfully')
    } catch (err) {
        console.error('completeProfile error:', err)
        return res.status(401).json({ message: 'Invalid or expired token', success: false })
    }
}

export const getMe = async (req, res) => {
    const user = req.user;
    return res.status(200).json({
        message: 'Session active',
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role,
            addresses: user.addresses || [],
        }
    });
}

export const saveAddress = async (req, res) => {
    try {
        const address = {
            fullname: String(req.body.fullname || '').trim(),
            phone: String(req.body.phone || '').replace(/\D/g, ''),
            line1: String(req.body.line1 || '').trim(),
            line2: String(req.body.line2 || '').trim(),
            city: String(req.body.city || '').trim(),
            state: String(req.body.state || '').trim(),
            pincode: String(req.body.pincode || '').trim(),
            country: String(req.body.country || 'India').trim() || 'India',
            isDefault: Boolean(req.body.isDefault),
        }

        if (!address.fullname || address.phone.length < 10 || !address.line1 || !address.city || !address.state || !/^\d{6}$/.test(address.pincode)) {
            return res.status(400).json({ message: 'Complete address is required', success: false })
        }

        const user = await userModel.findById(req.user._id)
        if (address.isDefault || user.addresses.length === 0) {
            user.addresses.forEach((item) => { item.isDefault = false })
            address.isDefault = true
        }
        user.addresses.push(address)
        await user.save()

        return res.status(200).json({
            message: 'Address saved',
            success: true,
            user: {
                id: user._id,
                email: user.email,
                contact: user.contact,
                fullname: user.fullname,
                role: user.role,
                addresses: user.addresses || [],
            }
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Internal server error', success: false })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { fullname, contact } = req.body;
        const updates = {};
        if (fullname && fullname.trim().length >= 3) updates.fullname = fullname.trim();
        if (contact) updates.contact = contact.replace(/\D/g, '');

        const user = await userModel.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        );

        return res.status(200).json({
            message: 'Profile updated successfully',
            success: true,
            user: {
                id: user._id,
                email: user.email,
                contact: user.contact,
                fullname: user.fullname,
                role: user.role,
                addresses: user.addresses || [],
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
}

export const getOrders = async (req, res) => {
    try {
        const paymentModel = (await import('../model/payment.model.js')).default;
        const orders = await paymentModel.find({ user: req.user._id, status: 'paid' }).sort({ _id: -1 });
        return res.status(200).json({ message: 'Orders fetched', success: true, orders });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
}

export const becomeSeller = async (req, res) => {
    try {
        const user = await userModel.findByIdAndUpdate(
            req.user._id,
            { role: 'seller' },
            { new: true }
        );
        await sendTokenResponse(user, res, 'You are now a seller!');
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
}