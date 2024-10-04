import Joi from 'joi';

const numberSchema = Joi.number().min(0).max(100).required();

let data;

const validateResult = numberSchema.validate(data);

console.log(JSON.stringify(validateResult, null, 2));