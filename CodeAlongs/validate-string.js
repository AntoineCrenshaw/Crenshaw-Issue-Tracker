import Joi from 'joi';

const schema = Joi.string().email();

const data = "data@ranken.com";

const validateResult = schema.validate(data);

console.log(JSON.stringify(validateResult, null, 2));