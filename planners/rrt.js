export function runRRT(grid, start, goal, params) {
  const t0 = performance.now();

  const rows = grid.length;
  const cols = grid[0].length;
  const { stepSize, maxIterations } = params;
  const inflatedGrid = Array(rows).fill(0).map(() => Array(cols).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              inflatedGrid[nr][nc] = 1;
            }
          }
        }
      }
    }
  }
  const parents = new Map(); // node -> parent
  parents.set(`${start.r},${start.c}`, null);

  let visited = [start];
  let openSets = [[start]]; // for animation, current tree at each step

  const tree = [start]; // list of nodes

  function distance(a, b) {
    return Math.sqrt((a.r - b.r) ** 2 + (a.c - b.c) ** 2);
  }

  function nearestNode(point) {
    let nearest = tree[0];
    let minDist = distance(nearest, point);
    for (let node of tree) {
      const d = distance(node, point);
      if (d < minDist) {
        minDist = d;
        nearest = node;
      }
    }
    return nearest;
  }

  function extend(from, towards) {
    const dr = towards.r - from.r;
    const dc = towards.c - from.c;
    const dist = distance(from, towards);
    if (dist <= stepSize) {
      return towards;
    }
    const ratio = stepSize / dist;
    const newR = Math.round(from.r + dr * ratio);
    const newC = Math.round(from.c + dc * ratio);
    return { r: newR, c: newC };
  }

  function isValid(node) {
    if (node.r < 0 || node.r >= rows || node.c < 0 || node.c >= cols) return false;
    return inflatedGrid[node.r][node.c] === 0;
  }

  function isLineClear(from, to) {
    const dr = to.r - from.r;
    const dc = to.c - from.c;
    const dist = Math.max(Math.abs(dr), Math.abs(dc));
    if (dist === 0) return true; // same point
    for (let i = 0; i <= dist; i++) {
      const r = Math.round(from.r + dr * i / dist);
      const c = Math.round(from.c + dc * i / dist);
      if (r < 0 || r >= rows || c < 0 || c >= cols || inflatedGrid[r][c] !== 0) return false;
    }
    return true;
  }

  function reconstructPath(goal) {
    const path = [];
    let current = goal;
    let count = 0;
    while (current && count < 1000) {
      path.push(current);
      current = parents.get(`${current.r},${current.c}`);
      count++;
    }
    if (count >= 1000) {
      console.error("Cycle detected in path reconstruction");
      return [];
    }
    return path.reverse();
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    // Sample random point
    let randomPoint;
    if (Math.random() < 0.1) { // 10% chance to sample goal
      randomPoint = goal;
    } else {
      randomPoint = {
        r: Math.floor(Math.random() * rows),
        c: Math.floor(Math.random() * cols)
      };
    }

    const nearest = nearestNode(randomPoint);
    const newNode = extend(nearest, randomPoint);

    if (isValid(newNode) && isLineClear(nearest, newNode)) {
      tree.push(newNode);
      parents.set(`${newNode.r},${newNode.c}`, nearest);
      visited.push(newNode);
      openSets.push([...tree]); // current tree

      // Check if close to goal
      if (distance(newNode, goal) <= stepSize && isLineClear(newNode, goal)) {
        parents.set(`${goal.r},${goal.c}`, newNode);
        visited.push(goal);
        openSets.push([...tree, goal]);
        const path = reconstructPath(goal);
        const t1 = performance.now();
        return {
          path,
          visited,
          frontier: [], // RRT doesn't have traditional frontier
          openSets,
          stats: {
            nodesVisited: visited.length,
            pathLength: path.length,
            timeMs: (t1 - t0).toFixed(2)
          }
        };
      }
    }
  }

  // No path found
  const t1 = performance.now();
  return {
    path: null,
    visited,
    frontier: [],
    openSets,
    stats: {
      nodesVisited: visited.length,
      pathLength: "No path found",
      timeMs: (t1 - t0).toFixed(2)
    }
  };
}