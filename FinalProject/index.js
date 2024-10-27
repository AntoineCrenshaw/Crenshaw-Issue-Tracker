import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import debug from 'debug';
const debugServer = debug('app:server');

import { authMiddleware } from '@merlin4/express-auth';

import { userRouter } from './routes/api/user.js';
import { bugRouter } from './routes/api/bugs.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('frontend/dist'));

app.use(cookieParser());

app.use(authMiddleware(process.env.JWT_SECRET, 'authToken', {
  httpOnly: true,
  maxAge: 1000 * 60 * 60,
}));

app.use('/api/users', userRouter);
app.use('/api/bugs', bugRouter);

  //handle server exceptions to keep my server from crashing
app.use((err, req, res, next) => {
  res.status(err.status).json({error: err.message});
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
    debugServer(`Server is running on http://localhost:${port}`);
});