"use strict";
const {evaluateJsonArray, evaluateJsonProgram} = require("../minis/minis_json_array_evaluator");
const {tProgram, tFunction, tAdd, tId, tCall, tInt} = require("../minis/minis_ast");

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

test(`
    def add(a, b) {
        return a + b;
    },
    add(1, 2)
==> 3`, () => {
    const program = `[
        ["def", "add", ["a", "b"], ["+", ["id", "a"], ["id", "b"]]],
        ["call", "add", 1, 2]
    ]`;
    expect(evaluateJsonProgram(program)).toBe(3);
});

test(`
    def factorial(n) {
        if(n == 0) {
            return 1;
        } else {
            return n * factorial(n - 1);
        }
    },
    factorial(5)
==> 120`, () => {
    const program = `[
        ["def", "factorial", ["n"], 
            ["if", ["==", ["id", "n"], 0], 
                1, 
                ["*", ["id", "n"], ["call", "factorial", ["-", ["id", "n"], 1]]]
            ]
        ],
        ["call", "factorial", 5]
    ]`;
    expect(evaluateJsonProgram(program)).toBe(120);
});