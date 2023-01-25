class Expression {
    constructor() {
        this.type = 'Expression';
    }
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
module.exports = {BinaryExpression, IntegerLiteral};