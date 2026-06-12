let cachedSeed = createSeed();

export function getWorldSeed() {
  return cachedSeed;
}

export function resetWorldSeed() {
  cachedSeed = createSeed();
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

function createSeed() {
  const cryptoValues = new Uint32Array(1);

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(cryptoValues);
    return cryptoValues[0];
  }

  return Math.floor((Date.now() + Math.random() * 0xffffffff) % 0xffffffff);
}
