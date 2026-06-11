const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const healthEl = document.getElementById("health");
const levelEl = document.getElementById("level");

const tile = 20;
const cols = 40;
const rows = 25;

const colors = ["#24452b", "#3f6636", "#8b7440", "#4b3024", "#626262"];
const speeds = [1, 1.12, 0.85, 0.55, 1.3];

let terrain = [];
let keys = {};
let score = 0;
let health = 3;
let level = 1;

let player = { x: 80, y: 80, size: 20 };
let relic = { x: 400, y: 240, size: 14 };
let enemies = [];

function makeTerrain() {
  terrain = [];

  for (let y = 0; y < rows; y++) {
    terrain[y] = [];

    for (let x = 0; x < cols; x++) {
      let v = Math.sin(x * 0.5) + Math.cos(y * 0.4) + Math.random() * 2;
      let kind = 0;

      if (v > 3) kind = 1;      // moss
      else if (v > 2) kind = 2; // sand
      else if (v > 1) kind = 0; // grass
      else if (v > 0) kind = 3; // mud
      else kind = 4;            // stone

      terrain[y][x] = kind;
    }
  }
}

function terrainAt(x, y) {
  let tx = Math.floor(x / tile);
  let ty = Math.floor(y / tile);

  tx = Math.max(0, Math.min(cols - 1, tx));
  ty = Math.max(0, Math.min(rows - 1, ty));

  return terrain[ty][tx];
}

function playerSpeed() {
  let kind = terrainAt(player.x + player.size / 2, player.y + player.size / 2);
  return 4 * speeds[kind];
}

function drawTerrain() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = colors[terrain[y][x]];
      ctx.fillRect(x * tile, y * tile, tile, tile);
    }
  }
}

function spawnEnemy() {
  return {
    x: Math.random() * 760,
    y: Math.random() * 460,
    size: 20,
    vx: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1),
    vy: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1)
  };
}

function reset() {
  makeTerrain();

  player.x = 80;
  player.y = 80;

  relic.x = Math.random() * 760;
  relic.y = Math.random() * 460;

  enemies = [spawnEnemy()];
  score = 0;
  health = 3;
  level = 1;

  updateHud();
}

function updateHud() {
  scoreEl.textContent = score;
  healthEl.textContent = health;
  levelEl.textContent = level;
}

function touches(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}

function movePlayer() {
  let speed = playerSpeed();

  if (keys["w"] || keys["arrowup"]) player.y -= speed;
  if (keys["s"] || keys["arrowdown"]) player.y += speed;
  if (keys["a"] || keys["arrowleft"]) player.x -= speed;
  if (keys["d"] || keys["arrowright"]) player.x += speed;

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
}

function update() {
  movePlayer();

  if (touches(player, relic)) {
    score++;

    relic.x = Math.random() * 760;
    relic.y = Math.random() * 460;

    if (score % 5 === 0) {
      level++;
      enemies.push(spawnEnemy());
    }

    updateHud();
  }

  for (let enemy of enemies) {
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;

    if (enemy.x < 0 || enemy.x > 780) enemy.vx *= -1;
    if (enemy.y < 0 || enemy.y > 480) enemy.vy *= -1;

    if (touches(player, enemy)) {
      health--;
      player.x = 80;
      player.y = 80;

      if (health <= 0) reset();
      updateHud();
    }
  }
}

function draw() {
  drawTerrain();

  ctx.fillStyle = "gold";
  ctx.fillRect(relic.x, relic.y, relic.size, relic.size);

  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  ctx.fillStyle = "red";
  for (let enemy of enemies) {
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
  }

  let kind = terrainAt(player.x + 10, player.y + 10);
  ctx.fillStyle = "white";
  ctx.fillText("terrain speed x" + speeds[kind], 10, 20);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", event => {
  keys[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

document.getElementById("restart").addEventListener("click", reset);

reset();
loop();
