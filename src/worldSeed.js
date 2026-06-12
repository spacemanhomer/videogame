const STORAGE_KEY = "relic-runner-world-seed-v1";

let cachedSeed = null;

export function getWorldSeed() {
  if (cachedSeed !== null) return cachedSeed;

  cachedSeed = loadSeed();
  return cachedSeed;
}

export function seededNoise(x, y = 0, salt = 0) {
  const seed = getWorldSeed();
  const value = Math.sin(
    (x + seed * 0.00013) * 127.1 +
    (y - seed * 0.00019) * 311.7 +
    (salt + seed * 0.00007) * 74.7
  ) * 43758.5453;

  return value - Math.floor(value);
}

function loadSeed() {
  const stored = readStoredSeed();
  if (Number.isFinite(stored)) return stored;

  const seed = createSeed();
  writeStoredSeed(seed);
  return seed;
}

function readStoredSeed() {
  try {
    const value = globalThis.localStorage?.getItem(STORAGE_KEY);
    return value ? Number(value) : NaN;
  } catch (_error) {
    return NaN;
  }
}

function writeStoredSeed(seed) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, String(seed));
  } catch (_error) {
    // Private browsing or blocked storage still gets a seed for this page session.
  }
}

function createSeed() {
  const cryptoValues = new Uint32Array(1);

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(cryptoValues);
    return cryptoValues[0];
  }

  return Math.floor((Date.now() + Math.random() * 0xffffffff) % 0xffffffff);
}
