const Terrain = {
  cols: 40,
  rows: 25,
  data: [],
  names: ['grass', 'moss', 'sand', 'mud', 'stone', 'water'],
  colors: ['#24452b', '#3f6636', '#8b7440', '#4b3024', '#626262', '#1f4056'],
  speeds: [1, 1.12, 0.85, 0.55, 1.3, 0.45]
};

function makeTerrain() {
  Terrain.data = [];
  for (let y = 0; y < Terrain.rows; y++) {
    Terrain.data[y] = [];
    for (let x = 0; x < Terrain.cols; x++) {
      let v = Math.sin(x * 0.42) + Math.cos(y * 0.37) + Math.random() * 1.6;
      let kind = 0;
      if (v > 2.0