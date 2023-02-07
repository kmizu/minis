const {MBinaryExpression, MIntegerLiteral, MSequenceExpression, MAssignmentExpression, MIfExpression, MIdentifier} = require('./minis_ast');
const {en} = require("yarn/lib/cli");
function evaluate(expression, environment) {
    if(expression instanceof MBinaryExpression) {
        const operator = expression.operator;
        switch(operator) {
            case '+':
                return evaluate(expression.lhs, environment) + evaluate(expression.rhs, environment);
            case '-':
                return evaluate(expression.lhs, environment) - evaluate(expression.rhs, environment);
            case '*':
                return evaluate(expression.lhs, environment) * evaluate(expression.rhs, environment);
            case '/':
                return evaluate(expression.lhs, environment) / evaluate(expression.rhs, environment);
            case '<':
                return evaluate(expression.lhs, environment) < evaluate(expression.rhs, environment) ? 1 : 0;
            case '>':
                return evaluate(expression.lhs, environment) > evaluate(expression.rhs, environment) ? 1 : 0;
            case '<=':
                return evaluate(expression.lhs, environment) <= evaluate(expression.rhs, environment) ? 1 : 0;
            case '>=':
                return evaluate(expression.lhs, environment) >= evaluate(expression.rhs, environment) ? 1 : 0;
            case '==':
                return evaluate(expression.lhs, environment) === evaluate(expression.rhs, environment) ? 1 : 0;
        }
    } else if(expression instanceof MIntegerLiteral){
        return expression.value;
    } else if(expression instanceof MSequenceExpression) {
        let result;
        expression.expressions.forEach(e => {
            result = evaluate(e, environment);
        });
        return result;
    } else if(expression instanceof MIfExpression) {
        const condition = evaluate(expression.condition, environment);
        if(condition !== 0) {
            return evaluate(expression.thenClause, environment);
        } else {
            return evaluate(expression.elseClause, environment);
        }
    } else if(expression instanceof MAssignmentExpression) {
        environment[expression.name]= evaluate(expression.expression, environment);
        return environment[expression.name];
    } else if(expression instanceof MIdentifier) {
        return environment[expression.name];
    } else {
        console.assert(false);
    }
}
module.exports = evaluate;