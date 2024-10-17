import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { productsRouter } from './routes/api/product.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('frontend/dist'));

app.use('/api/products', productsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  debugServer(`Error: ${err.message}`);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});


const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});