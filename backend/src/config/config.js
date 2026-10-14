import dotenv from 'dotenv';
dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in the environment variables');
}

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}
if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not defined in the environment variables');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET is not defined in the environment variables');
}
if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error('IMAGEKIT_PRIVATE_KEY is not defined in the environment variables');
}
if (!process.env.RAZORPAY_KEY_ID) {
    throw new Error('RAZORPAY_KEY_ID is not defined in the environment variables');
}
if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_SECRET is not defined in the environment variables');
}

const nodeEnv = process.env.NODE_ENV || 'development';
const frontendUrl = (
    process.env.FRONTEND_URL
    || (nodeEnv === 'production' ? 'https://snitch-gules.vercel.app' : 'http://localhost:5173')
).replace(/\/+$/, '');
const backendUrl = (
    process.env.BACKEND_URL
    || (nodeEnv === 'production' ? 'https://snitch-dl71.onrender.com' : 'http://localhost:3000')
).replace(/\/+$/, '');
const localOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const configuredOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim().replace(/\/+$/, '')).filter(Boolean)
    : [];

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || `${backendUrl}/api/auth/google/callback`,
    NODE_ENV: nodeEnv,
    FRONTEND_URL: frontendUrl,
    BACKEND_URL: backendUrl,
    CORS_ORIGINS: [...new Set([...localOrigins, ...configuredOrigins, frontendUrl])],
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};
