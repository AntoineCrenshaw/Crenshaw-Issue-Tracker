import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

let celsius;
let fahrenheit;

  do {
    celsius = await rl.question('Enter the temperature in Celsius: ');
    celsius = parseFloat(celsius);
    function celsiusConverter(){
      let celsius = (fahrenheit - 32) * (5/9);
      return celsius;
    };
    console.log(celsiusConverter());

  }while(!celsius);

  do {
    fahrenheit = await rl.question('Enter the temperature in Fahrenheit: ');
    fahrenheit = parseFloat(fahrenheit);
    // function fahrenheitConverter(){
    //   let fahrenheit = (celsius * (9/5)) + 32;
    //   return fahrenheit; 
    // }
    console.log('The temperature in Celsius is: ' + c);
    }while(!fahrenheit);

// celsius = (fahrenheit -32) * (5/9);


// fahrenheit = (celsius * (9/5)) + 32;