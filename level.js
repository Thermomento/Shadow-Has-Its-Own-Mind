// 只放关卡数据；修改布局后运行 node verify-level.cjs 重新验证。
const LEVEL = {
  cols: 7,
  rows: 5,
  start: { x: 0, y: 0, mode: 'A' },
  playerGoal: { x: 6, y: 4 },
  shadowGoal: { x: 6, y: 0 },
  walls: [
    { x: 0, y: 1 }, { x: 0, y: 4 }, { x: 1, y: 2 },
    { x: 2, y: 3 }, { x: 3, y: 0 }, { x: 4, y: 2 }, { x: 5, y: 2 }
  ]
};

// 随机关卡生成达到上限时使用，遵守四个位置互不重叠。
const RANDOM_FALLBACKS = [
  {
    "cols": 7,
    "rows": 5,
    "start": {
      "x": 2,
      "y": 1,
      "mode": "A"
    },
    "playerGoal": {
      "x": 0,
      "y": 1
    },
    "shadowGoal": {
      "x": 0,
      "y": 3
    },
    "walls": [
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 6,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 0,
        "y": 0
      }
    ]
  },
  {
    "cols": 7,
    "rows": 5,
    "start": {
      "x": 0,
      "y": 1,
      "mode": "A"
    },
    "playerGoal": {
      "x": 5,
      "y": 4
    },
    "shadowGoal": {
      "x": 5,
      "y": 0
    },
    "walls": [
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 6,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 2
      }
    ]
  }
];
