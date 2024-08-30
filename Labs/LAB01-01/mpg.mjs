import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

let milesDriven = null;

do{
    milesDriven = await rl.question('Enter the miles driven(Number greater than 0):');
    milesDriven = parseFloat(milesDriven);
}while(!milesDriven || milesDriven < 0);