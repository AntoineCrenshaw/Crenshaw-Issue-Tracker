import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });


let income = parseFloat(await rl.question("Enter your taxable income for 2024:")); //get income from user
let taxOwed; //calculate tax owed;
let status = await rl.question("Are you single or Married filling jointly?: ");;


if(status === "single") {
  if(income < 16000){
  let totalTaxIncome = income - taxOwed;
  
  }else if(income < 47150){

  }else if(income < 100525){
    
  }else if(income < 191950){

  }else if(income < 243727){

  }else if(income < 609350){

  }else{

  }
  console.log(Math.ceil(totalTaxIncome));
}

if(status === "married") {
    if(income < 23200){
      income = await rl.question("Enter your taxable income for 2024:");
      income = parseFloat(income);
      let taxOwed = 3432;
      let totalTaxIncome = income - taxOwed;
      console.log(Math.ceil(totalTaxIncome));
    }else if(income < 94300){
    
    }else if(income < 201050){
      
    }else if(income < 383900){
    
    }else if(income < 487450){
    
    }else if(income < 731200){
    
    }else{
    
    }
}
