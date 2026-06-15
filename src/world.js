import { ecosystemAt } from "./ecosystems.js";
import { activeObstacles, activeRuins, createObstacleChunks, updateObstacleChunks } from "./obstacles.js";
import { createTerrainChunks, updateTerrainChunks } from "./terrain.js";

export function createWorldStores(state) {
  state.terrain = createTerrainChunks();
  state.obstacleChunks = createObstacleChunks();
}

export function loadWorldAroundPlayer(state) {
  updateTerrainChunks(state.terrain, state.player);
  updateObstacleChunks(state.obstacleChunks, state.player);
  state.obstacles = activeObstacles(state.obstacleChunks);
  state.ruins = activeRuins(state.obstacleChunks);
}

export function updateCurrentEcosystem(state) {
  state.currentEcosystem = ecosystemAt(state.player.x, state.player.y).name;
}

export function centerCamera(state, canvas) {
  state.camera.x = state.player.x + state.player.size / 2 - canvas.width / 2;
  state.camera.y = state.player.y + state.player.size / 2 - canvas.height / 2;
}

export function screenToWorld(point, camera) {
  return {
    x: point.x + camera.x,
    y: point.y + camera.y
  };
}
