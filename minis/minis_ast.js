class MAST {
    constructor(type) {
        this.type = type;
    }
}
class MExpr extends MAST {
    constructor(type) {
        super(type);
    }
}

class MProgram extends MAST {
    constructor(functions, ...bodies) {
        super('MProgram');
        this.functions = functions;
        this.bodies = bodies;
    }
}

class MFunc extends MAST {
    constructor(name, params, body) {
        super('MFunc');
        this.name = name;
        this.params = params;
        this.body = body;
    }
}

class MBinExpr extends MExpr {
    constructor(op, lhs, rhs) {
        super('MBinExpr');
        this.op = op;
        this.lhs = lhs;
        this.rhs = rhs;
    }
}

class MIf extends MExpr {
    constructor(condition, thenClause, elseClause) {
        super('MIf');
        this.condition = condition;
        this.thenClause = thenClause;
        this.elseClause = elseClause;
    }
}

class MSeq extends MExpr {
    constructor(...bodies) {
        super('MSeq');
        this.bodies = bodies;
    }
}

class MWhile extends MExpr {
    constructor(condition, ...bodies) {
        super('MWhile');
        this.condition = condition;
        this.bodies = bodies;
    }
}

class MCall extends MExpr {
    constructor(name, ...args) {
        super('MCall');
        this.name = name;
        this.args = args;
    }
}

class MAssignment extends MExpr {
    constructor(name, expression) {
        super('MAssignment');
        this.name = name;
        this.expression = expression;
    }
}

class MInt extends MExpr {
    constructor(value) {
        super('MInt');
        this.value = value;
    }
}

class MIdent extends MExpr {
    constructor(name) {
        super('MIdent');
        this.name = name;
    }
}

function tProgram(functions, ...bodies) {
    return new MProgram(functions, ...bodies);
}

function tFunction(name, params, body) {
    return new MFunc(name, params, body);
}

function tAdd(a, b) {
    return new MBinExpr('+', a, b);
}

function tSub(a, b) {
    return new MBinExpr('-', a, b);
}

function tMul(a, b) {
    return new MBinExpr('*', a, b);
}

function tDiv(a, b) {
    return new MBinExpr('/', a, b);
}

function tLt(a, b) {
    return new MBinExpr('<', a, b);
}

function tGt(a, b) {
    return new MBinExpr('>', a, b);
}

function tLte(a, b) {
    return new MBinExpr('<=', a, b);
}

function tGte(a, b) {
    return new MBinExpr('>=', a, b);
}

function tEq(a, b) {
    return new MBinExpr('==', a, b);
}

function tNe(a, b) {
    return new MBinExpr('!=', a, b);
}

function tInt(value) {
    return new MInt(value);
}

function tAssign(name, value) {
    return new MAssignment(name, value);
}

function tId(name) {
    return new MIdent(name);
}

function tSeq(...expressions) {
    return new MSeq(...expressions);
}

function tCall(name, ...args) {
    return new MCall(name, ...args);
}

function tWhile(condition, ...bodies) {
    return new MWhile(condition, ...bodies);
}

function tIf(condition, thenClause, elseClause) {
    return new MIf(condition, thenClause, elseClause);
}

module.exports = {
    MBinExpr, MInt, MSeq, MIf, MWhile, MAssignment, MCall, MIdent,
    tProgram, tFunction,
    tAdd, tSub, tMul, tDiv, tInt,
    tLt, tGt, tLte, tGte, tEq, tNe,
    tSequence: tSeq, tIf, tWhile,
    tCall, tAssign, tId
};