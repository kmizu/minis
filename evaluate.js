const {BinaryExpression, IntegerLiteral, SequenceExpression, AssignmentExpression, Identifier} = require('./ast');
function evaluate(expression, environment) {
    if(expression instanceof BinaryExpression) {
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
        }
    } else if(expression instanceof IntegerLiteral){
        return expression.value;
    } else if(expression instanceof SequenceExpression) {
        let result;
        expression.expressions.forEach(e => {
            result = evaluate(e, environment);
        });
        return result;
    } else if(expression instanceof AssignmentExpression) {
        environment[expression.name]= evaluate(expression.expression, environment);
        return environment[expression.name];
    } else if(expression instanceof Identifier) {
        return environment[expression.name];
    } else {
        console.assert(false);
    }
}
module.exports = evaluate;