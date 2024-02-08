"use strict";
const {evaluateJson} = require("../expression/expression_json_evaluator");

test('1 + 1 ==> 2', () => {
    const e =  `["+", 1, 1]`;
    expect(evaluateJson(e)).toBe(2);
});

test('1 + 2 + 3 ==> 7', () => {
    const e = `["+", 1, ["+", 2, 3]]`;
    expect(evaluateJson(e)).toBe(6);
});

test('1 - 1 ==> 0', () => {
    const e = `["-", 1, 1]`;
    expect(evaluateJson(e)).toBe(0);
});

test('1 - 2 ==> -1', () => {
    const e = `["-", 1, 2]`;
    expect(evaluateJson(e)).toBe(-1);
});

test('1 * 1 ==> 1', () => {
    const e = `["*", 1, 1]`;
    expect(evaluateJson(e)).toBe(1);
});

test('1 * 0 ==> 0', () => {
    const e = `["*", 1, 0]`;
    expect(evaluateJson(e)).toBe(0);
});

test('2 * 2 ==> 4', () => {
    const e = `["*", 2, 2]`;
    expect(evaluateJson(e)).toBe(4);
});

test('0 / 1 ==> 0', () => {
    const e = `["/", 0, 1]`;
    expect(evaluateJson(e)).toBe(0);
});

test('2 / 1 ==> 2', () => {
    const e = `["/", 2, 1]`;
    expect(evaluateJson(e)).toBe(2);
});

test('6 / 2 ==> 3', () => {
    const e = `["/", 6, 2]`;
    expect(evaluateJson(e)).toBe(3);
});

test('(1 + (2 * 3) - 1) / 2 == 3', () => {
    const e =
        `["/", 
            ["-", 
                ["+", 1, ["*", 2, 3]], 
                1], 
            2]`
    expect(evaluateJson(e)).toBe(3);
});