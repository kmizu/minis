import {
  tAdd, tSub, tMul, tDiv, tInt,
  tLt, tEq,
  tAssign, tId, tSeq, tIf, tWhile,
  tCall, tFunction, tProgram
} from './ast.js';

export const examples = [
  {
    name: '数式: 1 + 2 * 3',
    build() {
      return tAdd(tInt(1), tMul(tInt(2), tInt(3)));
    },
    isProgram: false,
  },
  {
    name: '数式: (1 + (2 * 3) - 1) / 2',
    build() {
      return tDiv(
        tSub(
          tAdd(tInt(1), tMul(tInt(2), tInt(3))),
          tInt(1)
        ),
        tInt(2)
      );
    },
    isProgram: false,
  },
  {
    name: 'Minis: 変数代入 {a = 100; a}',
    build() {
      return tSeq(tAssign('a', tInt(100)), tId('a'));
    },
    isProgram: false,
  },
  {
    name: 'Minis: if式',
    build() {
      return tIf(tLt(tInt(1), tInt(2)), tInt(3), tInt(4));
    },
    isProgram: false,
  },
  {
    name: 'Minis: whileループ (i < 10)',
    build() {
      return tProgram(
        [],
        tAssign('i', tInt(0)),
        tWhile(
          tLt(tId('i'), tInt(10)),
          tAssign('i', tAdd(tId('i'), tInt(1)))
        ),
        tId('i')
      );
    },
    isProgram: true,
  },
  {
    name: 'Minis: 関数呼び出し add(1, 2)',
    build() {
      return tProgram(
        [tFunction('add', ['a', 'b'], tAdd(tId('a'), tId('b')))],
        tCall('add', tInt(1), tInt(2))
      );
    },
    isProgram: true,
  },
  {
    name: 'Minis: 再帰 factorial(5)',
    build() {
      return tProgram(
        [tFunction('factorial', ['n'],
          tIf(
            tEq(tId('n'), tInt(0)),
            tInt(1),
            tMul(tId('n'), tCall('factorial', tSub(tId('n'), tInt(1))))
          )
        )],
        tCall('factorial', tInt(5))
      );
    },
    isProgram: true,
  },
];
