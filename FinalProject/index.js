import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import debug from 'debug';
const debugServer = debug('app:server');
import { userRouter } from './routes/api/user.js';
import { bugRouter } from './routes/api/bugs.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('frontend/dist'));

app.use('/api/users', userRouter);
app.use('/api/bugs', bugRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    debugServer(`Error: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  });


const port = process.env.PORT || 3000;

app.listen(port, () => {
    debugServer(`Server is running on http://localhost:${port}`);
});