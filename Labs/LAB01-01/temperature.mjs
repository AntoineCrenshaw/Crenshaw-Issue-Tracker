import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

async function temperatureConverter() {
  const convert = await rl.question('Do you want to convert to Celsius or Fahrenheit? ');

  if (convert.toLowerCase() === "f") {
    let celsius = await rl.question('Enter temperature in Celsius: ');
    celsius = parseFloat(celsius);
    let fahrenheit = (celsius * (9 / 5)) + 32;
    console.log(`Temperature in Fahrenheit: ${fahrenheit}`);
  } else if (convert.toLowerCase() === "c") {
    let fahrenheit = await rl.question('Enter temperature in Fahrenheit: ');
    fahrenheit = parseFloat(fahrenheit);
    let celsius = (fahrenheit - 32) * (5 / 9);
    console.log(`Temperature in Celsius: ${celsius}`);
  } else {
    console.log('Invalid entry. Please type "c" for Celsius or "f" for Fahrenheit.');
  }

  rl.close();
}

temperatureConverter();