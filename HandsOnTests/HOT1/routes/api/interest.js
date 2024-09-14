import express from 'express';
const router = express.Router();

import debug from 'debug';
const debugBug = debug('app:InterestRouter');

router.use(express.urlencoded({ extended: false }));

const interestCalculator = [
  { principal: 20, interestRate: 5, years: 2 },
  {  principal: 30, interestRate: 8, years: 12},
];

router.get('/list', (req, res) => {
  res.json(interestCalculator);
});

router.post('/calc', (req, res) => {
  const { principal, interestRate, years } = req.body;

  if (!principal || !interestRate || !years) {
    return res.status(400).json({ msg: "Please include principal, interestRate, and years" });
  };
  
  if (isNaN(principal) || principal <= 0 || principal > 50)  {
    return res.status(400).json({ msg: "Principal must be number between 0 and 50" });
  };
  
  const principalFloat = parseFloat(principal);



  if (isNaN(interestRate) || interestRate <= 0 || interestRate > 50) {
    return res.status(400).json({ msg: "Interest Rate must be number between 0 and 50" });
  };

  const interestRateFloat = parseFloat(interestRate);

  if (isNaN(years) || years <= 0 || years > 50) {
    return res.status(400).json({ msg: "Years must be number between 0 and 50" });
  };

  const yearsFloat = parseFloat(years);

  const interest = principalFloat * ((1 + interestRateFloat /100 /12)) ** (yearsFloat * 12); 
  debugBug(`Interest: ${interest.toFixed(2)}`);
  res.json({ interest: interest.toFixed(2) });
});







export { router as InterestRouter };