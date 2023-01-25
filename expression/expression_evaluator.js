const {BinExpr, Int} = require('./expression_ast');
const {en} = require("yarn/lib/cli");
function evaluate(expr) {
    if(expr instanceof BinExpr) {
        const op = expr.operator;
        switch(op) {
            case '+': return evaluate(expr.lhs) + evaluate(expr.rhs);
            case '-': return evaluate(expr.lhs) - evaluate(expr.rhs);
            case '*': return evaluate(expr.lhs) * evaluate(expr.rhs);
            case '/': return evaluate(expr.lhs) / evaluate(expr.rhs);
        }
    } else if(expr instanceof Int){ return expr.value;
    } else { console.assert(false); }
}
module.exports = {evaluate};