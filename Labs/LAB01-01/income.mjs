import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

async function calculateTax() {
    try {
       const income = parseFloat(await rl.question("Enter your taxable income for 2024:")); //get income from user
        let status = await rl.question("Are you single or Married filling jointly? (Enter single or married): ");
        let totalTaxIncome; 

        
        if(status === "single") {
        if(income < 16000){
        totalTaxIncome = income * 0.10;
        }else if(income < 47150){
        totalTaxIncome = (income - 11600) * 0.12 + 1600;
        }else if(income < 100525){
        totalTaxIncome = (income - 47150) * 0.22 + 1600 + (47150 - 1600) * 0.12;
        }else if(income < 191950){
            totalTaxIncome = (income - 100525) * 0.24 + 1600 + (47150 - 1600) * 0.12 + (100525 - 47150) * 0.22;
        }else if (income < 243727) {
            totalTaxIncome = (income - 191950) * 0.32 + 1600 + (47150 - 16000) * 0.12 + (100525 - 47150) * 0.22 + (191950 - 100525) * 0.24;
        } else if (income < 609350) {
            totalTaxIncome = (income - 243727) * 0.35 + 1600 + (47150 - 16000) * 0.12 + (100525 - 47150) * 0.22 + (191950 - 100525) * 0.24 + (243727 - 191950) * 0.32;
        } else {
            totalTaxIncome = (income - 609350) * 0.37 + 1600 + (47150 - 16000) * 0.12 + (100525 - 47150) * 0.22 + (191950 - 100525) * 0.24 + (243727 - 191950) * 0.32 + (609350 - 243727) * 0.35;
        }
  
}
 if ( status === "married") {
    if(income < 23200){
         totalTaxIncome = income * 0.10;
      }else if(income < 94300){
        totalTaxIncome = (income - 23200) * .12 + 2320;
      }else if(income < 201050){
        totalTaxIncome = (income - 94300) * .22 + 2320 + (94300 - 23200) * .12;
      }else if(income < 383900){
        totalTaxIncome = (income - 201050) * .24 + 2320 + (94300 - 23200) * .12 + (201050 - 94300) * 0.22;
      }else if(income < 487450){
        totalTaxIncome = (income - 383900) * .32 + 2320 + (94300 - 23200) * .12 + (201050 - 94300) * .22 + (383900 - 201050) * .24;
      }else if(income < 731200){
        totalTaxIncome = (income - 487450) * .35 + 2320 + (94300 - 23200) * .12 + (201050 - 94300) * .22 + (383900 - 201050) * .24 + (487450 - 383900) * .32;
      }else{
        totalTaxIncome = (income - 731200) * .37 + 2320 + (94300 - 23200) * .12 + (201050 - 94300) * .22 + (383900 - 201050) * .24 + (487450 - 383900) * .32 + (731200 - 487450) * .34;
      }
} 
    console.log(`Your total tax is: $${Math.ceil(totalTaxIncome)}`);
    } catch (error) {
    console.error("Error", error);
    } finally{
      rl.close();
    }
  }

calculateTax();

