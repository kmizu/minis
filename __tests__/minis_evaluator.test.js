"use strict";
const {evaluate, evaluateProgram} = require("../minis/minis_evaluator");
const {tProgram, tFunction, tAdd, tSub, tMul, tDiv, tInt, tLt, tLte, tGt, tGte, tEq, tNe, tId, tAssign, tSeq, tWhile, tCall, tIf} = require('../minis/minis_ast');

test('1 + 1 == 2', () => {
    const e = tAdd(tInt(1), tInt(1));
    expect(evaluate(e)).toBe(2);
});

test('1 + 2 + 3 == 7', () => {
    const e = tAdd(tInt(1), tInt(1));
    expect(evaluate(e)).toBe(2);
});

test('1 - 1 == 0', () => {
    const e = tSub(tInt(1), tInt(1));
    expect(evaluate(e)).toBe(0);
});

test('1 - 2 == 0', () => {
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

test('1 < 2 == 1', () => {
    const e = tLt(tInt(1), tInt(2));
    expect(evaluate(e)).toBe(1);
});

test('2 > 1 == 1', () => {
    const e = tGt(tInt(2), tInt(1));
    expect(evaluate(e)).toBe(1);
});

test('1 <= 1 == 1', () => {
    const e = tLte(tInt(1), tInt(1));
    expect(evaluate(e)).toBe(1);
});

test('1 >= 1 == 1', () => {
    const e = tGte(tInt(1), tInt(1));
    expect(evaluate(e)).toBe(1);
});

test('1 == 1 == 1', () => {
    const e = tEq(tInt(1), tInt(1));
    expect(evaluate(e)).toBe(1);
});

test('1 != 0 == 1', () => {
    const e = tNe(tInt(1), tInt(0));
    expect(evaluate(e)).toBe(1);
});

test('{a = 100; a} == 100', () => {
    const e= tSeq(tAssign('a', tInt(100)), tId('a'));
    expect(evaluate(e, {})).toBe(100);
});

test('{a = 100; b = a + 1; b} == 101', () => {
    const expression = tSeq(
        tAssign('a', tInt(100)),
        tAssign('b', tAdd(tId('a'), tInt(1))),
        tId('b')
    );
    expect(evaluate(expression, {})).toBe(101);
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
    const expression = tSeq(
        tAssign('a', tInt(100)),
        tAssign('b', tInt(200)),
        tIf(tLt(tId('a'), tId('b')), tInt(500), tInt(1000)),
    );
    expect(evaluate(expression, {})).toBe(500);
 });

test(`
    function add(a, b) {
        return a + b;
    },
    add(1, 2)
== 3`, () => {
    const program = tProgram(
        [tFunction('add', ['a', 'b'], tAdd(tId('a'), tId('b')))],
        tCall('add', tInt(1), tInt(2))
    );
    expect(evaluateProgram(program)).toBe(3);
});

test(`
    i = 0;
    while(i < 10) {
        i = i + 1;
    };
    i
} == 10`, () => {
    const program = tProgram(
        [],
        tAssign('i', tInt(0)),
        tWhile(tLt(tId('i'), tInt(10)), tAssign('i', tAdd(tId('i'), tInt(1)))),
        tId('i')
    );
    expect(evaluateProgram(program)).toBe(10);
});