const COLS = LEVEL.cols;
const ROWS = LEVEL.rows;
const CELL_SIZE = 80;

// 只保存人物坐标和模式，影子坐标始终临时计算。
let playerX = LEVEL.start.x;
let playerY = LEVEL.start.y;
let currentMode = LEVEL.start.mode;

const walls = LEVEL.walls;
let blockedWalls = []; // 仅用于短暂反馈，不属于人物/模式状态。
let feedbackTimer;


function setup() {
  initializeRandomLevel();
  const canvas = createCanvas(COLS * CELL_SIZE, ROWS * CELL_SIZE);
  canvas.parent('game');
  document.getElementById('reset').addEventListener('click', resetLevel);
  document.getElementById('refresh').addEventListener('click', nextLevel);
  document.getElementById('next').addEventListener('click', nextLevel);
  document.getElementById('language').addEventListener('click', toggleLanguage);
  applyLanguage();
  noLoop(); // 移动或切换模式后才重新绘制。
}

// 独立映射函数：A 左右镜像，B 上下镜像。
function getShadowPosition(x, y, mode) {
  if (mode === 'A') return { x: 6 - x, y: y };
  return { x: x, y: 4 - y };
}

// 小斗篷人物：大兜帽、圆脸、短靴。所有细节都留在当前格内。
function drawCharacter(x, y, color, size) {
  push();
  translate((x + 0.5) * CELL_SIZE, (y + 0.5) * CELL_SIZE);
  scale(size);
  stroke('#f3f1eb');
  strokeWeight(2);
  fill(color);
  ellipse(0, -13, 35, 36); // 宽大的童话兜帽。
  beginShape();
  vertex(-11, 1); vertex(11, 1); vertex(20, 23);
  vertex(9, 26); vertex(-9, 26); vertex(-20, 23);
  endShape(CLOSE);
  noStroke();
  fill('#363738');
  rect(-11, 23, 8, 7, 2);
  rect(3, 23, 8, 7, 2);
  fill('#efe1ce');
  ellipse(0, -10, 22, 21);
  fill('#303238');
  circle(-4, -10, 2.8); circle(4, -10, 2.8);
  fill('#c57b76');
  ellipse(-8, -5, 4, 2); ellipse(8, -5, 4, 2);
  fill('#efe1ce');
  circle(0, 5, 3); circle(0, 12, 2.5); // 斗篷纽扣。
  pop();
}

// 影子仍从映射得到位置，耳尖、眼睛与飘散衣角只是绘图。
function drawShadow(x, y) {
  push();
  translate((x + 0.5) * CELL_SIZE, (y + 0.5) * CELL_SIZE);
  noStroke();
  fill(25, 25, 25, 30);
  ellipse(0, 26, 49, 10);
  for (let layer = 0; layer < 2; layer++) {
    push();
    translate(layer === 0 ? 4 : 0, layer === 0 ? -2 : 0);
    if (layer === 0) fill(25, 25, 25, 40);
    else fill('#252b32');
    // 稍高的尖角兜帽与弯曲衣角，呼应人物但不完全相同。
    beginShape();
    vertex(-15, -18); vertex(-16, -32); vertex(-5, -26);
    vertex(5, -26); vertex(14, -33); vertex(16, -16);
    vertex(11, -3); vertex(15, 10); vertex(21, 23);
    vertex(10, 29); vertex(3, 24); vertex(-5, 29);
    vertex(-18, 26); vertex(-13, 13); vertex(-11, -3);
    endShape(CLOSE);
    ellipse(0, -14, 31, 29);
    pop();
  }
  fill('#e8e5d8');
  ellipse(-5, -14, 3, 4); ellipse(5, -14, 3, 4);
  // 稀疏半调点，只在影子衣角内，不遮住脸部和目标。
  fill(225, 225, 215, 45);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) circle(-7 + col * 7, 10 + row * 5, 1.5);
  }
  pop();
}

// Web Animations 仅用于提示，不驱动游戏状态；减少动态效果时跳过。
function playModeFeedback() {
  const axis = document.getElementById('mirror-axis');
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof axis.animate === 'function') {
    axis.animate([{ opacity: 0 }, { opacity: 0.8, offset: 0.2 }, { opacity: 0 }],
      { duration: 700, easing: 'ease-out' });
  }
}

function drawGoal(cell, isPlayer) {
  const x = cell.x * CELL_SIZE;
  const y = cell.y * CELL_SIZE;
  push();
  // 目标改为小屋门/月镜插画；其格子和判定仍使用原目标坐标。
  noStroke();
  if (isPlayer) {
    fill('#c7b5a3');
    rect(x + 17, y + 29, 46, 34, 2);
    fill('#893f43');
    beginShape();
    vertex(x + 12, y + 31); vertex(x + 40, y + 8); vertex(x + 68, y + 31);
    endShape(CLOSE);
    fill('#543e43');
    rect(x + 31, y + 33, 19, 30, 7, 7, 0, 0);
    fill('#efe1b6');
    circle(x + 44, y + 48, 3);
    rect(x + 21, y + 37, 7, 9, 1);
    stroke('#ece0c5'); strokeWeight(1);
    line(x + 24, y + 37, x + 24, y + 46);
    noStroke();
    fill('#bcae98');
    rect(x + 27, y + 63, 27, 3);
  } else {
    fill('#c6c8c1');
    ellipse(x + 40, y + 64, 44, 6);
    fill('#515663');
    rect(x + 36, y + 49, 8, 14);
    rect(x + 26, y + 61, 28, 4, 2);
    fill('#454954');
    ellipse(x + 40, y + 33, 40, 52);
    fill('#a6b8b9');
    ellipse(x + 40, y + 33, 31, 43);
    fill('#f0ebcd');
    ellipse(x + 38, y + 28, 17, 23);
    fill('#a6b8b9');
    ellipse(x + 43, y + 25, 17, 23);
    stroke('#e9eee3'); strokeWeight(1);
    line(x + 28, y + 40, x + 33, y + 35);
    line(x + 46, y + 46, x + 51, y + 41);
    noStroke();
  }
  fill(isPlayer ? '#893f43' : '#343b49');
  textAlign(CENTER, CENTER);
  textSize(9);
  text(t(isPlayer ? 'playerGoal' : 'shadowGoal'), x + 40, y + 74);
  pop();
}

function draw() {
  background('#e7e6e0');
  stroke('#c4c3be');
  strokeWeight(1);
  noFill();
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
  // 墙像叠起的纸块；拒绝操作时用同一个强调色标记。
  noStroke();
  for (const wall of walls) {
    const highlighted = blockedWalls.some(cell => cell.x === wall.x && cell.y === wall.y);
    fill('#c7c6c1');
    rect(wall.x * CELL_SIZE + 10, wall.y * CELL_SIZE + 11, 64, 64);
    fill(highlighted ? '#9e3437' : '#555651');
    rect(wall.x * CELL_SIZE + 6, wall.y * CELL_SIZE + 6, 64, 64);
    stroke(highlighted ? '#be7777' : '#777872');
    strokeWeight(1);
    for (let offset = 10; offset < 62; offset += 9) {
      line(wall.x * CELL_SIZE + 10, wall.y * CELL_SIZE + offset,
        wall.x * CELL_SIZE + offset, wall.y * CELL_SIZE + 10);
    }
    noStroke();
    if (highlighted) {
      fill('#fffaf0');
      textAlign(CENTER, CENTER);
      textSize(24);
      text('×', wall.x * CELL_SIZE + 38, wall.y * CELL_SIZE + 38);
    }
  }
  drawGoal(LEVEL.playerGoal, true);
  drawGoal(LEVEL.shadowGoal, false);
  const shadow = getShadowPosition(playerX, playerY, currentMode);
  drawShadow(shadow.x, shadow.y);
  drawCharacter(playerX, playerY, '#9e3437', 0.83);

  document.getElementById('position').textContent =
    `${t('player')} (${playerX}, ${playerY}) · ${t('shadow')} (${shadow.x}, ${shadow.y})`;
  document.getElementById('mode').textContent =
    `${t('mode')} ${currentMode} · ${t(currentMode)}`;
  document.getElementById('mapping').textContent = currentMode === 'A'
    ? `${t('shadow')} = (6 − x, y)` : `${t('shadow')} = (x, 4 − y)`;
  document.getElementById('mirror-axis').setAttribute('data-mode', currentMode);
  const won = checkWin();
  document.getElementById('victory').hidden = !won;
  document.getElementById('game').setAttribute('aria-label', won ? t('complete') : t('board'));
}

// 重置只恢复当前关卡，保留已生成的墙壁和目标。
function resetLevel() {
  clearTimeout(feedbackTimer);
  blockedWalls = [];
  playerX = LEVEL.start.x;
  playerY = LEVEL.start.y;
  currentMode = LEVEL.start.mode;
  showFeedback('resetMessage', []);
  // 避免按钮保留焦点时，空格同时触发按钮和模式切换。
  document.getElementById('reset').blur();
}

// 刷新关卡与继续下一关使用同一入口，清除旧关的反馈定时器。
function nextLevel() {
  clearTimeout(feedbackTimer);
  blockedWalls = [];
  initializeRandomLevel(levelSignature());
  redraw();
  const active = document.activeElement;
  if (active && active.tagName === 'BUTTON') active.blur();
}

// 统一检查完整候选状态，返回合法性及每个被阻挡角色的原因。
// 不在这里修改人物位置或模式。
function checkState(x, y, mode) {
  const shadow = getShadowPosition(x, y, mode);
  const blockers = [];
  const characters = [
    { name: '人物', x: x, y: y },
    { name: '影子', x: shadow.x, y: shadow.y }
  ];
  for (const character of characters) {
    if (character.x < 0 || character.x >= COLS || character.y < 0 || character.y >= ROWS) {
      blockers.push({ name: character.name, reason: '越界', cell: null });
    } else if (walls.some(wall => wall.x === character.x && wall.y === character.y)) {
      blockers.push({ name: character.name, reason: '被墙阻挡', cell: { x: character.x, y: character.y } });
    }
  }
  return { valid: blockers.length === 0, blockers: blockers };
}

// 只有人物、影子同时到达各自目标才算完成。
function checkWin(x = playerX, y = playerY, mode = currentMode) {
  const shadow = getShadowPosition(x, y, mode);
  return x === LEVEL.playerGoal.x && y === LEVEL.playerGoal.y &&
    shadow.x === LEVEL.shadowGoal.x && shadow.y === LEVEL.shadowGoal.y;
}

// 清除旧定时器，避免快速连续操作时旧回调清掉新的标记。
function showFeedback(messageKey, cells, blockers = []) {
  clearTimeout(feedbackTimer);
  blockedWalls = cells;
  feedbackKey = messageKey;
  feedbackBlockers = blockers;
  renderFeedback();
  redraw();
  if (cells.length > 0) {
    feedbackTimer = setTimeout(() => {
      blockedWalls = [];
      redraw();
    }, 900);
  }
}

function keyPressed(event) {
  if (event.target && event.target.tagName === 'BUTTON') return;
  const pressedKey = key.toLowerCase();
  let nextX = playerX;
  let nextY = playerY;
  let nextMode = currentMode;

  if (keyCode === LEFT_ARROW || pressedKey === 'a') nextX--;
  else if (keyCode === RIGHT_ARROW || pressedKey === 'd') nextX++;
  else if (keyCode === UP_ARROW || pressedKey === 'w') nextY--;
  else if (keyCode === DOWN_ARROW || pressedKey === 's') nextY++;
  else if (pressedKey === ' ') nextMode = currentMode === 'A' ? 'B' : 'A';
  else return;

  // 长按时忽略重复事件，空格也只切换一次。
  if (event.repeat) return false;
  // 完成面板显示期间保留终局，等待下一关或重置。
  if (checkWin()) return false;
  // 移动和切换共用同一检查：整个候选状态合法才提交。
  const result = checkState(nextX, nextY, nextMode);
  if (result.valid) {
    playerX = nextX;
    playerY = nextY;
    const modeChanged = currentMode !== nextMode;
    currentMode = nextMode;
    if (modeChanged) playModeFeedback();
    showFeedback(checkWin() ? 'win' : (pressedKey === ' ' ? 'switch' : 'move'), []);
  } else {
    const cells = result.blockers.filter(blocker => blocker.cell).map(blocker => blocker.cell);
    showFeedback('blocked', cells, result.blockers);
  }
  return false; // 阻止方向键和空格滚动页面。
}
