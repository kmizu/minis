"use strict";
const evaluate = require("../minis_evaluator");
const {tAdd, tSub, tMul, tDiv, tInt, tLt, tLte, tGt, tGte, tEq, tId, tAssign, tSequence, tIf} = require('../minis_ast');

test('1 + 1 == 2', () => {
    const expression = new tAdd(tInt(1), tInt(1));
    expect(evaluate(expression, {})).toBe(2);
});

test('1 - 1 == 0', () => {
const expression = new tSub(tInt(1), tInt(1));
    expect(evaluate(expression, {})).toBe(0);
});

test('6 / 2 == 3', () => {
const expression = new tDiv(tInt(6), tInt(2));
    expect(evaluate(expression, {})).toBe(3);
});

test('1 + (2 * 3) == 7', () => {
    const expression = tAdd(tInt(1), tMul(tInt(2), tInt(3)));
    expect(evaluate(expression, {})).toBe(7);
});

test('{a = 100; a} == 100', () => {
    const expression = tSequence(tAssign('a', tInt(100)), tId('a'));
    expect(evaluate(expression, {})).toBe(100);
});

test('{a = 100; b = a + 150; b} == 250', () => {
    const expression = tSequence(
        tAssign('a', tInt(100)),
        tAssign('b', tAdd(tId('a'), tInt(150))),
        tId('b')
    );
    expect(evaluate(expression, {})).toBe(250);
});

test('(if(1 < 2) 2 else 1) == 2', () => {
    const expression = tIf(
        tLt(tInt(1), tInt(2)),
        tInt(2),
        tInt(1),
    );
    expect(evaluate(expression, {})).toBe(2);
});

test('(if(1 > 2) 2 else 1) == 1', () => {
    const expression = tIf(
        tGt(tInt(1), tInt(2)),
        tInt(2),
        tInt(1),
    );
    expect(evaluate(expression, {})).toBe(1);
});

test(`{
    a = 100;
    b = 200;
    if(a < b) {
      500;
    } else {
      1000;
    }
 } == 500`, () => {
    const expression = tSequence(
        tAssign('a', tInt(100)),
        tAssign('b', tInt(200)),
        tIf(tLt(tId('a'), tId('b')), tInt(500), tInt(1000)),
    );
    expect(evaluate(expression, {})).toBe(500);
 });