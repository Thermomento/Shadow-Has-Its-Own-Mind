// 在本目录运行：node verify-level.cjs
// 不加载 p5.js；直接复用游戏的映射、合法性与胜利函数，避免两套规则不一致。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = vm.createContext({});
for (const file of ['i18n.js','level.js', 'sketch.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), context);
}
vm.runInContext("language = 'zh'", context);
const { level, valid, shadow, win } = vm.runInContext(`({
  level: LEVEL,
  valid: (s) => checkState(s.x, s.y, s.mode).valid,
  shadow: getShadowPosition,
  win: (s) => checkWin(s.x, s.y, s.mode)
})`, context);
const key = s => `${s.x},${s.y},${s.mode}`;
const actions = [
  { name: '上', dx: 0, dy: -1 }, { name: '下', dx: 0, dy: 1 },
  { name: '左', dx: -1, dy: 0 }, { name: '右', dx: 1, dy: 0 },
  { name: '空格', switch: true }
];
function nextState(s, action) {
  if (action.switch) return { ...s, mode: s.mode === 'A' ? 'B' : 'A' };
  return { x: s.x + action.dx, y: s.y + action.dy, mode: s.mode };
}

// BFS 每次只扩展一步；访问键包含模式，同一坐标的 A/B 是不同状态。
function bfs(start, isGoal, allowSwitch) {
  if (!valid(start)) return null;
  const queue = [{ state: start, route: [] }];
  const visited = new Set([key(start)]);
  for (let head = 0; head < queue.length; head++) {
    const { state, route } = queue[head];
    if (isGoal(state)) return route;
    for (const action of actions) {
      if (action.switch && !allowSwitch) continue;
      const next = nextState(state, action);
      if (!valid(next) || visited.has(key(next))) continue;
      visited.add(key(next));
      queue.push({ state: next, route: [...route, { action: action.name, state: next }] });
    }
  }
  return null; // 队列耗尽：所有可达状态都检查过，仍没有解。
}

assert.equal(level.cols, 7);
assert.equal(level.rows, 5);
assert(['A', 'B'].includes(level.start.mode));
assert(valid(level.start), '起点必须合法');
assert(!win(level.start), '起点不应已完成');
assert.equal(new Set(level.walls.map(w => `${w.x},${w.y}`)).size, level.walls.length);
for (const cell of [...level.walls, level.playerGoal, level.shadowGoal]) {
  assert(Number.isInteger(cell.x) && Number.isInteger(cell.y));
  assert(cell.x >= 0 && cell.x < 7 && cell.y >= 0 && cell.y < 5);
}
const goalModes = ['A', 'B'].filter(mode => {
  const state = { ...level.playerGoal, mode };
  return valid(state) && win(state);
});
assert(goalModes.length > 0, '目标应符合映射且不在墙内');
const solution = bfs(level.start, win, true);
assert(solution, '关卡必须可解');
const noSwitch = bfs(level.start, win, false);
assert.equal(noSwitch, null, '不能不切换就通关');
// 全程不切换地走到人物目标，仅最后一次切换即获胜，是否可能？
const finalOnly = bfs(level.start, s => {
  if (s.x !== level.playerGoal.x || s.y !== level.playerGoal.y) return false;
  const next = nextState(s, actions[4]);
  return valid(next) && win(next);
}, false);
assert.equal(finalOnly, null, '不能仅在终点切换一次通关');
// 额外排除：起点先切换一次，然后一直走到终点。
const switchedStart = nextState(level.start, actions[4]);
const initialOnly = bfs(switchedStart, win, false);
assert.equal(initialOnly, null, '不能仅在起点切换一次通关');
assert(solution.some((step, i) => step.action === '空格' && i > 0 && i < solution.length - 1));

// 回放实际按键处理器，确认搜索路线也能在游戏中执行并触发完成文字。
const labels = {};
Object.assign(context, {
  LEFT_ARROW: 37, RIGHT_ARROW: 39, UP_ARROW: 38, DOWN_ARROW: 40,
  redraw() {}, clearTimeout() {}, setTimeout() { throw Error('合法路线不应触发墙格计时器'); },
  document: { getElementById(id) { return labels[id] ??= {}; } }
});
const keys = { 上: ['ArrowUp',38], 下: ['ArrowDown',40], 左: ['ArrowLeft',37], 右: ['ArrowRight',39], 空格: [' ',32] };
for (const step of solution) {
  [context.key, context.keyCode] = keys[step.action];
  vm.runInContext('keyPressed({repeat:false})', context);
  assert.equal(vm.runInContext('`${playerX},${playerY},${currentMode}`', context), key(step.state));
}
assert(labels.feedback.textContent.startsWith('完成！'));

const lines = [
  '# 关卡验证结果', '',
  '运行：`node verify-level.cjs`（需要 Node.js，无额外依赖）。', '',
  '状态为 `(人物 x, 人物 y, 模式)`；影子由映射计算。每次移动或切换都算一步。', '',
  `起点：(${level.start.x},${level.start.y}) / ${level.start.mode}，合法。`,
  `人物目标：(${level.playerGoal.x},${level.playerGoal.y})；影子目标：(${level.shadowGoal.x},${level.shadowGoal.y})。`,
  `可获胜模式：${goalModes.join('、')}。`, '',
  '- 可解：是。', '- 完全不切换能通关：否。',
  '- 只在人物终点切换一次能通关：否。', '- 只在起点切换一次能通关：否。',
  '- 搜索解法已通过实际游戏按键逻辑回放，触发完成提示。', '',
  `## 最短解：${solution.length} 次操作`, '',
  '| 步骤 | 操作 | 人物 | 模式 | 影子 |', '| --- | --- | --- | --- | --- |'
];
for (const [i, step] of [{action:'开始',state:level.start}, ...solution].entries()) {
  const s = step.state, sh = shadow(s.x,s.y,s.mode);
  lines.push(`| ${i} | ${step.action} | (${s.x},${s.y}) | ${s.mode} | (${sh.x},${sh.y}) |`);
}
lines.push('', 'BFS 穷尽受限操作下的可达状态，而非只尝试某条路线。两种模式最多共 70 个状态。',
  '这些是程序验证，不是用户试用，也不证明关卡难度或趣味性。修改 level.js 后应重新运行。', '');
fs.writeFileSync(path.join(__dirname, 'level-verification.md'), lines.join('\n'));
console.log(lines.join('\n'));
