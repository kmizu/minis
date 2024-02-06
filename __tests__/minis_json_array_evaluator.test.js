"use strict";
const {evaluateJsonArray} = require("../minis/minis_json_array_evaluator");

test(`1 ==> 1` ,() => {
    const e = `1`;
    expect(evaluateJsonArray(e)).toBe(1);
});

test(`1 + 2 ==> 3`, () => {
    const e = `["+", 1, 2]`;
    expect(evaluateJsonArray(e)).toBe(3);
})

test(`1 - 2 ==> -1`, () => {
    const e = `["-", 1, 2]`;
    expect(evaluateJsonArray(e)).toBe(-1);
})

test(`2 * 2 ==> 4`, () => {
    const e = `["*", 2, 2]`;
    expect(evaluateJsonArray(e)).toBe(4);
})

test(`2 / 2 ==> 1`, () => {
    const e = `["/", 2, 2]`;
    expect(evaluateJsonArray(e)).toBe(1);
})

test(`1 < 2 ==> 1`, () => {
    const e = `["<", 1, 2]`;
    expect(evaluateJsonArray(e)).toBe(1);
})

test(`1 > 2 ==> 0`, () => {
    const e = `[">", 1, 2]`;
    expect(evaluateJsonArray(e)).toBe(0);
})

test(`1 <= 2 ==> 1`, () => {
    const e = `["<=", 1, 2]`;
    expect(evaluateJsonArray(e)).toBe(1);
})

test(`1 >= 2 ==> 0`, () => {
    const e = `[">=", 1, 2]`;
    expect(evaluateJsonArray(e)).toBe(0);
})

test(`1 == 1 ==> 1`, () => {
    const e = `["==", 1, 1]`;
    expect(evaluateJsonArray(e)).toBe(1);
})

test(`1 != 1 ==> 0`, () => {
    const e = `["!=", 1, 1]`;
    expect(evaluateJsonArray(e)).toBe(0);
})

test(`if(1) then 1 else 2 ==> 1`, () => {
    const e = `["if", 1, 1, 2]`;
    expect(evaluateJsonArray(e)).toBe(1);
})

test(`{1; 2; 3} ==> 3`, () => {
    const e = `["seq", 1, 2, 3]`;
    expect(evaluateJsonArray(e)).toBe(3);
})

test(`
    i = 0;
    while(i < 10) {
      i = i + 1;
    }
    i
 ==> 10`, () => {
    const e = `[
        "seq", 
        ["assign", "i", 0], 
        ["while", 
            ["<", ["id", "i"], 10], 
            ["assign", "i", ["+", ["id", "i"], 1]]], 
        ["id", "i"]
    ]`;
    expect(evaluateJsonArray(e)).toBe(10);
})