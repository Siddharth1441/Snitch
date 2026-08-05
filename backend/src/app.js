import express from 'express';
import cookieParser from 'cookie-parser';
import dns from 'dns';
import morgan from 'morgan';
import authRouter from './routes/auth.route.js';
dns.setServers([
    '1.1.1.1',
    '0.0.0.0'
]); 


const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/auth', authRouter);


app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
