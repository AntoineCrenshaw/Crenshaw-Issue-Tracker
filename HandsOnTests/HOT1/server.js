import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import debug from 'debug';
import { MpgRouter } from './routes/api/mpg.js';
import { IncomeTaxRouter } from './routes/api/income-tax.js';
import { TemperatureRouter } from './routes/api/temperature.js';
import { InterestRouter } from './routes/api/interest.js';
const debugServer = debug('app:server');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/mpg', MpgRouter);
app.use('/api/income', IncomeTaxRouter);
app.use('/api/income-tax', IncomeTaxRouter);
app.use('/api/temperature', TemperatureRouter);
app.use('/api/interest', InterestRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  debugServer(`Server is running on http://localhost:${port}`);
  console.log(`Server is running on http://localhost:${port}`);
});