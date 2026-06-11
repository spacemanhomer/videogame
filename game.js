const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const healthEl = document.getElementById('health');
const levelEl = document.getElementById('level');

const TILE = 20;
const COLS = canvas.width / TILE;
const ROWS = canvas.height / TILE;
const terrain = [
  { name: 'grass', color: '#24452b', speed: 1.00 },
  { name: 'moss', color: '#3f6636', speed: 1.15 },
  { name: '