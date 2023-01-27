"use strict";
const evaluate = require("../evaluate");
const {tAdd, tSub, tMul, tDiv, tInt} = require('../ast');


test('1 + 1 = 2', () => {
    const expression = new tAdd(tInt(1), tInt(1));
    expect(evaluate(expression)).toBe(2);
});

test('1 - 1 = 0', () => {
const expression = new tSub(tInt(1), tInt(1));
    expect(evaluate(expression)).toBe(0);
});

test('6 / 2 = 3', () => {
const expression = new tDiv(tInt(6), tInt(2));
    expect(evaluate(expression)).toBe(3);
});

test('1 + (2 * 3) = 7', () => {
    const expression = tAdd(tInt(1), tMul(tInt(2), tInt(3)));
    expect(evaluate(expression)).toBe(7);
});
