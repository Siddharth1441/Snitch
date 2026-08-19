import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dns from 'dns';
import morgan from 'morgan';
import authRouter from './routes/auth.route.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './config/config.js';
import productRouter from "../src/routes/product.routes.js";

dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
]);



const app = express();
app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api/auth', authRouter);
app.use('/api/products',productRouter)
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    // Handle user authentication logic here
    return done(null, profile);
}));


export default app;
