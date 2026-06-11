const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreBox = document.getElementById('score');
const healthBox = document.getElementById('health');
const levelBox = document.getElementById('level');

const tile = 20;
const cols = 40;
const rows = 25;
const landColors = ['#24452b', '#3f6636', '#8b7440', '#4b3024', '#626262'];
const landSpeeds = [1, 1.12, 0.85, 0.55, 1.3];

let land = [];
let keys = {}