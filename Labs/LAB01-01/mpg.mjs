import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

let milesDriven = null;
let gallonsUsed = null;
let averageMpg;

// Display an error message if the user enters a negative number or 0
// Ask the user to enter the miles driven and the gallons used
// Calculate the average miles per gallon
do{
    milesDriven = await rl.question('Enter the miles driven(Number greater than 0): ');
    milesDriven = parseFloat(milesDriven);
}while(!milesDriven || milesDriven < 0); 
do{
    gallonsUsed = await rl.question("Enter your gallons used(Number greater than 0): ");
    gallonsUsed = parseFloat(gallonsUsed);
}while(!gallonsUsed || gallonsUsed < 0);


averageMpg = milesDriven / gallonsUsed;
console.log(`Your average MPG is: ${averageMpg.toFixed(2)}`);
