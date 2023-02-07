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

function tAssign(name, value) {
    return new AssignmentExpression(name, value);
}

function tId(name) {
    return new Identifier(name);
}

function tSequence(...expressions) {
    return new SequenceExpression(...expressions);
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

class SequenceExpression extends Expression {
    constructor(...expressions) {
        super();
        this.type = 'Sequence';
        this.expressions = expressions;
    }
}

class AssignmentExpression extends Expression {
    constructor(name, expression) {
        super();
        this.type = 'Assignment';
        this.name = name;
        this.expression = expression;
    }
}

class IntegerLiteral extends Expression {
    constructor(value) {
        super();
        this.type = 'IntegerLiteral';
        this.value = value;
    }
}

class Identifier extends Expression {
    constructor(name) {
        super();
        this.type = 'Identifier';
        this.name = name;
    }
}

module.exports = {BinaryExpression, IntegerLiteral, SequenceExpression, AssignmentExpression, Identifier, tAdd, tSub, tMul, tDiv, tInt, tSequence, tAssign, tId};