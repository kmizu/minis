const {MBinExpr, MInt, MSeq, MCall, MAssignment, MIf, MWhile, MIdent} = require('./minis_ast');
const {evaluate, evaluateProgram} = require("../minis/minis_evaluator");
const {tProgram, tFunction, tAdd, tSub, tMul, tDiv, tInt, tLt, tLte, tGt, tGte, tEq, tNe, tId, tAssign, tSeq, tWhile, tCall, tIf} = require('../minis/minis_ast');
function evaluateJsonArray(jsonString) {
    const jsonObject = JSON.parse(jsonString);
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
            }
        }
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
                }
        }
        throw new Error("Not implemented for: " + JSON.stringify(jsonObject));
    }
    return evaluate(translateToAst(jsonObject), {});
}
module.exports = {evaluateJsonArray};