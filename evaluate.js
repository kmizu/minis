const {BinaryExpression, IntegerLiteral} = require('./ast');
function evaluate(expression) {
    if(expression instanceof BinaryExpression) {
        const operator = expression.operator;
        switch(operator) {
            case '+':
                return evaluate(expression.lhs) + evaluate(expression.rhs);
            case '-':
                return evaluate(expression.lhs) - evaluate(expression.rhs);
            case '*':
                return evaluate(expression.lhs) * evaluate(expression.rhs);
            case '/':
                return evaluate(expression.lhs) / evaluate(expression.rhs);
        }
    } else if(expression instanceof IntegerLiteral){
        return expression.value;
    } else {
        console.assert(false);
    }
}
module.exports = evaluate;