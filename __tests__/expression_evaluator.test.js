"use strict";
const {evaluate} = require("../expression/expression_evaluator");
const {tAdd, tSub, tMul, tDiv, tInt} = require('../expression/expression_ast');

test('1 + 1 ==> 2', () => {
    const e = tAdd(tInt(1), tInt(1));
    expect(evaluate(e)).toBe(2);
});

test('1 + 2 + 3 ==> 6', () => {
    const e = tAdd(tInt(1), tAdd(tInt(2), tInt(3)));
    expect(evaluate(e)).toBe(6);
});

test('1 - 1 ==> 0', () => {
    const e = tSub(tInt(1), tInt(1));
    expect(evaluate(e)).toBe(0);
});

test('1 - 2 ==> -1', () => {
    const e = tSub(tInt(1), tInt(2));
    expect(evaluate(e)).toBe(-1);
});

test('1 * 1 == 1', () => {
    const e = tMul(tInt(1), tInt(1));
    expect(evaluate(e)).toBe(1);
});

test('1 * 0 == 0', () => {
    const e = tMul(tInt(1), tInt(0));
    expect(evaluate(e)).toBe(0);
});

test('2 * 2 == 4', () => {
    const e = tMul(tInt(2), tInt(2));
    expect(evaluate(e)).toBe(4);
});

test('0 / 1 == 0', () => {
    const e = tDiv(tInt(0), tInt(1));
    expect(evaluate(e)).toBe(0);
});

test('2 / 1 == 2', () => {
    const e = tDiv(tInt(2), tInt(1));
    expect(evaluate(e)).toBe(2);
});

test('6 / 2 == 3', () => {
    const e = new tDiv(tInt(6), tInt(2));
    expect(evaluate(e)).toBe(3);
});

test('(1 + (2 * 3) - 1) / 2 == 3', () => {
    const e = tDiv(
        tSub(
            tAdd(tInt(1),
                tMul(tInt(2), tInt(3))
            ),
            tInt(1)),
        tInt(2)
    );
    expect(evaluate(e)).toBe(3);
});