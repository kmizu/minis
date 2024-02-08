const {BinExpr, Int} = require('./expression_ast');
const {evaluate} = require('./expression_evaluator');
function translateToAst(json) {
    if(typeof(json) === 'number') {
        return new Int(json);
    } else if(Array.isArray(json)) {
        const op = json[0];
        const lhs = translateToAst(json[1]);
        const rhs = translateToAst(json[2]);
        return new BinExpr(op, lhs, rhs);
    } else {
        throw new Error("Not implemented for: " + JSON.stringify(json));
    }
}
function evaluateJson(jsonString) {
    const e = JSON.parse(jsonString);
    const ast = translateToAst(e);
    return evaluate(ast);
}
module.exports = {evaluateJson};