const {MBinExpr, MInt, MSeq, MCall, MAssignment, MIf, MWhile, MIdent} = require('./minis_ast');
const {evaluate, evaluateProgram} = require("../minis/minis_evaluator");
const {tProgram, tFunction, tAdd, tSub, tMul, tDiv, tInt, tLt, tLte, tGt, tGte, tEq, tNe, tId, tAssign, tSeq, tWhile, tCall, tIf} = require('../minis/minis_ast');

function translateToAst(jsonObject) {
    switch (typeof jsonObject) {
        case "number":
            return tInt(jsonObject);
        case "object":
            const type = jsonObject['type'];
            switch (type) {
                case '+':
                    return tAdd(translateToAst(jsonObject['operands'][0]), translateToAst(jsonObject['operands'][1]));
                case '-':
                    return tSub(translateToAst(jsonObject['operands'][0]), translateToAst(jsonObject['operands'][1]));
                case '*':
                    return tMul(translateToAst(jsonObject['operands'][0]), translateToAst(jsonObject['operands'][1]));
                case '/':
                    return tDiv(translateToAst(jsonObject['operands'][0]), translateToAst(jsonObject['operands'][1]));
                case '<':
                    return tLt(translateToAst(jsonObject['operands'][0]), translateToAst(jsonObject['operands'][1]));
                case '>':
                    return tGt(translateToAst(jsonObject['operands'][0]), translateToAst(jsonObject['operands'][1]));
                case '<=':
                    return tLte(translateToAst(jsonObject['operands'][0]), translateToAst(jsonObject['operands'][1]));
                case '>=':
                    return tGte(translateToAst(jsonObject['operands'][0]), translateToAst(jsonObject['operands'][1]));
                case '==':
                    return tEq(translateToAst(jsonObject['operands'][0]), translateToAst(jsonObject['operands'][1]));
                case '!=':
                    return tNe(translateToAst(jsonObject['operands'][0]), translateToAst(jsonObject['operands'][1]));
                case "if":
                    return tIf(translateToAst(jsonObject['condition']), translateToAst(jsonObject['then']), translateToAst(jsonObject['else']));
                case "seq":
                    return tSeq(...jsonObject['expressions'].map(translateToAst));
                case "while":
                    return tWhile(translateToAst(jsonObject['condition']), translateToAst(jsonObject['body']));
                case "assign":
                    return tAssign(jsonObject['name'], translateToAst(jsonObject['value']));
                case "id":
                    return tId(jsonObject['name']);
                case "call":
                    return tCall(jsonObject['name'], ...jsonObject['args'].map(translateToAst));
            }
    }
    throw new Error("Not implemented for: " + JSON.stringify(jsonObject));
}
function evaluateJson(jsonString) {
    const jsonObject = JSON.parse(jsonString);
    return evaluate(translateToAst(jsonObject), {});
}
function evaluateJsonProgram(jsonString) {
    const program = JSON.parse(jsonString);
    const environment = {};
    const bodies = [];
    const functions = [];
    program.forEach(t => {
        if(t['type'] === "def") {
            functions.push(t);
        } else {
            bodies.push(translateToAst(t));
        }
    });
    functions.forEach(f => {
        environment[f['name']] = tFunction(f['name'], f['params'], translateToAst(f['body']));
    });
    let result;
    bodies.forEach(body => {
        result = evaluate(body, environment);
    });
    return result;
}

module.exports = {evaluateJson, evaluateJsonProgram};
