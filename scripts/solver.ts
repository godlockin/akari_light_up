/**
 * Akari Light Up 谜题求解器 - 独立运行脚本
 * 用于计算和穷举谜题
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// ==================== 类型定义 ====================

export type CellType =
  | 'white'
  | 'black'
  | 'black-0'
  | 'black-1'
  | 'black-2'
  | 'black-3'
  | 'black-4';

export interface Position {
  row: number;
  col: number;
}

export interface Puzzle {
  size: number;
  types: CellType[][];
}

export interface Solution {
  bulbs: Set<string>; // 格式 "row,col"
  bulbPositions: Position[];
  bulbCount: number;
}

export interface SolverResult {
  solvable: boolean;
  unique: boolean;
  solutionCount: number;
  solution: Solution | null;
  stats: {
    backtrackSteps: number;
    propagateCalls: number;
    maxDepth: number;
  };
}

// ==================== 求解器 ====================

const DIRECTIONS: Position[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

function posToString(row: number, col: number): string {
  return `${row},${col}`;
}

function stringToPos(str: string): Position {
  const [row, col] = str.split(',').map(Number);
  return { row, col };
}

function isBlackCell(type: CellType): boolean {
  return type !== 'white';
}

function getCellNumber(type: CellType): number | null {
  if (!type.startsWith('black-')) return null;
  return parseInt(type.split('-')[1], 10);
}

// 获取能被位置 (row, col) 照亮的所有格子
function getIlluminatedCells(
  types: CellType[][],
  bulbs: Set<string>,
  row: number,
  col: number
): Position[] {
  const size = types.length;
  const result: Position[] = [];

  for (const dir of DIRECTIONS) {
    let r = row + dir.row;
    let c = col + dir.col;

    while (r >= 0 && r < size && c >= 0 && c < size) {
      if (isBlackCell(types[r][c])) break;
      result.push({ row: r, col: c });
      r += dir.row;
      c += dir.col;
    }
  }

  return result;
}

// 检查位置是否被任何灯照亮
function isIlluminated(
  types: CellType[][],
  bulbs: Set<string>,
  row: number,
  col: number
): boolean {
  const size = types.length;
  // 检查自己是否是灯
  if (bulbs.has(posToString(row, col))) return true;

  // 检查四个方向
  for (const dir of DIRECTIONS) {
    let r = row + dir.row;
    let c = col + dir.col;

    while (r >= 0 && r < size && c >= 0 && c < size) {
      if (isBlackCell(types[r][c])) break;
      if (bulbs.has(posToString(r, c))) return true;
      r += dir.row;
      c += dir.col;
    }
  }

  return false;
}

// 检查放置灯是否会冲突
function canPlaceBulb(
  types: CellType[][],
  bulbs: Set<string>,
  row: number,
  col: number
): boolean {
  const size = types.length;

  // 检查是否会照亮其他灯
  for (const dir of DIRECTIONS) {
    let r = row + dir.row;
    let c = col + dir.col;

    while (r >= 0 && r < size && c >= 0 && c < size) {
      if (isBlackCell(types[r][c])) break;
      if (bulbs.has(posToString(r, c))) return false;
      r += dir.row;
      c += dir.col;
    }
  }

  return true;
}

// 获取黑格的相邻白格
function getAdjacentWhiteCells(types: CellType[][], row: number, col: number): Position[] {
  const size = types.length;
  const result: Position[] = [];

  for (const dir of DIRECTIONS) {
    const r = row + dir.row;
    const c = col + dir.col;

    if (r >= 0 && r < size && c >= 0 && c < size && types[r][c] === 'white') {
      result.push({ row: r, col: c });
    }
  }

  return result;
}

// 约束传播
interface WorkState {
  types: CellType[][];
  bulbs: Set<string>;
  marked: Set<string>;
}

function propagate(state: WorkState): boolean {
  const size = state.types.length;
  let changed = true;
  let iterations = 0;
  const maxIterations = size * size * 4;

  while (changed && iterations < maxIterations) {
    iterations++;
    changed = false;

    // 1. 照亮传播 - 已照亮的格子不能放灯
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const key = posToString(row, col);
        if (state.types[row][col] !== 'white') continue;
        if (state.bulbs.has(key) || state.marked.has(key)) continue;

        if (isIlluminated(state.types, state.bulbs, row, col)) {
          state.marked.add(key);
          changed = true;
        }
      }
    }

    // 2. 冲突传播 - 不能放灯的位置标记
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const key = posToString(row, col);
        if (state.types[row][col] !== 'white') continue;
        if (state.bulbs.has(key) || state.marked.has(key)) continue;

        if (!canPlaceBulb(state.types, state.bulbs, row, col)) {
          state.marked.add(key);
          changed = true;
        }
      }
    }

    // 3. 数字约束传播
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const num = getCellNumber(state.types[row][col]);
        if (num === null) continue;

        const adjacent = getAdjacentWhiteCells(state.types, row, col);
        const bulbCount = adjacent.filter(p => state.bulbs.has(posToString(p.row, p.col))).length;
        const unmarked = adjacent.filter(p => !state.bulbs.has(posToString(p.row, p.col)) && !state.marked.has(posToString(p.row, p.col)));

        // 如果已达到数字，标记其余格子
        if (bulbCount === num && unmarked.length > 0) {
          for (const p of unmarked) {
            state.marked.add(posToString(p.row, p.col));
          }
          changed = true;
        }

        // 如果必须全部放灯
        if (bulbCount + unmarked.length === num && unmarked.length > 0) {
          for (const p of unmarked) {
            state.bulbs.add(posToString(p.row, p.col));
          }
          changed = true;
        }

        // 如果已超过数字
        if (bulbCount > num) {
          return false;
        }

        // 如果无法满足数字
        if (bulbCount + unmarked.length < num) {
          return false;
        }
      }
    }
  }

  return true;
}

// 检查是否完成
function isComplete(state: WorkState): boolean {
  const size = state.types.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (state.types[row][col] !== 'white') continue;

      const key = posToString(row, col);
      if (!state.bulbs.has(key) && !state.marked.has(key)) {
        return false;
      }

      // 验证被照亮
      if (!state.bulbs.has(key) && !state.marked.has(key)) {
        if (!isIlluminated(state.types, state.bulbs, row, col)) {
          return false;
        }
      }
    }
  }

  return true;
}

// 深拷贝状态
function cloneState(state: WorkState): WorkState {
  return {
    types: state.types.map(row => [...row]),
    bulbs: new Set(state.bulbs),
    marked: new Set(state.marked),
  };
}

// ==================== 主求解函数 ====================

export function solvePuzzle(
  types: CellType[][],
  options: {
    maxSolutions?: number; // 最多找多少个解（用于检查唯一性）
    timeout?: number; // 超时时间（毫秒）
    onProgress?: (stats: { solutions: number; depth: number; steps: number }) => void;
  } = {}
): SolverResult {
  const size = types.length;
  const maxSolutions = options.maxSolutions ?? 1;
  const startTime = Date.now();

  // 工作状态
  const state: WorkState = {
    types: types.map(row => [...row]),
    bulbs: new Set(),
    marked: new Set(),
  };

  // 统计信息
  let solutionCount = 0;
  let backtrackSteps = 0;
  let propagateCalls = 0;
  let maxDepth = 0;
  let solutions: Solution[] = [];

  // 检查超时
  function checkTimeout(): boolean {
    if (options.timeout && Date.now() - startTime > options.timeout) {
      return true;
    }
    return false;
  }

  // 回溯搜索
  function backtrack(depth: number): boolean {
    if (checkTimeout()) return true; // 超时，返回已有的解

    propagateCalls++;
    if (!propagate(state)) return false;

    if (isComplete(state)) {
      solutionCount++;
      solutions.push({
        bulbs: new Set(state.bulbs),
        bulbPositions: Array.from(state.bulbs).map(stringToPos),
        bulbCount: state.bulbs.size,
      });

      options.onProgress?.({
        solutions: solutionCount,
        depth,
        steps: backtrackSteps,
      });

      return solutionCount < maxSolutions;
    }

    maxDepth = Math.max(maxDepth, depth);

    // 找第一个未确定的格子
    let bestCell: Position | null = null;
    let minOptions = Infinity;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const key = posToString(row, col);
        if (state.types[row][col] !== 'white') continue;
        if (state.bulbs.has(key) || state.marked.has(key)) continue;

        // 计算可选数（简化启发式）
        let canPlace = canPlaceBulb(state.types, state.bulbs, row, col) ? 1 : 0;
        if (canPlace < minOptions) {
          minOptions = canPlace;
          bestCell = { row, col };
        }

        if (minOptions === 0) break;
      }
      if (minOptions === 0) break;
    }

    if (!bestCell) return false;

    const { row, col } = bestCell;
    const key = posToString(row, col);

    // 尝试放灯
    if (canPlaceBulb(state.types, state.bulbs, row, col)) {
      const saved = cloneState(state);
      state.bulbs.add(key);
      backtrackSteps++;

      if (backtrack(depth + 1)) {
        return true;
      }

      // 恢复
      state.bulbs = saved.bulbs;
      state.marked = saved.marked;

      if (checkTimeout() || solutionCount >= maxSolutions) return true;
    }

    // 尝试不放灯
    if (!state.bulbs.has(key) && !state.marked.has(key)) {
      const saved = cloneState(state);
      state.marked.add(key);
      backtrackSteps++;

      if (backtrack(depth + 1)) {
        return true;
      }

      // 恢复
      state.bulbs = saved.bulbs;
      state.marked = saved.marked;

      if (checkTimeout() || solutionCount >= maxSolutions) return true;
    }

    return false;
  }

  backtrack(0);

  return {
    solvable: solutionCount > 0,
    unique: solutionCount === 1,
    solutionCount,
    solution: solutions[0] || null,
    stats: {
      backtrackSteps,
      propagateCalls,
      maxDepth,
    },
  };
}

// ==================== 谜题解析 ====================

// 从紧凑格式解析谜题
export function parseCompactPuzzle(
  encoded: string,
  size: number
): CellType[][] {
  const decode: { [key: string]: CellType } = {
    'w': 'white',
    'b': 'black',
    '0': 'black-0',
    '1': 'black-1',
    '2': 'black-2',
    '3': 'black-3',
    '4': 'black-4',
  };

  const result: CellType[][] = [];
  for (let i = 0; i < size; i++) {
    result[i] = [];
    for (let j = 0; j < size; j++) {
      const char = encoded[i * size + j];
      result[i][j] = decode[char] || 'white';
    }
  }

  return result;
}

// ==================== 格式化输出 ====================

export function formatBoard(types: CellType[][]): string {
  const size = types.length;
  let result = '';

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = types[row][col];
      switch (cell) {
        case 'white': result += '.'; break;
        case 'black': result += '#'; break;
        case 'black-0': result += '0'; break;
        case 'black-1': result += '1'; break;
        case 'black-2': result += '2'; break;
        case 'black-3': result += '3'; break;
        case 'black-4': result += '4'; break;
      }
      result += ' ';
    }
    result += '\n';
  }

  return result;
}

export function formatSolution(types: CellType[][], bulbs: Set<string>): string {
  const size = types.length;
  let result = '';

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = types[row][col];
      const key = posToString(row, col);

      if (bulbs.has(key)) {
        result += '*';
      } else if (cell === 'white') {
        result += '.';
      } else {
        // 黑格
        if (cell === 'black') result += '#';
        else result += cell.split('-')[1];
      }
      result += ' ';
    }
    result += '\n';
  }

  return result;
}

// ==================== CLI 接口 ====================

interface SolveOptions {
  verbose?: boolean;
  showBoard?: boolean;
  showSolution?: boolean;
  timeout?: number;
}

export function solveFromCLI(
  encoded: string,
  size: number,
  options: SolveOptions = {}
): string {
  const types = parseCompactPuzzle(encoded, size);

  if (options.showBoard) {
    console.log('棋盘:');
    console.log(formatBoard(types));
  }

  const result = solvePuzzle(types, {
    maxSolutions: 10, // 最多找10个解
    timeout: options.timeout,
    onProgress: options.verbose ? (stats) => {
      console.log(`  进度: ${stats.solutions} 解, 深度 ${stats.depth}, 步数 ${stats.steps}`);
    } : undefined,
  });

  let output = '';

  output += `\n结果:\n`;
  output += `  可解: ${result.solvable ? '是' : '否'}\n`;
  output += `  唯一解: ${result.unique ? '是' : '否'}\n`;
  output += `  解的数量: ${result.solutionCount}\n`;
  output += `  回溯步数: ${result.stats.backtrackSteps}\n`;
  output += `  传播调用: ${result.stats.propagateCalls}\n`;
  output += `  最大深度: ${result.stats.maxDepth}\n`;

  if (result.solution) {
    output += `  灯泡数量: ${result.solution.bulbCount}\n`;
    output += `  灯泡位置: ${Array.from(result.solution.bulbs).sort().join(', ')}\n`;
  }

  if (options.showSolution && result.solution) {
    output += `\n解:\n`;
    output += formatSolution(types, result.solution.bulbs);
  }

  return output;
}

// ==================== 导出为模块 ====================

if (import.meta.url === `file://${process.argv[1]}`) {
  // 直接运行
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('用法: bun scripts/solver.ts <编码字符串> <大小> [选项]');
    console.log('选项:');
    console.log('  --show-board      显示棋盘');
    console.log('  --show-solution  显示解');
    console.log('  --verbose         显示详细进度');
    console.log('  --timeout <ms>    超时时间');
    console.log('');
    console.log('示例:');
    console.log('  bun scripts/solver.ts wwbwbwwb3bw0bwwwwwbwwwb4bwwbwwbwwbwb0bwb2bwwwwwww 7');
    console.log('  bun scripts/solver.ts wwbwbwwb3bw0bwwwwwbwwwb4bwwbwwbwwbwb0bwb2bwwwwwww 7 --show-solution');
    process.exit(0);
  }

  const encoded = args[0];
  const size = parseInt(args[1], 10);

  const options: SolveOptions = {};
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--show-board') options.showBoard = true;
    else if (args[i] === '--show-solution') options.showSolution = true;
    else if (args[i] === '--verbose') options.verbose = true;
    else if (args[i] === '--timeout' && i + 1 < args.length) {
      options.timeout = parseInt(args[i + 1], 10);
      i++;
    }
  }

  console.log(solveFromCLI(encoded, size, options));
}
