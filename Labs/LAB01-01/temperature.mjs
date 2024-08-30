import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

let celsius;
let fahrenheit;

celsius = (fahrenheit -32) * (5/9);

fahrenheit = (celsius * (9/5)) + 32;