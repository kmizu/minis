class MExpression {
    constructor() {
        this.type = 'Expression';
    }
}

class MBinaryExpression extends MExpression {
    constructor(operator, lhs, rhs) {
        super();
        this.type = 'MBinaryExpression';
        this.operator = operator;
        this.lhs = lhs;
        this.rhs = rhs;
    }
}

class MIfExpression extends MExpression {
    constructor(condition, thenClause, elseClause) {
        super();
        this.type = 'MIfExpression';
        this.condition = condition;
        this.thenClause = thenClause;
        this.elseClause = elseClause;
    }
}

class MSequenceExpression extends MExpression {
    constructor(...expressions) {
        super();
        this.type = 'MSequence';
        this.expressions = expressions;
    }
}

class MAssignmentExpression extends MExpression {
    constructor(name, expression) {
        super();
        this.type = 'MAssignment';
        this.name = name;
        this.expression = expression;
    }
}

class MIntegerLiteral extends MExpression {
    constructor(value) {
        super();
        this.type = 'MIntegerLiteral';
        this.value = value;
    }
}

class MIdentifier extends MExpression {
    constructor(name) {
        super();
        this.type = 'MIdentifier';
        this.name = name;
    }
}

function tAdd(a, b) {
    return new MBinaryExpression('+', a, b);
}

function tSub(a, b) {
    return new MBinaryExpression('-', a, b);
}

function tMul(a, b) {
    return new MBinaryExpression('*', a, b);
}

function tDiv(a, b) {
    return new MBinaryExpression('/', a, b);
}

function tLt(a, b) {
    return new MBinaryExpression('<', a, b);
}

function tGt(a, b) {
    return new MBinaryExpression('>', a, b);
}

function tLte(a, b) {
    return new MBinaryExpression('<=', a, b);
}

function tGte(a, b) {
    return new MBinaryExpression('>=', a, b);
}

function tEq(a, b) {
    return new MBinaryExpression('==', a, b);
}

function tInt(value) {
    return new MIntegerLiteral(value);
}

function tAssign(name, value) {
    return new MAssignmentExpression(name, value);
}

function tId(name) {
    return new MIdentifier(name);
}

function tSequence(...expressions) {
    return new MSequenceExpression(...expressions);
}

function tIf(condition, thenClause, elseClause) {
    return new MIfExpression(condition, thenClause, elseClause);
}

module.exports = {
    MBinaryExpression, MIntegerLiteral, MSequenceExpression, MIfExpression, MAssignmentExpression, MIdentifier,
    tAdd, tSub, tMul, tDiv, tInt,
    tLt, tGt, tLte, tGte, tEq,
    tSequence, tIf,
    tAssign, tId
};
