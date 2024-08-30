import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });


let income; //get income from user
let taxOwed = null;
let status;

status = await rl.question("Are you single or Married filling jointly?(1 for single and 2 for married): ");
if (status === 1) {


if(income < 16000){
  income = await rl.question("Enter your taxable income for 2024:");
  income = parseFloat(income);
  let taxOwed = 3432;
  let totalTaxIncome = income - taxOwed;
  console.log(Math.ceil(totalTaxIncome));
}else if(income < 47150){

}else if(income < 100525){
  
}else if(income < 191950){

}else if(income < 243727){

}else if(income < 609350){

}else{

}
}

if (status === 2) {

}
