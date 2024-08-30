import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });


let income = parseFloat(await rl.question("Enter your taxable income for 2024:")); //get income from user
let taxOwed; //calculate tax owed;
let status = await rl.question("Are you single or Married filling jointly?: ");
let totalTaxIncome;


if(status === "single") {
  if(income < 16000){
  totalTaxIncome = income * 0.10;
  
  }else if(income < 47150){
   totalTaxIncome = (income - 11600) * 0.12;
  }else if(income < 100525){
   totalTaxIncome = (income - 47150) * 0.22;
  }else if(income < 191950){
    totalTaxIncome = (income - 100525) * 0.24;
  }else if(income < 243727){
    totalTaxIncome = (income - 191950) * 0.32;
  }else if(income < 609350){
    totalTaxIncome = (income - 243727) * 0.35;
  }else{
    totalTaxIncome = (income - 609350) * 0.37;
  }
  console.log(Math.ceil(totalTaxIncome));
}

// if(status === "married") {
//     if(income < 23200){
//       let totalTaxIncome = income * 0.10;
//     }else if(income < 94300){
    
//     }else if(income < 201050){
      
//     }else if(income < 383900){
    
//     }else if(income < 487450){
    
//     }else if(income < 731200){
    
//     }else{
    
//     }
//     console.log(Math.ceil(totalTaxIncome));
// }
