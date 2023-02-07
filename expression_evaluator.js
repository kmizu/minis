const {BinaryExpression, IntegerLiteral, SequenceExpression, AssignmentExpression, Identifier} = require('./expression_ast');
const {en} = require("yarn/lib/cli");
function expression_evaluator(expression, environment) {
    if(expression instanceof BinaryExpression) {
        const operator = expression.operator;
        switch(operator) {
            case '+':
                return expression_evaluator(expression.lhs, environment) + expression_evaluator(expression.rhs, environment);
            case '-':
                return expression_evaluator(expression.lhs, environment) - expression_evaluator(expression.rhs, environment);
            case '*':
                return expression_evaluator(expression.lhs, environment) * expression_evaluator(expression.rhs, environment);
            case '/':
                return expression_evaluator(expression.lhs, environment) / expression_evaluator(expression.rhs, environment);
        }
    } else if(expression instanceof IntegerLiteral){
        return expression.value;
    } else if(expression instanceof SequenceExpression) {
        let result;
        expression.expressions.forEach(e => {
            result = expression_evaluator(e, environment);
        });
        return result;
    } else if(expression instanceof AssignmentExpression) {
        environment[expression.name]= expression_evaluator(expression.expression, environment);
        return environment[expression.name];
    } else if(expression instanceof Identifier) {
        return environment[expression.name];
    } else {
        console.assert(false);
    }
}
module.exports = expression_evaluator;