import readline from 'readline';
import { TokenTypes } from '../token/token';
import { Lexer } from '../lexer/lexer';

export const startRepl = ():void => {
  const prompt = '>>';
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: prompt,
  });
  rl.on('line', (input) => {
    const l = new Lexer(input);
    for (
      let tok = l.nextToken();
      tok.type !== TokenTypes.EOF;
      tok = l.nextToken()
    ) {
      console.log(tok);
    }
  });
};
