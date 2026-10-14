import { Router } from "express";
import { validateRegisterUser, validateLoginUser } from "../validator/auth.validator.js";
import { register, login, googleCallback, getMe, completeProfile, updateProfile, getOrders, becomeSeller, saveAddress } from "../controllers/auth.controller.js";

import passport from "passport";
import { config } from "../config/config.js";
import { authenticate } from "../middlewares/auth.middleware.js";
const router = Router();

router.post('/register', validateRegisterUser, register);
router.post('/login', validateLoginUser, login);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfile);
router.post('/complete-profile', completeProfile);
router.get('/orders', authenticate, getOrders);
router.post('/become-seller', authenticate, becomeSeller);
router.post('/addresses', authenticate, saveAddress);
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${config.FRONTEND_URL}/login`,
    }),
    googleCallback,
);

export default router;