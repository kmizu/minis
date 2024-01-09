# MiniS

MiniSはJavaScriptで実装されたトイプログラミング言語です。

最低限のプログラミング言語処理系作成を学ぶことに特化しており、以下の特徴があります。

- 構文解析器を持たない
  - 構文解析は煩雑なので初学者のモチベーションを削ぐ
- 単純な式ベースの言語である
  - 数式
  - 比較
  - 代入
  - 連接
  - 条件分岐
  - 繰り返し
- 関数定義

# 数式

数式は以下のように書きます。

```minis
tAdd(1, 2) // 1 + 2
tSub(1, 2) // 1 - 2
tMul(1, 2) // 1 * 2
tDiv(1, 2) // 1 / 2
```

# 比較式

比較式は以下のように書きます。

```minis
tEq(1, 2) // 1 == 2
tNe(1, 2) // 1 != 2
tLt(1, 2) // 1 < 2
tLe(1, 2) // 1 <= 2
tGt(1, 2) // 1 > 2
tGe(1, 2) // 1 >= 2
```

# 代入式

代入式は次のように書きます

```minis
tAssign("x", 1) // x = 1
```

# 連接式

連接式は次のように書きます

```minis
tSequence(tAssign("x", 1), tAssign("y", 2)) // x = 1; y = 2
```

# 条件分岐式

条件分岐式は次のように書きます

```minis
tIf(tEq(1, 2), tAssign("x", 1), tAssign("x", 2)) // if (1 == 2) { x = 1 } else { x = 2 }
```

# 繰り返し式

繰り返し式は次のように書きます

```minis
tSequence(
    tAssign("x", 0),
    tWhile(tLt("x", 10), tAssign("x", tAdd("x", 1))),
    tId("x")
) // x = 0; while (x < 10) { x = x + 1 }; x
```

# 関数定義

関数定義は次のように書きます

```minis
tProgram(
  tFunction("add", ["x", "y"], tAdd("x", "y")),
  tCall("add", 1, 2)
) // function add(x, y) { x + y }; add(1, 2)