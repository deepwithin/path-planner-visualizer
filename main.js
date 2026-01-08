const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ===== Grid config =====
const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;

// ===== Grid state =====
let grid = Array(GRID_SIZE)
  .fill(0)
  .map(() => Array(GRID_SIZE).fill(0));
// 0 = free, 1 = obstacle

// ===== Mouse state =====
let isMouseDown = false;
let lastCell = null;

// ===== Drawing =====
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

let start = { r: 0, c: 0 };
let goal = { r: 19, c: 19 };

function drawStartGoal() {
  ctx.fillStyle = "green";
  ctx.fillRect(start.c * CELL_SIZE, start.r * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  ctx.fillStyle = "red";
  ctx.fillRect(goal.c * CELL_SIZE, goal.r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawObstacles();
  drawStartGoal();
}

function clearObstacles() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = 0;
    }
  }
  redraw();
}

document.getElementById("clearBtn")
  .addEventListener("click", clearObstacles);

// ===== Mouse → Grid helper =====
function getCellFromMouse(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const c = Math.floor(x / CELL_SIZE);
  const r = Math.floor(y / CELL_SIZE);

  if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
    return null;
  }
  return { r, c };
}

// ===== Toggle logic =====
function toggleCell(cell) {
  if (!cell) return;

  // Prevent repeated toggling of same cell during drag
  if (
    lastCell &&
    lastCell.r === cell.r &&
    lastCell.c === cell.c
  ) {
    return;
  }

  grid[cell.r][cell.c] = 1 - grid[cell.r][cell.c];
  lastCell = cell;
  redraw();
}

// ===== Mouse events =====
canvas.addEventListener("mousedown", (e) => {
  isMouseDown = true;
  lastCell = null;
  toggleCell(getCellFromMouse(e));
});

canvas.addEventListener("mousemove", (e) => {
  if (!isMouseDown) return;
  toggleCell(getCellFromMouse(e));
});

canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
  lastCell = null;
});

canvas.addEventListener("mouseleave", () => {
  isMouseDown = false;
  lastCell = null;
});

// ===== Initial draw =====
redraw();


