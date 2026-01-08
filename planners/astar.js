export function runAStar(grid, start, goal, heuristicFn) {
  const t0 = performance.now();

  const rows = grid.length;
  const cols = grid[0].length;

  const openSet = [];
  const cameFrom = new Map();

  const gScore = Array(rows).fill(0)
    .map(() => Array(cols).fill(Infinity));

  const fScore = Array(rows).fill(0)
    .map(() => Array(cols).fill(Infinity));

  function key(n) {
    return `${n.r},${n.c}`;
  }

  gScore[start.r][start.c] = 0;
  fScore[start.r][start.c] = heuristicFn(start, goal);

  openSet.push(start);

  let visited = [];
  let openSets = [];
  let nodesVisited = 0;

  while (openSet.length > 0) {
    // Find node with lowest fScore
    let currentIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      const n = openSet[i];
      const c = openSet[currentIdx];
      if (fScore[n.r][n.c] < fScore[c.r][c.c]) {
        currentIdx = i;
      }
    }

    const current = openSet.splice(currentIdx, 1)[0];
    visited.push(current);
    openSets.push(openSet.slice());
    nodesVisited++;

    // Goal reached
    if (current.r === goal.r && current.c === goal.c) {
      const path = reconstructPath(cameFrom, current);
      const t1 = performance.now();

      return {
        path,
        visited,
        frontier: openSet.slice(),
        openSets,
        stats: {
          nodesVisited,
          pathLength: path.length,
          timeMs: (t1 - t0).toFixed(2)
        }
      };
    }

    for (let neighbor of getNeighbors(grid, current)) {
      const tentativeG =
        gScore[current.r][current.c] + 1;

      if (tentativeG < gScore[neighbor.r][neighbor.c]) {
        cameFrom.set(key(neighbor), current);
        gScore[neighbor.r][neighbor.c] = tentativeG;
        fScore[neighbor.r][neighbor.c] =
          tentativeG + heuristicFn(neighbor, goal);

        if (!openSet.some(n => n.r === neighbor.r && n.c === neighbor.c)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return null; // no path
}

// ===== Helpers =====
function reconstructPath(cameFrom, current) {
  const path = [current];
  while (cameFrom.has(`${current.r},${current.c}`)) {
    current = cameFrom.get(`${current.r},${current.c}`);
    path.push(current);
  }
  return path.reverse();
}

function getNeighbors(grid, node) {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const result = [];

  for (let [dr, dc] of dirs) {
    const r = node.r + dr;
    const c = node.c + dc;
    if (
      r >= 0 && r < grid.length &&
      c >= 0 && c < grid[0].length &&
      grid[r][c] === 0
    ) {
      result.push({ r, c });
    }
  }
  return result;
}
