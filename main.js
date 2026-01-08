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

// ===== Dragging state =====
let isDraggingStart = false;
let isDraggingGoal = false;

// ===== Path state =====
let currentPath = null;

// ===== Heuristic functions =====
function manhattan(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

function euclidean(a, b) {
  const dr = a.r - b.r;
  const dc = a.c - b.c;
  return Math.sqrt(dr * dr + dc * dc);
}

// ===== Drawing =====
function drawGrid() {
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;

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

let start = { r: 3, c: 3 };
let goal = { r: 16, c: 16 };

function drawStartGoal() {
  ctx.fillStyle = "green";
  ctx.fillRect(start.c * CELL_SIZE, start.r * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  ctx.fillStyle = "red";
  ctx.fillRect(goal.c * CELL_SIZE, goal.r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawPath(path) {
  if (path.length < 2) return;
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(path[0].c * CELL_SIZE + CELL_SIZE / 2, path[0].r * CELL_SIZE + CELL_SIZE / 2);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].c * CELL_SIZE + CELL_SIZE / 2, path[i].r * CELL_SIZE + CELL_SIZE / 2);
  }
  ctx.stroke();
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawObstacles();
  drawStartGoal();
  if (currentPath) {
    drawPath(currentPath);
  }
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

document.getElementById("clearPathBtn")
  .addEventListener("click", () => {
    currentPath = null;
    redraw();
  });

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
  const cell = getCellFromMouse(e);
  if (cell) {
    if (cell.r === start.r && cell.c === start.c) {
      isDraggingStart = true;
    } else if (cell.r === goal.r && cell.c === goal.c) {
      isDraggingGoal = true;
    } else {
      toggleCell(cell);
    }
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDraggingStart || isDraggingGoal) {
    const cell = getCellFromMouse(e);
    if (cell) {
      if (isDraggingStart) {
        start = { r: cell.r, c: cell.c };
      } else if (isDraggingGoal) {
        goal = { r: cell.r, c: cell.c };
      }
      currentPath = null; // Clear path when positions change
      redraw();
    }
  } else if (isMouseDown) {
    toggleCell(getCellFromMouse(e));
  }
});

canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
  lastCell = null;
  isDraggingStart = false;
  isDraggingGoal = false;
});

canvas.addEventListener("mouseleave", () => {
  isMouseDown = false;
  lastCell = null;
  isDraggingStart = false;
  isDraggingGoal = false;
});

// ===== Initial draw =====
redraw();

const ALGORITHMS = {
  astar: {
    name: "A*",
    params: {
      heuristic: {
        type: "select",
        options: ["Manhattan", "Euclidean"],
        default: "Manhattan"
      }
    }
  },
  rrt: {
    name: "RRT",
    params: {
      stepSize: {
        type: "number",
        default: 10,
        min: 1,
        max: 50
      },
      maxIterations: {
        type: "number",
        default: 1000
      }
    }
  },
  rrtstar: {
    name: "RRT*",
    params: {
      stepSize: {
        type: "number",
        default: 10,
        min: 1,
        max: 50
      },
      rewireRadius: {
        type: "number",
        default: 30
      }
    }
  }
};

const algoSelect = document.getElementById("algoSelect");
const algoParamsDiv = document.getElementById("algoParams");

// Populate algorithm select
algoSelect.innerHTML = '<option value="">Select Algorithm</option>';
for (const key in ALGORITHMS) {
  const option = document.createElement('option');
  option.value = key;
  option.textContent = ALGORITHMS[key].name;
  algoSelect.appendChild(option);
}

algoSelect.addEventListener("change", () => {
  const algo = algoSelect.value;

  if (!algo) {
    algoParamsDiv.innerHTML = '<p>Select an algorithm to see parameters.</p>';
    return;
  }

  const params = ALGORITHMS[algo].params;

  let html = '';
  for (const paramKey in params) {
    const param = params[paramKey];
    html += '<label>' + paramKey + ': ';
    if (param.type === 'select') {
      html += '<select id="' + paramKey + 'Select">';
      for (const opt of param.options) {
        const selected = opt === param.default ? ' selected' : '';
        html += '<option' + selected + '>' + opt + '</option>';
      }
      html += '</select>';
    } else if (param.type === 'number') {
      html += '<input type="number" id="' + paramKey + 'Input" value="' + param.default + '"';
      if (param.min) html += ' min="' + param.min + '"';
      if (param.max) html += ' max="' + param.max + '"';
      html += '>';
    }
    html += '</label><br>';
  }
  algoParamsDiv.innerHTML = html;
});

import { runAStar } from "./planners/astar.js";

document.getElementById("runBtn").addEventListener("click", () => {
  const algo = algoSelect.value;

  if (!algo) {
    alert("Please select an algorithm first.");
    return;
  }

  console.log("Running algorithm:", algo);

  let result;

  if (algo === "astar") {
    const heuristicSelect = document.getElementById("heuristicSelect");
    const heuristicType = heuristicSelect.value;
    console.log("Selected heuristic:", heuristicType);

    let heuristicFn;
    if (heuristicType === "Manhattan") {
      heuristicFn = manhattan;
    } else {
      heuristicFn = euclidean;
    }

    result = runAStar(grid, start, goal, heuristicFn);
    console.log("A* result:", result);
  }

  if (!result) {
    alert("No path found");
    return;
  }

  currentPath = result.path;
  redraw();
  updateStats(result.stats);
});

function updateStats(stats) {
  document.getElementById("pathLength").textContent = stats.pathLength;
  document.getElementById("nodesVisited").textContent = stats.nodesVisited;
  document.getElementById("timeTaken").textContent = stats.timeMs;
}

