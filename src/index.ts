import os from 'os';
import { startRepl } from './repl/repl';

const userName = os.userInfo().username;
console.log(`Hello ${userName}! This is the Monkey programming language!`);
console.log(`Feel free to type in commands`);
startRepl();
