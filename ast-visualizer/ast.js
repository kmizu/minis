// AST定義 - minis/expression/expression_ast.js + minis/minis/minis_ast.js のESモジュール版
// 可視化のために children() と label() メソッドを追加

let _nodeIdCounter = 0;
export function resetNodeId() { _nodeIdCounter = 0; }

class MAST {
  constructor(type) {
    this.type = type;
    this._id = _nodeIdCounter++;
  }
  children() { return []; }
  label() { return this.type; }
}

class MExpr extends MAST {
  constructor(type) {
    super(type);
  }
}

export class MProgram extends MAST {
  constructor(functions, ...bodies) {
    super('MProgram');
    this.functions = functions;
    this.bodies = bodies;
  }
  children() { return [...this.functions, ...this.bodies]; }
  label() { return 'Program'; }
}

export class MFunc extends MAST {
  constructor(name, params, body) {
    super('MFunc');
    this.name = name;
    this.params = params;
    this.body = body;
  }
  children() { return [this.body]; }
  label() { return `func ${this.name}(${this.params.join(', ')})`; }
}

export class MBinExpr extends MExpr {
  constructor(op, lhs, rhs) {
    super('MBinExpr');
    this.op = op;
    this.lhs = lhs;
    this.rhs = rhs;
  }
  children() { return [this.lhs, this.rhs]; }
  label() { return this.op; }
}

export class MIf extends MExpr {
  constructor(condition, thenClause, elseClause) {
    super('MIf');
    this.condition = condition;
    this.thenClause = thenClause;
    this.elseClause = elseClause;
  }
  children() { return [this.condition, this.thenClause, this.elseClause]; }
  label() { return 'if'; }
}

export class MSeq extends MExpr {
  constructor(...bodies) {
    super('MSeq');
    this.bodies = bodies;
  }
  children() { return this.bodies; }
  label() { return 'seq'; }
}

export class MWhile extends MExpr {
  constructor(condition, ...bodies) {
    super('MWhile');
    this.condition = condition;
    this.bodies = bodies;
  }
  children() { return [this.condition, ...this.bodies]; }
  label() { return 'while'; }
}

export class MCall extends MExpr {
  constructor(name, ...args) {
    super('MCall');
    this.name = name;
    this.args = args;
  }
  children() { return this.args; }
  label() { return `call ${this.name}`; }
}

export class MAssignment extends MExpr {
  constructor(name, expression) {
    super('MAssignment');
    this.name = name;
    this.expression = expression;
  }
  children() { return [this.expression]; }
  label() { return `${this.name} =`; }
}

export class MInt extends MExpr {
  constructor(value) {
    super('MInt');
    this.value = value;
  }
  children() { return []; }
  label() { return String(this.value); }
}

export class MIdent extends MExpr {
  constructor(name) {
    super('MIdent');
    this.name = name;
  }
  children() { return []; }
  label() { return this.name; }
}

// ヘルパー関数
export function tProgram(functions, ...bodies) {
  return new MProgram(functions, ...bodies);
}
export function tFunction(name, params, body) {
  return new MFunc(name, params, body);
}
export function tAdd(a, b) { return new MBinExpr('+', a, b); }
export function tSub(a, b) { return new MBinExpr('-', a, b); }
export function tMul(a, b) { return new MBinExpr('*', a, b); }
export function tDiv(a, b) { return new MBinExpr('/', a, b); }
export function tLt(a, b) { return new MBinExpr('<', a, b); }
export function tGt(a, b) { return new MBinExpr('>', a, b); }
export function tLte(a, b) { return new MBinExpr('<=', a, b); }
export function tGte(a, b) { return new MBinExpr('>=', a, b); }
export function tEq(a, b) { return new MBinExpr('==', a, b); }
export function tNe(a, b) { return new MBinExpr('!=', a, b); }
export function tInt(value) { return new MInt(value); }
export function tAssign(name, value) { return new MAssignment(name, value); }
export function tId(name) { return new MIdent(name); }
export function tSeq(...expressions) { return new MSeq(...expressions); }
export function tCall(name, ...args) { return new MCall(name, ...args); }
export function tWhile(condition, ...bodies) { return new MWhile(condition, ...bodies); }
export function tIf(condition, thenClause, elseClause) { return new MIf(condition, thenClause, elseClause); }

// JSON配列形式からASTに変換
export function translateToAst(jsonObject) {
  if (Array.isArray(jsonObject)) {
    const operator = jsonObject[0];
    switch (operator) {
      case '+': return tAdd(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
      case '-': return tSub(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
      case '*': return tMul(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
      case '/': return tDiv(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
      case '<': return tLt(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
      case '>': return tGt(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
      case '<=': return tLte(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
      case '>=': return tGte(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
      case '==': return tEq(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
      case '!=': return tNe(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
      case 'seq': return tSeq(...jsonObject.slice(1).map(translateToAst));
      case 'if': return tIf(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]), translateToAst(jsonObject[3]));
      case 'while': return tWhile(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
      case 'assign': return tAssign(jsonObject[1], translateToAst(jsonObject[2]));
      case 'id': return tId(jsonObject[1]);
      case 'call': return tCall(jsonObject[1], ...jsonObject.slice(2).map(translateToAst));
      case 'def': return tFunction(jsonObject[1], jsonObject[2], translateToAst(jsonObject[3]));
    }
  }
  if (typeof jsonObject === 'number') {
    return tInt(jsonObject);
  }
  throw new Error('未対応の形式: ' + JSON.stringify(jsonObject));
}

// ASTをD3ツリー用のデータ構造に変換
export function astToTreeData(node) {
  return {
    name: node.label(),
    _id: node._id,
    _node: node,
    children: node.children().map(astToTreeData),
  };
}
