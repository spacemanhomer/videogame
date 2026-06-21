import { createRuinGem, spawnRuinZombie } from "./entities.js";
import { seededNoise } from "./worldSeed.js";

const RUIN_GEMS_PER_RUIN = 2;
const RUIN_ZOMBIE_MIN = 8;
const RUIN_ZOMBIE_EXTRA = 7;

export function seedActiveRuins(state) {
  for (const ruin of state.ruins) {
    seedRuinGems(state, ruin);
    seedRuinZombies(state, ruin);
  }
}

function seedRuinGems(state, ruin) {
  for (let index = 0; index < RUIN_GEMS_PER_RUIN; index++) {
    const gem = createRuinGem(ruin, index, state.level);

    if (
      state.collectedRuinGemIds.has(gem.id) ||
      state.relics.some(relic => relic.id === gem.id)
    ) continue;

    state.relics.push(gem);
  }
}

function seedRuinZombies(state, ruin) {
  if (state.spawnedRuinIds.has(ruin.id)) return;

  const count = RUIN_ZOMBIE_MIN + Math.floor(seededNoise(ruin.chunkX, ruin.chunkY, 430) * RUIN_ZOMBIE_EXTRA);

  for (let index = 0; index < count; index++) {
    const x = ruin.innerX + seededNoise(ruin.chunkX + index, ruin.chunkY, 431) * Math.max(1, ruin.innerWidth - 20);
    const y = ruin.innerY + seededNoise(ruin.chunkX, ruin.chunkY + index, 432) * Math.max(1, ruin.innerHeight - 20);
    state.enemies.push(spawnRuinZombie({ x, y }, index * 0.6));
  }

  state.spawnedRuinIds.add(ruin.id);
}
