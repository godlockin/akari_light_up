import {
  Cell,
  CellType,
  Position,
  SolveResult,
  ReasoningStep,
  posToString,
  isBlackCell,
  getCellNumber,
} from './types';

// 方向：上、下、左、右
const DIRECTIONS: Position[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

/**
 * 创建空白的格子状态数组
 */
export function createEmptyGrid(size: number, types: CellType[][]): Cell[][] {
  const grid: Cell[][] = [];
  for (let row = 0; row < size; row++) {
    grid[row] = [];
    for (let col = 0; col < size; col++) {
      grid[row][col] = {
        type: types[row][col],
        bulb: false,
        marked: false,
        illuminated: false,
        hasError: false,
        isHinted: false,
      };
    }
  }
  return grid;
}

/**
 * 深拷贝格子数组
 */
export function cloneGrid(grid: Cell[][]): Cell[][] {
  return grid.map(row => row.map(cell => ({ ...cell })));
}

/**
 * 获取光线能到达的所有白格（从指定位置出发，四个方向）
 */
export function getIlluminatedCells(
  grid: Cell[][],
  startRow: number,
  startCol: number
): Position[] {
  const size = grid.length;
  const illuminated: Position[] = [];

  for (const dir of DIRECTIONS) {
    let row = startRow + dir.row;
    let col = startCol + dir.col;

    while (row >= 0 && row < size && col >= 0 && col < size) {
      if (isBlackCell(grid[row][col].type)) break;
      illuminated.push({ row, col });
      row += dir.row;
      col += dir.col;
    }
  }

  return illuminated;
}

/**
 * 更新照亮状态
 */
export function updateIllumination(grid: Cell[][]): void {
  const size = grid.length;

  // 先重置所有照亮状态
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      grid[row][col].illuminated = false;
    }
  }

  // 根据灯泡位置更新照亮状态
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col].bulb) {
        grid[row][col].illuminated = true;
        const illuminated = getIlluminatedCells(grid, row, col);
        for (const pos of illuminated) {
          grid[pos.row][pos.col].illuminated = true;
        }
      }
    }
  }
}

/**
 * 检查并更新错误状态
 */
export function updateErrors(grid: Cell[][]): void {
  const size = grid.length;

  // 先重置所有错误状态
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      grid[row][col].hasError = false;
    }
  }

  // 检查灯照灯错误
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col].bulb) {
        // 检查这个灯是否被其他灯照亮
        for (const dir of DIRECTIONS) {
          let r = row + dir.row;
          let c = col + dir.col;
          while (r >= 0 && r < size && c >= 0 && c < size) {
            if (isBlackCell(grid[r][c].type)) break;
            if (grid[r][c].bulb) {
              // 发现冲突
              grid[row][col].hasError = true;
              grid[r][c].hasError = true;
            }
            r += dir.row;
            c += dir.col;
          }
        }
      }
    }
  }

  // 检查数字约束错误
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const num = getCellNumber(grid[row][col].type);
      if (num !== null) {
        let bulbCount = 0;
        const neighbors: Position[] = [];

        for (const dir of DIRECTIONS) {
          const r = row + dir.row;
          const c = col + dir.col;
          if (r >= 0 && r < size && c >= 0 && c < size) {
            neighbors.push({ row: r, col: c });
            if (grid[r][c].bulb) bulbCount++;
          }
        }

        // 超过数字限制
        if (bulbCount > num) {
          grid[row][col].hasError = true;
          for (const n of neighbors) {
            if (grid[n.row][n.col].bulb) {
              grid[n.row][n.col].hasError = true;
            }
          }
        }
      }
    }
  }
}

/**
 * 检查是否胜利
 */
export function checkWin(grid: Cell[][]): boolean {
  const size = grid.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = grid[row][col];
      // 白格必须被照亮
      if (cell.type === 'white' && !cell.illuminated) {
        return false;
      }
      // 不能有错误
      if (cell.hasError) {
        return false;
      }
    }
  }

  return true;
}

/**
 * 求解器 - 使用回溯法
 */
export function solve(
  types: CellType[][],
  progress?: Map<string, 'bulb' | 'marked'>
): SolveResult {
  const size = types.length;
  const solution = new Set<string>();
  const steps: ReasoningStep[] = [];

  // 创建工作网格
  const workGrid: { type: CellType; bulb: boolean; marked: boolean }[][] = [];
  for (let row = 0; row < size; row++) {
    workGrid[row] = [];
    for (let col = 0; col < size; col++) {
      const key = posToString(row, col);
      workGrid[row][col] = {
        type: types[row][col],
        bulb: progress?.get(key) === 'bulb',
        marked: progress?.get(key) === 'marked',
      };
    }
  }

  // 约束传播
  function propagate(): boolean {
    let changed = true;
    while (changed) {
      changed = false;

      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (workGrid[row][col].type !== 'white') continue;
          if (workGrid[row][col].bulb || workGrid[row][col].marked) continue;

          // 检查是否被照亮
          let isLit = false;
          for (const dir of DIRECTIONS) {
            let r = row + dir.row;
            let c = col + dir.col;
            while (r >= 0 && r < size && c >= 0 && c < size) {
              if (isBlackCell(workGrid[r][c].type)) break;
              if (workGrid[r][c].bulb) {
                isLit = true;
                break;
              }
              r += dir.row;
              c += dir.col;
            }
            if (isLit) break;
          }

          // 如果被照亮，标记为不能放灯
          if (isLit) {
            workGrid[row][col].marked = true;
            changed = true;
            continue;
          }

          // 检查是否可以放灯（会不会冲突）
          let canPlace = true;
          for (const dir of DIRECTIONS) {
            let r = row + dir.row;
            let c = col + dir.col;
            while (r >= 0 && r < size && c >= 0 && c < size) {
              if (isBlackCell(workGrid[r][c].type)) break;
              if (workGrid[r][c].bulb) {
                canPlace = false;
                break;
              }
              r += dir.row;
              c += dir.col;
            }
            if (!canPlace) break;
          }

          if (!canPlace) {
            workGrid[row][col].marked = true;
            changed = true;
          }
        }
      }

      // 数字约束传播
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          const num = getCellNumber(workGrid[row][col].type);
          if (num === null) continue;

          const neighbors = getWhiteNeighborsSimple(workGrid, row, col);
          const bulbCount = neighbors.filter(n => workGrid[n.row][n.col].bulb).length;
          const unmarkedCount = neighbors.filter(
            n => !workGrid[n.row][n.col].bulb && !workGrid[n.row][n.col].marked
          ).length;

          // 如果已有灯数等于数字，标记剩余邻居
          if (bulbCount === num && unmarkedCount > 0) {
            for (const n of neighbors) {
              if (!workGrid[n.row][n.col].bulb && !workGrid[n.row][n.col].marked) {
                workGrid[n.row][n.col].marked = true;
                changed = true;
              }
            }
          }

          // 如果剩余格子必须全放灯
          if (bulbCount + unmarkedCount === num && unmarkedCount > 0) {
            for (const n of neighbors) {
              if (!workGrid[n.row][n.col].bulb && !workGrid[n.row][n.col].marked) {
                workGrid[n.row][n.col].bulb = true;
                changed = true;
              }
            }
          }

          // 如果已经超过数字
          if (bulbCount > num) {
            return false;
          }

          // 如果不可能满足数字
          if (bulbCount + unmarkedCount < num) {
            return false;
          }
        }
      }
    }

    return true;
  }

  // 检查是否完成
  function isComplete(): boolean {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (workGrid[row][col].type === 'white') {
          if (!workGrid[row][col].bulb && !workGrid[row][col].marked) {
            // 检查是否被照亮
            let isLit = false;
            for (const dir of DIRECTIONS) {
              let r = row + dir.row;
              let c = col + dir.col;
              while (r >= 0 && r < size && c >= 0 && c < size) {
                if (isBlackCell(workGrid[r][c].type)) break;
                if (workGrid[r][c].bulb) {
                  isLit = true;
                  break;
                }
                r += dir.row;
                c += dir.col;
              }
              if (isLit) break;
            }
            if (!isLit) return false;
          }
        }
      }
    }
    return true;
  }

  // 回溯搜索
  let solutionCount = 0;
  const maxSolutions = 2; // 只需要知道是否有唯一解

  function backtrack(): boolean {
    if (!propagate()) return false;

    if (isComplete()) {
      solutionCount++;
      if (solutionCount === 1) {
        // 记录第一个解
        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            if (workGrid[row][col].bulb) {
              solution.add(posToString(row, col));
            }
          }
        }
      }
      return solutionCount < maxSolutions;
    }

    // 找一个未确定的格子
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (workGrid[row][col].type === 'white' &&
            !workGrid[row][col].bulb &&
            !workGrid[row][col].marked) {
          // 尝试放灯
          const saved = workGrid.map(r => r.map(c => ({ ...c })));
          workGrid[row][col].bulb = true;
          if (backtrack()) {
            // 继续找其他解
          }
          // 恢复
          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              workGrid[r][c] = saved[r][c];
            }
          }

          if (solutionCount >= maxSolutions) return true;

          // 尝试不放灯（标记）
          workGrid[row][col].marked = true;
          if (backtrack()) {
            // 继续找其他解
          }
          // 恢复
          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              workGrid[r][c] = saved[r][c];
            }
          }

          return solutionCount >= maxSolutions;
        }
      }
    }

    return false;
  }

  backtrack();

  return {
    solvable: solutionCount > 0,
    unique: solutionCount === 1,
    solution,
    steps,
  };
}

function getWhiteNeighborsSimple(
  grid: { type: CellType; bulb: boolean; marked: boolean }[][],
  row: number,
  col: number
): Position[] {
  const size = grid.length;
  const neighbors: Position[] = [];

  for (const dir of DIRECTIONS) {
    const r = row + dir.row;
    const c = col + dir.col;
    if (r >= 0 && r < size && c >= 0 && c < size) {
      if (grid[r][c].type === 'white') {
        neighbors.push({ row: r, col: c });
      }
    }
  }

  return neighbors;
}

/**
 * 获取提示 - 找一个可以确定的位置
 */
export function getHintPosition(
  grid: Cell[][],
  solution: Set<string>
): { position: Position; reason: string } | null {
  const size = grid.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col].type !== 'white') continue;
      if (grid[row][col].bulb || grid[row][col].marked) continue;

      const key = posToString(row, col);
      if (solution.has(key)) {
        // 这个位置在解中有灯，给出提示
        let reason = '这个位置可以放置灯泡';

        // 尝试分析原因
        // 检查是否是唯一照亮某个格子的位置
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (grid[r][c].type !== 'white') continue;
            if (grid[r][c].illuminated) continue;

            // 找能照亮 (r,c) 的所有位置
            const canLight: Position[] = [];
            // 横向
            let cc = c - 1;
            while (cc >= 0 && !isBlackCell(grid[r][cc].type)) {
              if (!grid[r][cc].bulb && !grid[r][cc].marked && grid[r][cc].type === 'white') {
                canLight.push({ row: r, col: cc });
              }
              cc--;
            }
            cc = c + 1;
            while (cc < size && !isBlackCell(grid[r][cc].type)) {
              if (!grid[r][cc].bulb && !grid[r][cc].marked && grid[r][cc].type === 'white') {
                canLight.push({ row: r, col: cc });
              }
              cc++;
            }
            // 纵向
            let rr = r - 1;
            while (rr >= 0 && !isBlackCell(grid[rr][c].type)) {
              if (!grid[rr][c].bulb && !grid[rr][c].marked && grid[rr][c].type === 'white') {
                canLight.push({ row: rr, col: c });
              }
              rr--;
            }
            rr = r + 1;
            while (rr < size && !isBlackCell(grid[rr][c].type)) {
              if (!grid[rr][c].bulb && !grid[rr][c].marked && grid[rr][c].type === 'white') {
                canLight.push({ row: rr, col: c });
              }
              rr++;
            }

            if (canLight.length === 1 && canLight[0].row === row && canLight[0].col === col) {
              reason = `这是唯一能照亮位置(${r + 1}, ${c + 1})的格子`;
              break;
            }
          }
        }

        return { position: { row, col }, reason };
      }
    }
  }

  return null;
}