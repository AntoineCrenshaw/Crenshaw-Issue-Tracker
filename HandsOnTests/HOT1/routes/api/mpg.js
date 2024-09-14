import express from "express";

const router = express.Router();

import debug from "debug";
const debugUser = debug("app:MpgRouter");

router.use(express.urlencoded({ extended: false }));

const mpgCalculator = [
  { miles: 100, gallons: 5, mpg: 20 },
  { miles: 200, gallons: 10, mpg: 20},
];

router.get("/list", (req, res) => {
  res.json(mpgCalculator);
});

router.post("/calc", (req, res) => {
  const { miles, gallons } = req.body;

  if (!miles || !gallons) {
    return res.status(400).json({ msg: "Please include miles and gallons" });
  } 

    const milesFloat = parseFloat(miles);
    const gallonsFloat = parseFloat(gallons);

    if (isNaN(milesFloat) || isNaN(gallonsFloat) || milesFloat <= 0 || gallonsFloat <= 0) {
      return res.status(400).json({ msg: "Miles and Gallons must include valid numbers" });
    }

    const mpg = milesFloat / gallonsFloat;
    debugUser(`MPG: ${mpg.toFixed(2)}`);
    res.json({ mpg: mpg.toFixed(2) });
});




export { router as MpgRouter };