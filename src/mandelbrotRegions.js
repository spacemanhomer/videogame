import { seededNoise } from "./worldSeed.js";

const REGION_SIZE = 50;
const CELL_SIZE = 5;
const REGION_SPACING = 200;
const REGION_DENSITY = 0.18;
const MAX_ITERATIONS = 28;

export function drawMandelbrotRegions(ctx, state, canvas) {
  const startRegionX = Math.floor(state.camera.x / REGION_SPACING) - 1;
  const startRegionY = Math.floor(state.camera.y / REGION_SPACING) - 1;
  const endRegionX = Math.ceil((state.camera.x + canvas.width) / REGION_SPACING) + 1;
  const endRegionY = Math.ceil((state.camera.y + canvas.height) / REGION_SPACING) + 1;
  const time = Date.now() / 1000;

  ctx.save();

  for (let regionY = startRegionY; regionY <= endRegionY; regionY++) {
    for (let regionX = startRegionX; regionX <= endRegionX; regionX++) {
      if (!hasMandelbrotRegion(regionX, regionY)) continue;
      drawRegion(ctx, state.camera, regionX, regionY, time);
    }
  }

  ctx.restore();
}

function hasMandelbrotRegion(regionX, regionY) {
  return seededNoise(regionX, regionY, 720) > 1 - REGION_DENSITY;
}

function drawRegion(ctx, camera, regionX, regionY, time) {
  const worldX = regionX * REGION_SPACING + Math.floor(seededNoise(regionX, regionY, 721) * (REGION_SPACING - REGION_SIZE));
  const worldY = regionY * REGION_SPACING + Math.floor(seededNoise(regionX, regionY, 722) * (REGION_SPACING - REGION_SIZE));
  const screenX = Math.floor(worldX - camera.x);
  const screenY = Math.floor(worldY - camera.y);
  const zoomPhase = time * (0.22 + seededNoise(regionX, regionY, 723) * 0.18) + seededNoise(regionX, regionY, 724) * Math.PI * 2;
  const zoom = 0.65 + Math.pow((Math.sin(zoomPhase) + 1) / 2, 2) * 12;
  const center = mandelbrotCenter(regionX, regionY);
  const scale = 2.8 / zoom;

  ctx.fillStyle = "rgba(12, 4, 24, 0.55)";
  ctx.fillRect(screenX, screenY, REGION_SIZE, REGION_SIZE);

  for (let y = 0; y < REGION_SIZE; y += CELL_SIZE) {
    for (let x = 0; x < REGION_SIZE; x += CELL_SIZE) {
      const cx = center.x + ((x / REGION_SIZE) - 0.5) * scale;
      const cy = center.y + ((y / REGION_SIZE) - 0.5) * scale;
      const escape = mandelbrot(cx, cy);
      ctx.fillStyle = colorForEscape(escape, time, regionX, regionY);
      ctx.fillRect(screenX + x, screenY + y, CELL_SIZE, CELL_SIZE);
    }
  }

  ctx.strokeStyle = "rgba(214, 121, 255, 0.65)";
  ctx.lineWidth = 1;
  ctx.strokeRect(screenX + 0.5, screenY + 0.5, REGION_SIZE - 1, REGION_SIZE - 1);
}

function mandelbrotCenter(regionX, regionY) {
  const centers = [
    { x: -0.743643887, y: 0.131825904 },
    { x: -0.1011, y: 0.9563 },
    { x: -1.25066, y: 0.02012 },
    { x: -0.761574, y: -0.0847596 },
    { x: 0.285, y: 0.01 }
  ];
  const index = Math.floor(seededNoise(regionX, regionY, 725) * centers.length);

  return centers[Math.min(index, centers.length - 1)];
}

function mandelbrot(cx, cy) {
  let x = 0;
  let y = 0;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const x2 = x * x - y * y + cx;
    const y2 = 2 * x * y + cy;
    x = x2;
    y = y2;

    if (x * x + y * y > 4) return iteration / MAX_ITERATIONS;
  }

  return 1;
}

function colorForEscape(escape, time, regionX, regionY) {
  if (escape >= 1) return "rgba(8, 3, 16, 0.78)";

  const shimmer = (Math.sin(time * 1.5 + escape * 10 + regionX * 0.7 + regionY * 0.4) + 1) / 2;
  const r = Math.floor(55 + escape * 130 + shimmer * 45);
  const g = Math.floor(20 + escape * 70);
  const b = Math.floor(100 + escape * 140 + shimmer * 40);

  return `rgba(${r}, ${g}, ${b}, 0.72)`;
}
