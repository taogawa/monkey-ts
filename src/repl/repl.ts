import readline from 'readline';
import { Lexer } from '../lexer/lexer';
import { Parser } from '../parser/parser';
import { evaluate } from '../evaluator/evaluator';

export const startRepl = (): void => {
  const prompt = '>>';
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: prompt,
  });
  rl.on('line', (input) => {
    const l = new Lexer(input);
    const p = new Parser(l);

    const program = p.parseProgram();
    if (p.errors.length != 0) {
      printParserErrors(p.errors);
    }
    const evaluated = evaluate(program);
    if (evaluated != null) {
      console.log(evaluated.inspect());
    }
  });
};

const MONKEY_FACE = `            __,__
   .--.  .-"     "-.  .--.
  / .. \\/  .-. .-.  \\/ .. \\
 | |  '|  /   Y   \\  |'  | |
 | \\   \\  \\ 0 | 0 /  /   / |
  \\ '- ,\\.-"""""""-./, -' /
   ''-' /_   ^ ^   _\\ '-''
       |  \\._   _./  |
       \\   \\ '~' /   /
        '._ '-=-' _.'
           '-----
`;

const printParserErrors = (errors: string[]): void => {
  console.log(MONKEY_FACE);
  console.log('Woops! We ran into some monkey business here!');
  console.log(' parser errors:');
  errors.forEach((msg) => {
    console.log(`\t${msg}`);
  });
};
