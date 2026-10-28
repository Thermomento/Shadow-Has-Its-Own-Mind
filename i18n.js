// 默认英文；字典同时供 HTML、画布和动态反馈使用，不改变游戏状态。
let language = 'en';
let feedbackKey = 'ready';
let feedbackBlockers = [];
const TRANSLATIONS = {
  "zh": {
    "archive": "ANOMALY RECORD / 异常影像档案",
    "tag": "故事 07 / 两个小小的灵魂<br>最后一盏灯熄灭之后",
    "intro": "最后一盏灯熄灭之后，一个小小的影子还在等待。穿过镜像，让这两个小小的灵魂各自归家。",
    "verified": "RECORD VERIFIED / 记录确认",
    "synced": "同步完成。",
    "victoryText": "人物与影子已同时归位。<br>本次异常已记录，下一份档案等待开启。",
    "next": "继续下一关 →",
    "reset": "↺ 重置本关",
    "refresh": "⟳ 刷新关卡",
    "cast": "棋盘上的你",
    "personLegend": "● 暗红人物 / 实体",
    "shadowLegend": "◒ 黑色影子 / 投影",
    "playerLegend": "⌂ 小屋门：人物目标",
    "shadowGoalLegend": "☾ 月镜：影子目标",
    "wallLegend": "斜线障碍：墙壁",
    "controls": "操作",
    "moveHelp": "<kbd>↑ ↓ ← →</kbd><br>或 <kbd>W A S D</kbd> 移动一格",
    "switchHelp": "<kbd>空格</kbd> 切换镜像模式",
    "blockedHelp": "碰墙时保留原状态，对应墙格短暂标记 ×。",
    "footer": "THE SHADOW HAS ITS OWN MIND · 7 × 5<br>重置保留本关 · 刷新关卡更换谜题 · 加载 p5.js 需要联网",
    "playerGoal": "小屋门",
    "shadowGoal": "月镜",
    "player": "人物",
    "shadow": "影子",
    "mode": "模式",
    "A": "左右镜像 ↔",
    "B": "上下镜像 ↕",
    "board": "7 列 5 行的镜影调查棋盘",
    "complete": "关卡完成",
    "ready": "新关卡已通过可解性检查。途中需要切换模式。",
    "resetMessage": "当前关卡已重置。试试另一条路线。",
    "move": "移动成功。",
    "switch": "模式已切换。",
    "win": "完成！人物和影子同时到达各自目标。",
    "wall": "被墙阻挡",
    "boundary": "越界",
    "rejected": "操作被拒绝：",
    "unchanged": "位置和模式保持不变。",
    "objective": "让人物到达 {p}，影子同时到达 {s}。"
  },
  "en": {
    "archive": "ANOMALY RECORD / SHADOW ARCHIVE",
    "tag": "STORY 07 / TWO LITTLE SOULS<br>AFTER THE LAST LIGHT",
    "intro": "Beyond the last lantern, a little shadow waits. Guide these two small souls through the mirrors and safely home.",
    "verified": "RECORD VERIFIED",
    "synced": "Synchronization complete.",
    "victoryText": "Both figures have reached their destinations.<br>This anomaly is recorded. Another file awaits.",
    "next": "Next puzzle →",
    "reset": "↺ Reset puzzle",
    "refresh": "⟳ New puzzle",
    "cast": "Subjects",
    "personLegend": "● Red figure / Player",
    "shadowLegend": "◒ Black silhouette / Shadow",
    "playerLegend": "⌂ Cottage door: player goal",
    "shadowGoalLegend": "☾ Moon mirror: shadow goal",
    "wallLegend": "Hatched blocks: walls",
    "controls": "Controls",
    "moveHelp": "<kbd>↑ ↓ ← →</kbd><br>or <kbd>W A S D</kbd> to move one cell",
    "switchHelp": "<kbd>Space</kbd> to switch mirror mode",
    "blockedHelp": "Blocked actions leave the state unchanged. The wall briefly shows ×.",
    "footer": "THE SHADOW HAS ITS OWN MIND · 7 × 5<br>Reset keeps this puzzle · New puzzle changes the layout · Internet required for p5.js",
    "playerGoal": "Home",
    "shadowGoal": "Moon mirror",
    "player": "Player",
    "shadow": "Shadow",
    "mode": "Mode",
    "A": "Horizontal mirror ↔",
    "B": "Vertical mirror ↕",
    "board": "7 by 5 shadow puzzle board",
    "complete": "Puzzle complete",
    "ready": "New puzzle verified solvable. Switch modes along the way.",
    "resetMessage": "Puzzle reset. Try another route.",
    "move": "Moved one cell.",
    "switch": "Mirror mode switched.",
    "win": "Complete! Both figures have reached their goals.",
    "wall": "blocked by a wall",
    "boundary": "outside the board",
    "rejected": "Action rejected: ",
    "unchanged": "Position and mode are unchanged.",
    "objective": "Bring the player to {p} and the shadow to {s} at the same time."
  }
};
function t(key) { return TRANSLATIONS[language][key] || key; }

function renderFeedback() {
  let message = t(feedbackKey);
  if (feedbackKey === 'blocked') {
    const details = feedbackBlockers.map(blocker => {
      const name = t(blocker.name === '人物' ? 'player' : 'shadow');
      const reason = t(blocker.cell ? 'wall' : 'boundary');
      return `${name} ${reason}` + (blocker.cell ? ` (${blocker.cell.x}, ${blocker.cell.y})` : '');
    }).join('; ');
    message = t('rejected') + details + '. ' + t('unchanged');
  }
  document.getElementById('feedback').textContent = message;
}

function renderObjective() {
  const p = `(${LEVEL.playerGoal.x}, ${LEVEL.playerGoal.y})`;
  const s = `(${LEVEL.shadowGoal.x}, ${LEVEL.shadowGoal.y})`;
  document.getElementById('objective').textContent = t('objective').replace('{p}', p).replace('{s}', s);
}

function applyLanguage() {
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
  for (const element of document.querySelectorAll('[data-i18n]')) {
    element.innerHTML = t(element.dataset.i18n);
  }
  const button = document.getElementById('language');
  button.textContent = language === 'en' ? '中文' : 'English';
  button.setAttribute('aria-label', language === 'en' ? 'Switch to Chinese' : '切换为英文');
  document.getElementById('play-area').setAttribute('aria-label', language === 'en' ? 'Puzzle area' : '游戏区域');
  renderObjective();
  renderFeedback();
}

function toggleLanguage() {
  language = language === 'en' ? 'zh' : 'en';
  applyLanguage();
  redraw(); // 重绘目标标签、模式及坐标；不生成关卡或移动角色。
}

