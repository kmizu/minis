// 再帰下降パーサー: テキスト数式 → AST
// 文法:
//   expression     → comparison
//   comparison     → additive (("<" | ">" | "<=" | ">=" | "==" | "!=") additive)?
//   additive       → multiplicative (("+" | "-") multiplicative)*
//   multiplicative → unary (("*" | "/") unary)*
//   unary          → "-" unary | primary
//   primary        → NUMBER | "(" expression ")"

import { tAdd, tSub, tMul, tDiv, tInt, tLt, tGt, tLte, tGte, tEq, tNe } from './ast.js';

// --- トークナイザー ---

const TokenType = {
  NUMBER: 'NUMBER',
  PLUS: '+',
  MINUS: '-',
  STAR: '*',
  SLASH: '/',
  LPAREN: '(',
  RPAREN: ')',
  LT: '<',
  GT: '>',
  LTE: '<=',
  GTE: '>=',
  EQ: '==',
  NEQ: '!=',
  EOF: 'EOF',
};

const SINGLE_TOKENS = {
  '+': TokenType.PLUS,
  '-': TokenType.MINUS,
  '*': TokenType.STAR,
  '/': TokenType.SLASH,
  '(': TokenType.LPAREN,
  ')': TokenType.RPAREN,
  '<': TokenType.LT,
  '>': TokenType.GT,
};

const MAX_INPUT_LENGTH = 1000;
const MAX_DEPTH = 200;

function tokenize(input) {
  const tokens = [];
  let pos = 0;

  while (pos < input.length) {
    // 空白スキップ
    if (/\s/.test(input[pos])) {
      pos++;
      continue;
    }

    // 数値
    if (/[0-9]/.test(input[pos])) {
      let numStr = '';
      const start = pos;
      while (pos < input.length && /[0-9]/.test(input[pos])) {
        numStr += input[pos];
        pos++;
      }
      if (pos < input.length && input[pos] === '.') {
        throw new Error(`位置 ${pos}: 小数はサポートされていません（整数のみ）`);
      }
      tokens.push({ type: TokenType.NUMBER, value: parseInt(numStr, 10), pos: start });
      continue;
    }

    // 2文字演算子（先にチェック）
    const two = input.substring(pos, pos + 2);
    if (two === '<=' || two === '>=' || two === '==' || two === '!=') {
      tokens.push({ type: two, value: two, pos });
      pos += 2;
      continue;
    }

    // 1文字トークン
    const ch = input[pos];
    if (ch in SINGLE_TOKENS) {
      tokens.push({ type: SINGLE_TOKENS[ch], value: ch, pos });
      pos++;
      continue;
    }

    throw new Error(`位置 ${pos}: 予期しない文字 '${ch}'`);
  }

  tokens.push({ type: TokenType.EOF, value: null, pos });
  return tokens;
}

// --- パーサー ---

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.depth = 0;
  }

  peek() {
    return this.tokens[this.pos];
  }

  advance() {
    const token = this.tokens[this.pos];
    this.pos++;
    return token;
  }

  expect(type) {
    const token = this.peek();
    if (token.type !== type) {
      throw new Error(`位置 ${token.pos}: '${type}' が必要ですが '${token.value || token.type}' が見つかりました`);
    }
    return this.advance();
  }

  enterDepth() {
    if (++this.depth > MAX_DEPTH) {
      throw new Error('式のネストが深すぎます（最大200段）');
    }
  }

  exitDepth() {
    this.depth--;
  }

  // expression → comparison
  parseExpression() {
    this.enterDepth();
    try {
      return this.parseComparison();
    } finally {
      this.exitDepth();
    }
  }

  // comparison → additive (compOp additive)?  ※連鎖禁止
  parseComparison() {
    let left = this.parseAdditive();

    if (this.isComparisonOp(this.peek().type)) {
      const op = this.advance();
      const right = this.parseAdditive();
      left = this.makeBinExpr(op.type, left, right);

      if (this.isComparisonOp(this.peek().type)) {
        throw new Error(`位置 ${this.peek().pos}: 比較演算子の連鎖は許可されていません（例: a < b < c）`);
      }
    }

    return left;
  }

  isComparisonOp(type) {
    return type === '<' || type === '>' || type === '<=' || type === '>=' || type === '==' || type === '!=';
  }

  // additive → multiplicative (("+" | "-") multiplicative)*
  parseAdditive() {
    let left = this.parseMultiplicative();

    while (this.peek().type === '+' || this.peek().type === '-') {
      const op = this.advance();
      const right = this.parseMultiplicative();
      left = this.makeBinExpr(op.type, left, right);
    }

    return left;
  }

  // multiplicative → unary (("*" | "/") unary)*
  parseMultiplicative() {
    let left = this.parseUnary();

    while (this.peek().type === '*' || this.peek().type === '/') {
      const op = this.advance();
      const right = this.parseUnary();
      left = this.makeBinExpr(op.type, left, right);
    }

    return left;
  }

  // unary → "-" unary | primary
  parseUnary() {
    if (this.peek().type === '-') {
      this.advance();
      const expr = this.parseUnary();
      // -x は 0 - x として表現
      return tSub(tInt(0), expr);
    }
    return this.parsePrimary();
  }

  // primary → NUMBER | "(" expression ")"
  parsePrimary() {
    const token = this.peek();

    if (token.type === TokenType.NUMBER) {
      this.advance();
      return tInt(token.value);
    }

    if (token.type === TokenType.LPAREN) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN);
      return expr;
    }

    throw new Error(`位置 ${token.pos}: 予期しないトークン '${token.value || token.type}'`);
  }

  makeBinExpr(op, left, right) {
    switch (op) {
      case '+': return tAdd(left, right);
      case '-': return tSub(left, right);
      case '*': return tMul(left, right);
      case '/': return tDiv(left, right);
      case '<': return tLt(left, right);
      case '>': return tGt(left, right);
      case '<=': return tLte(left, right);
      case '>=': return tGte(left, right);
      case '==': return tEq(left, right);
      case '!=': return tNe(left, right);
    }
    throw new Error(`未対応の演算子: ${op}`);
  }
}

// --- 公開API ---

export function parse(input) {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error('入力が空です');
  }
  if (trimmed.length > MAX_INPUT_LENGTH) {
    throw new Error(`入力が長すぎます（最大${MAX_INPUT_LENGTH}文字）`);
  }

  const tokens = tokenize(trimmed);
  const parser = new Parser(tokens);
  const ast = parser.parseExpression();

  // 全トークンを消費したか確認
  if (parser.peek().type !== TokenType.EOF) {
    const remaining = parser.peek();
    throw new Error(`位置 ${remaining.pos}: 式の後に余分な入力 '${remaining.value}'`);
  }

  return ast;
}
