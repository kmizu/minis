const {MBinExpr, MInt, MSeq, MCall, MAssignment, MIf, MWhile, MIdent} = require('./minis_ast');
const {evaluate, evaluateProgram} = require("../minis/minis_evaluator");
const {tProgram, tFunction, tAdd, tSub, tMul, tDiv, tInt, tLt, tLte, tGt, tGte, tEq, tNe, tId, tAssign, tSeq, tWhile, tCall, tIf} = require('../minis/minis_ast');
function translateToAst(jsonObject) {
    if(Array.isArray(jsonObject)) {
        const operator = jsonObject[0];
        switch(operator) {
            case "+":
                return tAdd(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
            case "-":
                return tSub(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
            case "*":
                return tMul(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
            case "/":
                return tDiv(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
            case "<":
                return tLt(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
            case ">":
                return tGt(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
            case "<=":
                return tLte(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
            case ">=":
                return tGte(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
            case "==":
                return tEq(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
            case "!=":
                return tNe(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
            case "seq":
                return tSeq(...jsonObject.slice(1).map(translateToAst));
            case "if":
                return tIf(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]), translateToAst(jsonObject[3]));
            case "while":
                return tWhile(translateToAst(jsonObject[1]), translateToAst(jsonObject[2]));
            case "assign":
                return tAssign(jsonObject[1], translateToAst(jsonObject[2]));
            case "id":
                return tId(jsonObject[1]);
            case "call":
                return tCall(jsonObject[1], ...jsonObject.slice(2).map(translateToAst));
        }
    }
    switch (typeof jsonObject) {
        case "number":
            return tInt(jsonObject);
    }
    throw new Error("Not implemented for: " + JSON.stringify(jsonObject));
}
function evaluateJsonArray(jsonString) {
    const jsonObject = JSON.parse(jsonString);
    return evaluate(translateToAst(jsonObject), {});
}
function evaluateJsonProgram(jsonString) {
    const program = JSON.parse(jsonString);
    const environment = {};
    const bodies = [];
    const functions = [];
    program.forEach(t => {
        if(t[0] === "def") {
            functions.push(t);
        } else {
            bodies.push(translateToAst(t));
        }
    });
    functions.forEach(f => {
        environment[f[1]] = tFunction(f[1], f[2], translateToAst(f[3]));
    });
    let result;
    bodies.forEach(body => {
        result = evaluate(body, environment);
    });
    return result;
}
module.exports = {evaluateJsonArray, evaluateJsonProgram};