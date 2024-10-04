import Joi from 'joi';

//step 1 - define schema
const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    age: Joi.number().min(18).max(100).required(),
    email: Joi.string().email().pattern(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/, 'email').required()
});

//step 2 - define data

let person = {
    name: "John Doe",
    age: 25,
    email: "JohnDoe@gmail.com" 
};

//step 3 - validate data
const validateResult = schema.validate(person, {abortEarly: false});
console.log(JSON.stringify(validateResult, null, 2));

