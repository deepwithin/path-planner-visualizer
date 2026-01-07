const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// draw background
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;

function drawGrid() {
  ctx.strokeStyle = "#ddd";

  for (let i = 0; i <= GRID_SIZE; i++) {
    let p = i * CELL_SIZE;

    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }
}

drawGrid();

let grid = Array(GRID_SIZE)
  .fill(0)
  .map(() => Array(GRID_SIZE).fill(0));
// 0 = free, 1 = obstacle


canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(y / CELL_SIZE);

  grid[row][col] = 1 - grid[row][col];
  redraw();
});

function drawObstacles() {
  ctx.fillStyle = "black";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 1) {
        ctx.fillRect(
          c * CELL_SIZE,
          r * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }
  }
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawObstacles();
}

let start = { r: 0, c: 0 };
let goal = { r: 19, c: 19 };

function drawStartGoal() {
  ctx.fillStyle = "green";
  ctx.fillRect(start.c * CELL_SIZE, start.r * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  ctx.fillStyle = "red";
  ctx.fillRect(goal.c * CELL_SIZE, goal.r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}


function getNeighbors(r, c) {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let result = [];

  for (let [dr, dc] of dirs) {
    let nr = r + dr, nc = c + dc;
    if (
      nr >= 0 && nr < GRID_SIZE &&
      nc >= 0 && nc < GRID_SIZE &&
      grid[nr][nc] === 0
    ) {
      result.push({ r: nr, c: nc });
    }
  }
  return result;
}

function heuristic(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}


