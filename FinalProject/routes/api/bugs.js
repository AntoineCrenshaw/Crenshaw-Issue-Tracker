import express from 'express';

const router = express.Router();


router.use(express.urlencoded({ extended: false }));



export { router as bugRouter };