// ステップ追跡付きインタプリタ（generator版）
import {
  MBinExpr, MInt, MSeq, MCall, MAssignment, MIf, MWhile, MIdent,
  MProgram, MFunc
} from './ast.js';

// 通常の評価関数（スライドのコード例と一致）
export function evaluate(e, env) {
  if (e instanceof MBinExpr) {
    const lhs = evaluate(e.lhs, env);
    const rhs = evaluate(e.rhs, env);
    return applyOp(e.op, lhs, rhs);
  } else if (e instanceof MSeq) {
    let result;
    e.bodies.forEach(body => { result = evaluate(body, env); });
    return result;
  } else if (e instanceof MIf) {
    const condition = evaluate(e.condition, env);
    if (condition !== 0) {
      return evaluate(e.thenClause, env);
    } else {
      return evaluate(e.elseClause, env);
    }
  } else if (e instanceof MWhile) {
    let condition = evaluate(e.condition, env);
    let iter = 0;
    while (condition !== 0) {
      if (++iter > MAX_ITERATIONS) throw new Error(`whileループが${MAX_ITERATIONS}回を超えました（無限ループ？）`);
      e.bodies.forEach(body => { evaluate(body, env); });
      condition = evaluate(e.condition, env);
    }
    return 0;
  } else if (e instanceof MAssignment) {
    env[e.name] = evaluate(e.expression, env);
    return env[e.name];
  } else if (e instanceof MIdent) {
    if (!(e.name in env)) throw new Error(`未定義の変数: ${e.name}`);
    return env[e.name];
  } else if (e instanceof MCall) {
    const func = env[e.name];
    const args = e.args.map(arg => evaluate(arg, env));
    const newEnv = { ...env };
    args.forEach((arg, i) => { newEnv[func.params[i]] = arg; });
    return evaluate(func.body, newEnv);
  } else if (e instanceof MInt) {
    return e.value;
  }
}

export function evaluateProgram(program) {
  const env = {};
  program.functions.forEach(f => { env[f.name] = f; });
  let result;
  program.bodies.forEach(body => { result = evaluate(body, env); });
  return result;
}

function applyOp(op, lhs, rhs) {
  switch (op) {
    case '+': return lhs + rhs;
    case '-': return lhs - rhs;
    case '*': return lhs * rhs;
    case '/': {
      if (rhs === 0) throw new Error('0で割ることはできません');
      return Math.trunc(lhs / rhs);
    }
    case '<': return lhs < rhs ? 1 : 0;
    case '>': return lhs > rhs ? 1 : 0;
    case '<=': return lhs <= rhs ? 1 : 0;
    case '>=': return lhs >= rhs ? 1 : 0;
    case '==': return lhs === rhs ? 1 : 0;
    case '!=': return lhs !== rhs ? 1 : 0;
  }
}

const MAX_ITERATIONS = 10000;

function envVarsOnly(env) {
  const vars = {};
  for (const key in env) {
    if (!(env[key] instanceof MFunc)) {
      vars[key] = env[key];
    }
  }
  return vars;
}

// generator版: 各ステップをyieldする
// step = { nodeId, action: "enter"|"exit"|"env-write", value?, env, description }
export function* evaluateSteps(e, env) {
  if (e instanceof MBinExpr) {
    yield { nodeId: e._id, action: 'enter', env: envVarsOnly(env), description: `${e.op} を評価開始` };
    const lhs = yield* evaluateSteps(e.lhs, env);
    const rhs = yield* evaluateSteps(e.rhs, env);
    const result = applyOp(e.op, lhs, rhs);
    yield { nodeId: e._id, action: 'exit', value: result, env: envVarsOnly(env), description: `${lhs} ${e.op} ${rhs} = ${result}` };
    return result;

  } else if (e instanceof MSeq) {
    yield { nodeId: e._id, action: 'enter', env: envVarsOnly(env), description: '連接を評価開始' };
    let result;
    for (const body of e.bodies) {
      result = yield* evaluateSteps(body, env);
    }
    yield { nodeId: e._id, action: 'exit', value: result, env: envVarsOnly(env), description: `連接の結果: ${result}` };
    return result;

  } else if (e instanceof MIf) {
    yield { nodeId: e._id, action: 'enter', env: envVarsOnly(env), description: 'if式を評価開始' };
    const condition = yield* evaluateSteps(e.condition, env);
    let result;
    if (condition !== 0) {
      yield { nodeId: e._id, action: 'enter', env: envVarsOnly(env), description: `条件 = ${condition} (真) → then節へ` };
      result = yield* evaluateSteps(e.thenClause, env);
    } else {
      yield { nodeId: e._id, action: 'enter', env: envVarsOnly(env), description: `条件 = ${condition} (偽) → else節へ` };
      result = yield* evaluateSteps(e.elseClause, env);
    }
    yield { nodeId: e._id, action: 'exit', value: result, env: envVarsOnly(env), description: `if式の結果: ${result}` };
    return result;

  } else if (e instanceof MWhile) {
    yield { nodeId: e._id, action: 'enter', env: envVarsOnly(env), description: 'while式を評価開始' };
    let iteration = 0;
    let condition = yield* evaluateSteps(e.condition, env);
    while (condition !== 0) {
      iteration++;
      if (iteration > MAX_ITERATIONS) throw new Error(`whileループが${MAX_ITERATIONS}回を超えました（無限ループ？）`);
      yield { nodeId: e._id, action: 'enter', env: envVarsOnly(env), description: `while: ${iteration}回目のループ` };
      for (const body of e.bodies) {
        yield* evaluateSteps(body, env);
      }
      condition = yield* evaluateSteps(e.condition, env);
    }
    yield { nodeId: e._id, action: 'exit', value: 0, env: envVarsOnly(env), description: `while終了 (${iteration}回ループ)` };
    return 0;

  } else if (e instanceof MAssignment) {
    yield { nodeId: e._id, action: 'enter', env: envVarsOnly(env), description: `${e.name} への代入を評価` };
    const val = yield* evaluateSteps(e.expression, env);
    env[e.name] = val;
    yield { nodeId: e._id, action: 'env-write', name: e.name, value: val, env: envVarsOnly(env), description: `${e.name} = ${val}` };
    yield { nodeId: e._id, action: 'exit', value: val, env: envVarsOnly(env), description: `代入完了: ${e.name} = ${val}` };
    return val;

  } else if (e instanceof MIdent) {
    if (!(e.name in env)) throw new Error(`未定義の変数: ${e.name}`);
    const val = env[e.name];
    yield { nodeId: e._id, action: 'enter', env: envVarsOnly(env), description: `変数 ${e.name} を参照` };
    yield { nodeId: e._id, action: 'exit', value: val, env: envVarsOnly(env), description: `${e.name} → ${val}` };
    return val;

  } else if (e instanceof MCall) {
    yield { nodeId: e._id, action: 'enter', env: envVarsOnly(env), description: `関数 ${e.name} を呼び出し` };
    const func = env[e.name];
    const args = [];
    for (const arg of e.args) {
      args.push(yield* evaluateSteps(arg, env));
    }
    const newEnv = { ...env };
    args.forEach((arg, i) => { newEnv[func.params[i]] = arg; });
    yield { nodeId: e._id, action: 'enter', env: envVarsOnly(newEnv), description: `${e.name}(${args.join(', ')}) → 関数本体を評価` };
    const result = yield* evaluateSteps(func.body, newEnv);
    yield { nodeId: e._id, action: 'exit', value: result, env: envVarsOnly(env), description: `${e.name} の結果: ${result}` };
    return result;

  } else if (e instanceof MInt) {
    yield { nodeId: e._id, action: 'enter', env: envVarsOnly(env), description: `整数 ${e.value}` };
    yield { nodeId: e._id, action: 'exit', value: e.value, env: envVarsOnly(env), description: `→ ${e.value}` };
    return e.value;
  }
}

// プログラム全体のステップ評価
export function* evaluateProgramSteps(program) {
  const env = {};
  program.functions.forEach(f => { env[f.name] = f; });
  let result;
  for (const body of program.bodies) {
    result = yield* evaluateSteps(body, env);
  }
  return result;
}
