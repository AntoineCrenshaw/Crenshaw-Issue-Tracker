import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

const tableSize = await rl.question("How big do you want the table to be (1-12)? ");

for (let i = 1; i <= tableSize; i++) {
    for (let j = 1; j <= tableSize; j++) {
        process.stdout.write(`${i * j}\t`);
    }
    console.log();
}

rl.close();