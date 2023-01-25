"use strict";
const evaluate = require("../evaluate");
const {BinaryExpression, IntegerLiteral} = require('../ast');

test('1 + 1 = 2', () => {
    const expression = new BinaryExpression('+', new IntegerLiteral(1), new IntegerLiteral(1));
    expect(evaluate(expression)).toBe(2);
});

test('1 + (2 * 3) = 7', () => {
    const expression = new BinaryExpression('+',
        new IntegerLiteral(1),
        new BinaryExpression(
            '*',
            new IntegerLiteral(2),
            new IntegerLiteral(3)
        )
    )
    expect(evaluate(expression)).toBe(7);
});
