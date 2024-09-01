import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

async function calculateTax() {
    try {
        let income = parseFloat(await rl.question("Enter your taxable income for 2024:")); //get income from user
        let status = await rl.question("Are you single or Married filling jointly?: ");
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
 if ( status === "Married filing jointly") {
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
} else {
        console.log('Your total tax income is: ' + Math.ceil(totalTaxIncome));
        rl.close();
        return;
      }
   
    } catch (error) {
    console.error("Error", error);
    rl.close();
    return;
   
} }

calculateTax();

// Test case 1: Single status, income less than 16000
let result = calculateTax(15000, "single");
console.log(result); // Expected output: 1500

// Test case 2: Single status, income between 16000 and 47150
result = calculateTax(30000, "single");
console.log(result); // Expected output: 3520

// Test case 3: Single status, income between 47150 and 100525
result = calculateTax(80000, "single");
console.log(result); // Expected output: 13420

// Test case 4: Single status, income between 100525 and 191950
result = calculateTax(150000, "single");
console.log(result); // Expected output: 31320

// Test case 5: Single status, income between 191950 and 243727
result = calculateTax(220000, "single");
console.log(result); // Expected output: 50220

// Test case 6: Single status, income between 243727 and 609350
result = calculateTax(400000, "single");
console.log(result); // Expected output: 104220

// Test case 7: Single status, income greater than 609350
result = calculateTax(800000, "single");
console.log(result); // Expected output: 244220

// Test case 8: Married filing jointly status, income less than 23200
result = calculateTax(20000, "Married filing jointly");
console.log(result); // Expected output: 2000

// Test case 9: Married filing jointly status, income between 23200 and 94300
result = calculateTax(50000, "Married filing jointly");
console.log(result); // Expected output: 6040

// Test case 10: Married filing jointly status, income between 94300 and 201050
result = calculateTax(150000, "Married filing jointly");
console.log(result); // Expected output: 23440

// Test case 11: Married filing jointly status, income between 201050 and 383900
result = calculateTax(300000, "Married filing jointly");
console.log(result); // Expected output: 53440

// Test case 12: Married filing jointly status, income between 383900 and 487450
result = calculateTax(450000, "Married filing jointly");
console.log(result); // Expected output: 83440

// Test case 13: Married filing jointly status, income between 487450 and 731200
result = calculateTax(600000, "Married filing jointly");
console.log(result); // Expected output: 123440

// Test case 14: Married filing jointly status, income greater than 731200
result = calculateTax(900000, "Married filing jointly");
console.log(result); // Expected output: 223440