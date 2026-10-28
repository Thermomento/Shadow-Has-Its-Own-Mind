// 生成器复用游戏的 checkState/checkWin，不维护另一套碰撞规则。
function findLevelSolution(allowSwitch = true, start = LEVEL.start, goal = checkWin) {
  if (!checkState(start.x, start.y, start.mode).valid) return null;
  const queue = [{ ...start, path: [] }];
  const seen = new Set([`${start.x},${start.y},${start.mode}`]);
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head];
    if (goal(state.x, state.y, state.mode)) return state.path;
    const options = [
      { x: state.x, y: state.y - 1, mode: state.mode, action: '上' },
      { x: state.x, y: state.y + 1, mode: state.mode, action: '下' },
      { x: state.x - 1, y: state.y, mode: state.mode, action: '左' },
      { x: state.x + 1, y: state.y, mode: state.mode, action: '右' }
    ];
    if (allowSwitch) options.push({ x: state.x, y: state.y,
      mode: state.mode === 'A' ? 'B' : 'A', action: '空格' });
    for (const next of options) {
      const id = `${next.x},${next.y},${next.mode}`;
      if (seen.has(id) || !checkState(next.x, next.y, next.mode).valid) continue;
      seen.add(id);
      queue.push({ ...next, path: [...state.path, next] });
    }
  }
  return null;
}

function wallSignature(cells) {
  return cells.map(cell => `${cell.x},${cell.y}`).sort().join(';');
}

// 除了可解，也排除不切换、仅起点切换和仅终点切换的捷径。
function isGoodLevel() {
  if (!hasSeparatePositions()) return false;
  const solution = findLevelSolution();
  if (!solution || solution.length < 11) return false;
  if (findLevelSolution(false) !== null) return false;
  const startMode = LEVEL.start.mode === 'A' ? 'B' : 'A';
  if (findLevelSolution(false, { ...LEVEL.start, mode: startMode }) !== null) return false;
  const finalOnly = findLevelSolution(false, LEVEL.start, (x, y, mode) => {
    if (x !== LEVEL.playerGoal.x || y !== LEVEL.playerGoal.y) return false;
    const nextMode = mode === 'A' ? 'B' : 'A';
    return checkState(x, y, nextMode).valid && checkWin(x, y, nextMode);
  });
  return finalOnly === null;
}

// 四个位置在开局必须两两不同；仅开局禁止重叠，游玩中仍可重叠。
function hasSeparatePositions() {
  const start = LEVEL.start;
  const shadow = getShadowPosition(start.x, start.y, start.mode);
  const cells = [start, shadow, LEVEL.playerGoal, LEVEL.shadowGoal];
  return new Set(cells.map(cell => `${cell.x},${cell.y}`)).size === 4;
}

function levelSignature() {
  return JSON.stringify([LEVEL.start, LEVEL.playerGoal, LEVEL.shadowGoal, wallSignature(walls)]);
}

function applyLevel(data) {
  LEVEL.start = { ...data.start };
  LEVEL.playerGoal = { ...data.playerGoal };
  LEVEL.shadowGoal = { ...data.shadowGoal };
  walls.splice(0, walls.length, ...data.walls.map(cell => ({ ...cell })));
}

function generateLevel(previousSignature = '') {
  const cells = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) cells.push({ x, y });
  }
  const pick = () => ({ ...cells[Math.floor(Math.random() * cells.length)] });
  for (let attempt = 0; attempt < 1000; attempt++) {
    LEVEL.start = { ...pick(), mode: Math.random() < 0.5 ? 'A' : 'B' };
    LEVEL.playerGoal = pick();
    // 影子目标也从映射计算，保证目标组合符合至少一种模式。
    const goalMode = LEVEL.start.mode === 'A' ? 'B' : 'A';
    LEVEL.shadowGoal = getShadowPosition(LEVEL.playerGoal.x, LEVEL.playerGoal.y, goalMode);
    if (!hasSeparatePositions()) continue;
    const shadow = getShadowPosition(LEVEL.start.x, LEVEL.start.y, LEVEL.start.mode);
    const protectedCells = [LEVEL.start, shadow, LEVEL.playerGoal, LEVEL.shadowGoal];
    const available = cells.filter(cell => !protectedCells.some(p => p.x === cell.x && p.y === cell.y));
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    walls.splice(0, walls.length, ...available.slice(0, 7));
    if (levelSignature() !== previousSignature && isGoodLevel()) {
      return { signature: levelSignature(), fallback: false };
    }
  }
  // 备用数据也要经过相同检查；达到尝试上限仍能及时显示有解关卡。
  for (const data of RANDOM_FALLBACKS) {
    applyLevel(data);
    if (levelSignature() !== previousSignature && hasSeparatePositions() && isGoodLevel()) {
      return { signature: levelSignature(), fallback: true };
    }
  }
  throw new Error('没有找到符合条件的关卡，请检查备用数据。');
}

function initializeRandomLevel(previousLayout = '') {
  let previous = '';
  // file:// 或隐私设置可能禁用存储；不可用时仍生成有解关卡。
  try { previous = localStorage.getItem('shadow-previous-layout') || ''; } catch (error) {}
  const result = generateLevel(previousLayout || previous);
  playerX = LEVEL.start.x;
  playerY = LEVEL.start.y;
  currentMode = LEVEL.start.mode;
  renderObjective();
  try { localStorage.setItem('shadow-previous-layout', result.signature); } catch (error) {}
  feedbackKey = 'ready';
  feedbackBlockers = [];
  renderFeedback();
}

