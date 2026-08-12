import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dns from 'dns';
import morgan from 'morgan';
import authRouter from './routes/auth.route.js';
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
app.use('/api/auth', authRouter);


app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
