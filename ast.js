class Expression {
    constructor() {
        this.type = 'Expression';
    }
}

function tAdd(a, b) {
    return new BinaryExpression('+', a, b);
}

function tSub(a, b) {
    return new BinaryExpression('-', a, b);
}

function tMul(a, b) {
    return new BinaryExpression('*', a, b);
}

function tDiv(a, b) {
    return new BinaryExpression('/', a, b);
}

function tInt(value) {
    return new IntegerLiteral(value);
}

class BinaryExpression extends Expression {
    constructor(operator, lhs, rhs) {
        super();
        this.type = 'BinaryExpression';
        this.operator = operator;
        this.lhs = lhs;
        this.rhs = rhs;
    }
}

class IntegerLiteral extends Expression {
    constructor(value) {
        super();
        this.type = 'IntegerLiteral';
        this.value = value;
    }
}
module.exports = {BinaryExpression, IntegerLiteral, tAdd, tSub, tMul, tDiv, tInt};