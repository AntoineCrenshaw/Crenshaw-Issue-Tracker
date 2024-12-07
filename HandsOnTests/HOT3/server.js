import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import debug from 'debug';
const debugServer = debug('app:server');

import { authMiddleware } from '@merlin4/express-auth';

import { productsRouter } from './routes/api/product.js';
import { usersRouter } from './routes/api/users.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('frontend/dist'));
app.use(cors());
app.use(cookieParser());

app.use(authMiddleware(process.env.JWT_SECRET, 'authToken', {
  httpOnly: true,
  maxAge: 1000 * 60 * 60,
}));

app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  debugServer(`Error: ${err.message}`);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});