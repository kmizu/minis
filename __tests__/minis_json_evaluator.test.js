"use strict";
const {evaluateJson} = require("../minis/minis_json_evaluator");

test(`evaluateJson("1") == 1` ,() => {
    const e = `1`;
    expect(evaluateJson(e)).toBe(1);
});

test(`evaluateJson("{"type": "+", "operands": [1, 2]}") == 3`, () => {
    const e = `{"type": "+", "operands": [1, 2]}`;
    expect(evaluateJson(e)).toBe(3);
})

test(`evaluateJson("{"type": "-", "operands": [1, 2]}") == -1`, () => {
    const e = `{"type": "-", "operands": [1, 2]}`;
    expect(evaluateJson(e)).toBe(-1);
})

test(`evaluateJson("{"type": "*", "operands": [2, 2]}") == 4`, () => {
    const e = `{"type": "*", "operands": [2, 2]}`;
    expect(evaluateJson(e)).toBe(4);
})

test(`evaluateJson("{"type": "/", "operands": [2, 2]}") == 1`, () => {
    const e = `{"type": "/", "operands": [2, 2]}`;
    expect(evaluateJson(e)).toBe(1);
})

test(`1 < 2 == 1`, () => {
    const e = `{"type": "<", "operands": [1, 2]}`;
    expect(evaluateJson(e)).toBe(1);
})

test(`1 > 2 == 0`, () => {
    const e = `{"type": ">", "operands": [1, 2]}`;
    expect(evaluateJson(e)).toBe(0);
})

test(`1 <= 2 == 1`, () => {
    const e = `{"type": "<=", "operands": [1, 2]}`;
    expect(evaluateJson(e)).toBe(1);
})

test(`1 >= 2 == 0`, () => {
    const e = `{"type": ">=", "operands": [1, 2]}`;
    expect(evaluateJson(e)).toBe(0);
})

test(`1 == 1 == 1`, () => {
    const e = `{"type": "==", "operands": [1, 1]}`;
    expect(evaluateJson(e)).toBe(1);
})

test(`1 != 1 == 0`, () => {
    const e = `{"type": "!=", "operands": [1, 1]}`;
    expect(evaluateJson(e)).toBe(0);
})

test(`
    evaluateJson("{"type": "if", "condition": 1, "then": 1, "else": 2}") == 1
`, () => {
    const e = `{"type": "if", "condition": 1, "then": 1, "else": 2}`;
    expect(evaluateJson(e)).toBe(1);
})

test(`
    evaluateJson("{"type": "seq", "expressions": [1, 2, 3]}") == 3
`, () => {
    const e = `{"type": "seq", "expressions": [1, 2, 3]}`;
    expect(evaluateJson(e)).toBe(3);
})

test(`
    i = 0;
    while(i < 10) {
      i = i + 1;
    }
    i
 == 10`, () => {
    const e = `{
      "type": "seq",
      "expressions": [
        {"type": "assign", "name": "x", "value": 1},
        {"type": "while", 
            "condition": {"type": "<", "operands": [{"type": "id", "name": "x"}, 10]},
            "body": {"type": "seq", "expressions": [
                {"type": "assign", "name": "x", "value": {"type": "+", "operands": [{"type": "id", "name": "x"}, 1]}}
            ]}
        },
        {"type": "id", "name": "x"}
      ]
    }`;
    expect(evaluateJson(e)).toBe(10);
})