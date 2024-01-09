class Expr {
    constructor() {
        this.type = 'Expr';
    }
}

function tAdd(a, b) {
    return new BinExpr('+', a, b);
}

function tSub(a, b) {
    return new BinExpr('-', a, b);
}

function tMul(a, b) {
    return new BinExpr('*', a, b);
}

function tDiv(a, b) {
    return new BinExpr('/', a, b);
}

function tInt(value) {
    return new Int(value);
}

class BinExpr extends Expr {
    constructor(op, lhs, rhs) {
        super();
        this.type = 'BinExpr';
        this.operator = op; this.lhs = lhs; this.rhs = rhs;
    }
}

class Int extends Expr {
    constructor(value) {
        super();
        this.type = 'IntegerLiteral';
        this.value = value;
    }
}

module.exports = {BinExpr, Int, tAdd, tSub, tMul, tDiv, tInt};