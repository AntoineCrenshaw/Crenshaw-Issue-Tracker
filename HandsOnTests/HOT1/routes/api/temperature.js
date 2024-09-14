import express from 'express';
const router = express.Router();

import debug from 'debug';
const debugBug = debug('app:TemperatureRouter');

router.use(express.urlencoded({ extended: false }));

export { router as TemperatureRouter };

const temperatureConverter = [
  { mode: "FtoC", temp: 32 },
  { mode: "CtoF", temp: 0 },
];

router.get("/list", (req, res) => {
  res.json(temperatureConverter);
});

router.post('/convert', (req, res) => {
  const { mode, temp } = req.body;

  if (!mode || !temp) {
    return res.status(400).json({ msg: "Please include mode and temp" });
  }

  if (mode !== "FtoC" && mode !== "CtoF") {
    return res.status(400).json({ msg: "Mode must be FtoC or CtoF" });
  }

  const tempFloat = parseFloat(temp);
  let conversion;
  if (mode === "FtoC") {
    conversion = (tempFloat - 32) * 5 / 9;
  } else if (mode === "CtoF") {
    conversion = tempFloat * 9 / 5 + 32;
  }
  debugBug(`Conversion: ${conversion.toFixed(2)}`);
  res.json({ conversion: conversion.toFixed(2) });
});