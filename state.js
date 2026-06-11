const Game = {
  canvas: null,
  context: null,
  width: 800,
  height: 500,
  tileSize: 20,
  score: 0,
  health: 3,
  level: 1,
  keys: {},
  player: { x: 80, y: 80, size: 20 },
  relic: { x: 400, y: 240, size: 14 },
  enemies: []
};

function randomNumber(max) {
  return Math.random() * max;
}

function rectanglesTouch(a, b) {
  return a.x < b.x + b.size && a.x + a.size > b.x && a.y < b.y + b.size && a.y + a.size > b.y;
}

function updateHud() {
  document.getElementById('score').textContent = Game.score;
  document.getElementById('health').text