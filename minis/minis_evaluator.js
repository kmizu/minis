const {MBinExpr, MInt, MSeq, MCall, MAssignment, MIf, MWhile, MIdent} = require('./minis_ast');
const {en} = require("yarn/lib/cli");

function evaluateProgram(program) {
    const environment = {};
    program.functions.forEach(f => {
        environment[f.name] = f;
    });
    let result;
    program.bodies.forEach(body => {
        result = evaluate(body, environment);
    });
    return result;
}

function evaluate(e, env) {
    if(e instanceof MBinExpr) {
        const op = e.op;
        switch(op) {
            case '+':
                return evaluate(e.lhs, env) + evaluate(e.rhs, env);
            case '-':
                return evaluate(e.lhs, env) - evaluate(e.rhs, env);
            case '*':
                return evaluate(e.lhs, env) * evaluate(e.rhs, env);
            case '/':
                return evaluate(e.lhs, env) / evaluate(e.rhs, env);
            case '<':
                return evaluate(e.lhs, env) < evaluate(e.rhs, env) ? 1 : 0;
            case '>':
                return evaluate(e.lhs, env) > evaluate(e.rhs, env) ? 1 : 0;
            case '<=':
                return evaluate(e.lhs, env) <= evaluate(e.rhs, env) ? 1 : 0;
            case '>=':
                return evaluate(e.lhs, env) >= evaluate(e.rhs, env) ? 1 : 0;
            case '==':
                return evaluate(e.lhs, env) === evaluate(e.rhs, env) ? 1 : 0;
            case '!=':
                return evaluate(e.lhs, env) !== evaluate(e.rhs, env) ? 1 : 0;
        }
    } else if(e instanceof MInt){
        return e.value;
    } else if(e instanceof MSeq) {
        let result;
        e.bodies.forEach(e => {
            result = evaluate(e, env);
        });
        return result;
    } else if(e instanceof MCall) {
        const func = env[e.name];
        const args = e.args.map(arg => evaluate(arg, env));
        const newEnvironment = {...env};
        args.forEach((arg, i) => {
            newEnvironment[func.params[i]] = arg;
        });
        return evaluate(func.body, newEnvironment);
    } else if(e instanceof MIf) {
        const condition = evaluate(e.condition, env);
        if (condition !== 0) {
            return evaluate(e.thenClause, env);
        } else {
            return evaluate(e.elseClause, env);
        }
    } else if(e instanceof MWhile) {
        let condition = evaluate(e.condition, env);
        console.log("condition = "+ condition);
        while (condition !== 0) {
            e.bodies.forEach(body => {
                evaluate(body, env);
            });
            condition = evaluate(e.condition, env);
        }
        return null;
    } else if(e instanceof MAssignment) {
        env[e.name]= evaluate(e.expression, env);
        return env[e.name];
    } else if(e instanceof MIdent) {
        return env[e.name];
    } else {
        console.assert(false);
    }
}
module.exports = {evaluate, evaluateProgram};