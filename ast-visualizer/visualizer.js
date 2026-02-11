import { astToTreeData, resetNodeId, translateToAst, MProgram, MBinExpr, MCall } from './ast.js';
import { evaluateSteps, evaluateProgramSteps } from './evaluator.js';
import { examples } from './examples.js';
import { parse } from './parser.js';

// --- 定数 ---
const NODE_WIDTH = 100;
const NODE_HEIGHT = 36;
const MARGIN = { top: 40, right: 40, bottom: 40, left: 40 };

// --- 状態 ---
let currentAst = null;
let currentTreeData = null;
let currentGenerator = null;
let stepHistory = [];
let nodeStates = {};  // nodeId -> "default" | "active" | "done" | "env-write"
let nodeValues = {};  // nodeId -> 表示する結果値
let isAutoPlaying = false;
let autoTimer = null;
let stepCount = 0;
let finalResult = null;
let isFinished = false;
let reduceMode = true;
let lastInputSource = 'preset'; // 'preset' | 'json' | 'expr'

// --- DOM要素 ---
const selectEl = document.getElementById('example-select');
const btnStep = document.getElementById('btn-step');
const btnAuto = document.getElementById('btn-auto');
const btnReset = document.getElementById('btn-reset');
const btnRun = document.getElementById('btn-run');
const speedEl = document.getElementById('speed');
const speedValueEl = document.getElementById('speed-value');
const reduceToggleEl = document.getElementById('reduce-toggle');
const stepDescEl = document.getElementById('step-description');
const stepCountEl = document.getElementById('step-count');
const resultValueEl = document.getElementById('result-value');
const envTableBody = document.querySelector('#env-table tbody');
const envEmptyEl = document.getElementById('env-empty');
const jsonInputEl = document.getElementById('json-input');
const btnParseJson = document.getElementById('btn-parse-json');
const jsonErrorEl = document.getElementById('json-error');
const exprInputEl = document.getElementById('expr-input');
const btnParseExpr = document.getElementById('btn-parse-expr');
const exprErrorEl = document.getElementById('expr-error');
const svgEl = document.getElementById('ast-svg');

// --- プリセット選択肢を作成 ---
examples.forEach((ex, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = ex.name;
  selectEl.appendChild(opt);
});

// --- イベントリスナー ---
selectEl.addEventListener('change', () => {
  const idx = parseInt(selectEl.value);
  const ex = examples[idx];
  resetNodeId();
  const ast = ex.build();
  lastInputSource = 'preset';
  loadAst(ast, ex.isProgram);
});

btnStep.addEventListener('click', () => doStep());
btnAuto.addEventListener('click', toggleAuto);
btnReset.addEventListener('click', resetExecution);
btnRun.addEventListener('click', runToEnd);

speedEl.addEventListener('input', () => {
  speedValueEl.textContent = speedEl.value + 'ms';
});

reduceToggleEl.addEventListener('change', () => {
  reduceMode = reduceToggleEl.checked;
  renderTree();
});

btnParseJson.addEventListener('click', () => {
  jsonErrorEl.textContent = '';
  try {
    const jsonStr = jsonInputEl.value.trim();
    const parsed = JSON.parse(jsonStr);
    resetNodeId();
    const ast = translateToAst(parsed);
    lastInputSource = 'json';
    loadAst(ast, false);
  } catch (e) {
    jsonErrorEl.textContent = 'エラー: ' + e.message;
  }
});

btnParseExpr.addEventListener('click', parseExprInput);

exprInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    parseExprInput();
  }
});

function parseExprInput() {
  exprErrorEl.textContent = '';
  try {
    const input = exprInputEl.value.trim();
    resetNodeId();
    const ast = parse(input);
    lastInputSource = 'expr';
    loadAst(ast, false);
  } catch (e) {
    exprErrorEl.textContent = 'エラー: ' + e.message;
  }
}

// --- メイン処理 ---

function loadAst(ast, isProgram) {
  stopAuto();
  currentAst = ast;

  // ツリーデータ生成
  currentTreeData = astToTreeData(ast);

  // generator作成
  if (isProgram) {
    currentGenerator = evaluateProgramSteps(ast);
  } else {
    currentGenerator = evaluateSteps(ast, {});
  }

  // 状態リセット
  nodeStates = {};
  nodeValues = {};
  stepHistory = [];
  stepCount = 0;
  finalResult = null;
  isFinished = false;

  // 全ノードをdefaultに
  resetAllNodeStates(currentTreeData);

  // 描画
  renderTree();
  updateEnvPanel({});
  stepDescEl.textContent = 'Stepボタンで1ステップずつ評価を進めます';
  stepCountEl.textContent = '';
  resultValueEl.textContent = '';
  btnStep.disabled = false;
  btnAuto.disabled = false;
  btnRun.disabled = false;
}

function resetAllNodeStates(node) {
  if (!node) return;
  nodeStates[node._id] = 'default';
  if (node.children) {
    node.children.forEach(c => resetAllNodeStates(c));
  }
}

function doStep(skipRender) {
  if (!currentGenerator || isFinished) return;

  let result;
  try {
    result = currentGenerator.next();
  } catch (err) {
    isFinished = true;
    stopAuto();
    btnStep.disabled = true;
    btnAuto.disabled = true;
    btnRun.disabled = true;
    stepDescEl.textContent = 'エラー: ' + err.message;
    resultValueEl.textContent = '';
    resultValueEl.style.color = '#e94560';
    renderTree();
    return;
  }

  if (result.done) {
    isFinished = true;
    finalResult = result.value;
    stopAuto();
    btnStep.disabled = true;
    btnAuto.disabled = true;
    btnRun.disabled = true;
    resultValueEl.textContent = `最終結果: ${finalResult}`;
    stepDescEl.textContent = '評価完了';
    if (!skipRender) renderTree();
    return;
  }

  const step = result.value;
  stepCount++;
  stepHistory.push(step);

  // 前のactiveノードをdoneに
  Object.keys(nodeStates).forEach(id => {
    if (nodeStates[id] === 'active' || nodeStates[id] === 'env-write') {
      nodeStates[id] = 'done';
    }
  });

  // 現在のノード状態を更新
  if (step.action === 'exit') {
    nodeStates[step.nodeId] = 'done';
    if (step.value !== undefined) {
      nodeValues[step.nodeId] = step.value;
    }
  } else if (step.action === 'env-write') {
    nodeStates[step.nodeId] = 'env-write';
  } else {
    nodeStates[step.nodeId] = 'active';
  }

  // UI更新
  stepDescEl.textContent = step.description || '';
  stepCountEl.textContent = `ステップ: ${stepCount}`;
  updateEnvPanel(step.env);
  if (!skipRender) renderTree();
}

function toggleAuto() {
  if (isAutoPlaying) {
    stopAuto();
  } else {
    startAuto();
  }
}

function startAuto() {
  if (isFinished) return;
  isAutoPlaying = true;
  btnAuto.textContent = 'Stop';
  btnAuto.style.background = '#e94560';
  btnStep.disabled = true;
  btnRun.disabled = true;

  function tick() {
    if (!isAutoPlaying || isFinished) {
      stopAuto();
      return;
    }
    doStep();
    if (!isFinished) {
      autoTimer = setTimeout(tick, parseInt(speedEl.value));
    }
  }
  tick();
}

function stopAuto() {
  isAutoPlaying = false;
  if (autoTimer) {
    clearTimeout(autoTimer);
    autoTimer = null;
  }
  btnAuto.textContent = 'Auto';
  btnAuto.style.background = '';
  if (!isFinished) {
    btnStep.disabled = false;
    btnRun.disabled = false;
  }
}

function runToEnd() {
  // 途中の描画をスキップして高速実行
  while (!isFinished) {
    doStep(true);
  }
  renderTree();
}

function resetExecution() {
  if (!currentAst) return;

  if (lastInputSource === 'preset') {
    const idx = parseInt(selectEl.value);
    if (!isNaN(idx) && examples[idx]) {
      resetNodeId();
      const ast = examples[idx].build();
      loadAst(ast, examples[idx].isProgram);
    }
  } else if (lastInputSource === 'expr') {
    try {
      const input = exprInputEl.value.trim();
      if (input) {
        resetNodeId();
        const ast = parse(input);
        loadAst(ast, false);
      }
    } catch (e) {
      exprErrorEl.textContent = 'エラー: ' + e.message;
    }
  } else if (lastInputSource === 'json') {
    try {
      const jsonStr = jsonInputEl.value.trim();
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        resetNodeId();
        const ast = translateToAst(parsed);
        loadAst(ast, false);
      }
    } catch (e) {
      jsonErrorEl.textContent = 'エラー: ' + e.message;
    }
  }
}

// --- 環境パネル更新 ---

let prevEnv = {};

function updateEnvPanel(env) {
  envTableBody.innerHTML = '';
  const keys = Object.keys(env);

  if (keys.length === 0) {
    envEmptyEl.style.display = '';
    return;
  }
  envEmptyEl.style.display = 'none';

  keys.forEach(key => {
    const tr = document.createElement('tr');
    if (prevEnv[key] !== env[key]) {
      tr.classList.add('changed');
    }
    const tdName = document.createElement('td');
    tdName.textContent = key;
    const tdVal = document.createElement('td');
    tdVal.textContent = env[key];
    tr.appendChild(tdName);
    tr.appendChild(tdVal);
    envTableBody.appendChild(tr);
  });

  prevEnv = { ...env };
}

// --- 簡約（木の畳み込み） ---

function isCollapsible(nodeType) {
  return nodeType === 'MBinExpr' || nodeType === 'MCall';
}

function allChildrenDone(node) {
  if (!node.children || node.children.length === 0) return true;
  return node.children.every(child =>
    nodeStates[child._id] === 'done' && allChildrenDone(child)
  );
}

function deepCopyTree(node) {
  return {
    name: node.name,
    _id: node._id,
    _node: node._node,
    _collapsed: false,
    children: node.children ? node.children.map(deepCopyTree) : [],
  };
}

function collapseTree(node) {
  if (!node) return node;

  // 子を先に処理
  if (node.children) {
    node.children = node.children.map(collapseTree);
  }

  // このノードが簡約対象か判定
  const state = nodeStates[node._id];
  const value = nodeValues[node._id];
  const nodeType = node._node ? node._node.type : '';

  if (
    state === 'done' &&
    value !== undefined &&
    isCollapsible(nodeType) &&
    node.children &&
    node.children.length > 0 &&
    allChildrenDone(node)
  ) {
    // 子を消して値ノードに簡約
    node.children = [];
    node.name = `→ ${value}`;
    node._collapsed = true;
  }

  return node;
}

// --- D3.js ツリー描画 ---

function renderTree() {
  if (!currentTreeData) return;

  // SVGクリア
  d3.select(svgEl).selectAll('*').remove();

  // 簡約モードの場合はコピーして簡約
  let treeData = currentTreeData;
  if (reduceMode) {
    treeData = collapseTree(deepCopyTree(currentTreeData));
  }

  // D3 hierarchy生成
  const root = d3.hierarchy(treeData);

  // ツリーレイアウト
  const treeLayout = d3.tree()
    .nodeSize([NODE_WIDTH + 20, NODE_HEIGHT + 40]);

  treeLayout(root);

  // 範囲計算
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  root.each(d => {
    if (d.x < minX) minX = d.x;
    if (d.x > maxX) maxX = d.x;
    if (d.y < minY) minY = d.y;
    if (d.y > maxY) maxY = d.y;
  });

  const width = (maxX - minX) + NODE_WIDTH + MARGIN.left + MARGIN.right;
  const height = (maxY - minY) + NODE_HEIGHT + MARGIN.top + MARGIN.bottom;

  svgEl.setAttribute('width', width);
  svgEl.setAttribute('height', height);

  const g = d3.select(svgEl)
    .append('g')
    .attr('transform', `translate(${-minX + MARGIN.left + NODE_WIDTH / 2}, ${MARGIN.top})`);

  // リンク描画（状態に応じたクラス付与）
  g.selectAll('.link')
    .data(root.links())
    .join('path')
    .attr('class', d => {
      const sourceState = nodeStates[d.source.data._id] || 'default';
      const targetState = nodeStates[d.target.data._id] || 'default';
      if (sourceState === 'active' || targetState === 'active') return 'link-active';
      if (sourceState === 'done' && targetState === 'done') return 'link-done';
      return 'link';
    })
    .attr('d', d => {
      return `M${d.source.x},${d.source.y + NODE_HEIGHT / 2}
              C${d.source.x},${(d.source.y + d.target.y) / 2}
               ${d.target.x},${(d.source.y + d.target.y) / 2}
               ${d.target.x},${d.target.y - NODE_HEIGHT / 2}`;
    });

  // ノード描画
  const nodes = g.selectAll('.node')
    .data(root.descendants())
    .join('g')
    .attr('class', d => {
      if (d.data._collapsed) return 'node node-collapsed';
      const state = nodeStates[d.data._id] || 'default';
      return `node node-${state}`;
    })
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  // ノードの矩形
  nodes.append('rect')
    .attr('x', -NODE_WIDTH / 2)
    .attr('y', -NODE_HEIGHT / 2)
    .attr('width', NODE_WIDTH)
    .attr('height', NODE_HEIGHT);

  // ノードのラベル
  nodes.append('text')
    .attr('class', 'label')
    .attr('y', d => {
      if (d.data._collapsed) return 0;
      const val = nodeValues[d.data._id];
      return val !== undefined ? -4 : 0;
    })
    .text(d => {
      const label = d.data.name;
      return label.length > 12 ? label.substring(0, 11) + '…' : label;
    });

  // 結果値の表示（簡約されてないノードのみ）
  nodes.each(function (d) {
    if (d.data._collapsed) return;
    const val = nodeValues[d.data._id];
    if (val !== undefined) {
      d3.select(this).append('text')
        .attr('class', 'value-label')
        .attr('y', 10)
        .text(`→ ${val}`);
    }
  });
}

// --- キーボードショートカット ---
document.addEventListener('keydown', (e) => {
  // テキスト入力中は無視
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

  switch (e.key) {
    case ' ':
    case 'ArrowRight':
      e.preventDefault();
      doStep();
      break;
    case 'a':
      e.preventDefault();
      toggleAuto();
      break;
    case 'r':
      e.preventDefault();
      resetExecution();
      break;
  }
});

// --- 初期表示 ---
selectEl.value = '0';
selectEl.dispatchEvent(new Event('change'));
