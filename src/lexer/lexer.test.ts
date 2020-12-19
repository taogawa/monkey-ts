import { TokenType, TokenTypes } from "../token/token";
import { Lexer } from "../lexer/lexer"

test("next token", () => {
  const input = "=+(){},;";
  const tests: Array<{
    expectedType: TokenType;
    expectedLiteral: string;
  }> = [
    { expectedType: TokenTypes.ASSIGN, expectedLiteral: "=" },
    { expectedType: TokenTypes.PLUS, expectedLiteral: "+" },
    { expectedType: TokenTypes.LPAREN, expectedLiteral: "(" },
    { expectedType: TokenTypes.RPAREN, expectedLiteral: ")" },
    { expectedType: TokenTypes.LBRACE, expectedLiteral: "{" },
    { expectedType: TokenTypes.RBRACE, expectedLiteral: "}" },
    { expectedType: TokenTypes.COMMA, expectedLiteral: "," },
    { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ";" },
    { expectedType: TokenTypes.EOF, expectedLiteral: "" },
  ];
  const l = new Lexer(input);
  tests.forEach((tt) => {
    const tok = l.nextToken();
    expect(tok.type).toBe(tt.expectedType);
    expect(tok.literal).toBe(tt.expectedLiteral);
  });
});
