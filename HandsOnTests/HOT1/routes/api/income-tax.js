import express from 'express';
const router = express.Router();

import debug from 'debug';
const debugBug = debug('app:IncomeTaxRouter');

router.use(express.urlencoded({ extended: false }));

const taxCalculator = [
  { mode: "Single", income: 50000 },
  { mode: "Married", income: 70000},
];

router.get('/list', (req, res) => {
  res.json(taxCalculator);
});

router.post('/calc', (req, res) => {
  const { mode, income } = req.body;

  if (!mode || !income) {
    return res.status(400).json({ msg: "Please include mode and income" });
  };

  if (mode !== "Single" && mode !== "Married") {
    return res.status(400).json({ msg: "Mode must be Single or Married" });
  }

  const incomeFloat = parseFloat(income);

  if (isNaN(incomeFloat) || incomeFloat <= 0) {
    return res.status(400).json({ msg: "income must be a valid number" });
  }

  let calculatedTax;

  if (mode === "Single") {
    if (incomeFloat <= 16000) {
      calculatedTax = incomeFloat * 0.1;
    }else if(incomeFloat < 47150){
      calculatedTax = (incomeFloat - 11600) * 0.12 + 1600;
      }else if(incomeFloat < 100525){
      calculatedTax = (incomeFloat - 47150) * 0.22 + 1600 + (47150 - 1600) * 0.12;
      }else if(incomeFloat < 191950){
          calculatedTax = (incomeFloat - 100525) * 0.24 + 1600 + (47150 - 1600) * 0.12 + (100525 - 47150) * 0.22;
      }else if (incomeFloat < 243727) {
          calculatedTax = (incomeFloat - 191950) * 0.32 + 1600 + (47150 - 16000) * 0.12 + (100525 - 47150) * 0.22 + (191950 - 100525) * 0.24;
      } else if (incomeFloat < 609350) {
          calculatedTax = (incomeFloat - 243727) * 0.35 + 1600 + (47150 - 16000) * 0.12 + (100525 - 47150) * 0.22 + (191950 - 100525) * 0.24 + (243727 - 191950) * 0.32;
      } else {
          calculatedTax = (incomeFloat - 609350) * 0.37 + 1600 + (47150 - 16000) * 0.12 + (100525 - 47150) * 0.22 + (191950 - 100525) * 0.24 + (243727 - 191950) * 0.32 + (609350 - 243727) * 0.35;
      }
  } 

  if ( mode === "married") {
    if(incomeFloat < 23200){
         calculatedTax = incomeFloat * 0.10;
      }else if(incomeFloat < 94300){
        calculatedTax = (incomeFloat - 23200) * .12 + 2320;
      }else if(incomeFloat < 201050){
        calculatedTax = (incomeFloat - 94300) * .22 + 2320 + (94300 - 23200) * .12;
      }else if(incomeFloat < 383900){
        calculatedTax = (incomeFloat - 201050) * .24 + 2320 + (94300 - 23200) * .12 + (201050 - 94300) * 0.22;
      }else if(incomeFloat < 487450){
        calculatedTax = (incomeFloat - 383900) * .32 + 2320 + (94300 - 23200) * .12 + (201050 - 94300) * .22 + (383900 - 201050) * .24;
      }else if(incomeFloat < 731200){
        calculatedTax = (incomeFloat - 487450) * .35 + 2320 + (94300 - 23200) * .12 + (201050 - 94300) * .22 + (383900 - 201050) * .24 + (487450 - 383900) * .32;
      }else{
        calculatedTax = (incomeFloat - 731200) * .37 + 2320 + (94300 - 23200) * .12 + (201050 - 94300) * .22 + (383900 - 201050) * .24 + (487450 - 383900) * .32 + (731200 - 487450) * .34;
      }
} 
  debugBug(`Tax: ${Math.ceil(calculatedTax)}`);
  res.json({ tax: Math.ceil(calculatedTax)});
});




export { router as IncomeTaxRouter };