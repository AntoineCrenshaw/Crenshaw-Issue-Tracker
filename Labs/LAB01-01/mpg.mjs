import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

let milesDriven = null;
let gallonsUsed = null;
let averageMpg;

if (milesDriven > 0 && gallonsUsed > 0) {
do{
    milesDriven = await rl.question('Enter the miles driven(Number greater than 0): ');
    milesDriven = parseFloat(milesDriven);
}while(!milesDriven || milesDriven < 0);

do{
    gallonsUsed = await rl.question("Enter your gallons used(Number greater than 0): ");
    gallonsUsed = parseFloat(gallonsUsed);
}while(!gallonsUsed || gallonsUsed < 0);
}
else {
    console.log("Error: Entered value must be a number and greater than 0.")
}

averageMpg = milesDriven / gallonsUsed;