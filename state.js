const Game = {
  canvas: null,
  ctx: null,
  tile: 20,
  scoreValue: 0,
  healthValue: 3,
  levelValue: 1,
  keys: {},
  player: { x: 80, y: 80, size: 20 },
  relic: { x: 400, y: 240, size: 14 },
  enemies: []
};
