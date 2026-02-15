import { CellType } from '../../core/types';
import { UltraCompactPuzzle, decompressPuzzle } from './codec';
import { PUZZLES_5X5 } from './5x5';
import { PUZZLES_6X6 } from './6x6';
import { PUZZLES_7X7 } from './7x7';
import { PUZZLES_10X10 } from './10x10';
import { PUZZLES_12X12 } from './12x12';

// ==================== 类型定义 ====================
export interface CompactPuzzle {
  t: CellType[][];  // types
  s: string[];      // solution
}

// 兼容两种格式
export type AnyCompactPuzzle = CompactPuzzle | UltraCompactPuzzle;

export interface PuzzleEntry {
  id: string;
  size: number;
  difficulty: number;
  difficultyName: string;
  types: CellType[][];
  solution: string[];
}

// ==================== 变换函数 ====================

/** 旋转 types 90度顺时针 */
function rotateTypes90(types: CellType[][]): CellType[][] {
  const n = types.length;
  const result: CellType[][] = Array(n).fill(null).map(() => Array(n).fill('white'));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[c][n - 1 - r] = types[r][c];
    }
  }
  return result;
}

/** 水平翻转 */
function flipTypesH(types: CellType[][]): CellType[][] {
  return types.map(row => [...row].reverse());
}

/** 垂直翻转 */
function flipTypesV(types: CellType[][]): CellType[][] {
  return [...types].reverse();
}

/** 旋转位置 */
function rotatePos(pos: string, size: number): string {
  const [r, c] = pos.split(',').map(Number);
  return `${c},${size - 1 - r}`;
}

/** 水平翻转位置 */
function flipPosH(pos: string, size: number): string {
  const [r, c] = pos.split(',').map(Number);
  return `${r},${size - 1 - c}`;
}

/** 垂直翻转位置 */
function flipPosV(pos: string, size: number): string {
  const [r, c] = pos.split(',').map(Number);
  return `${size - 1 - r},${c}`;
}

/** 应用随机变换到谜题 */
export function transformCompactPuzzle(
  puzzle: AnyCompactPuzzle,
  size: number,
  rotation: number = 0,
  flipH: boolean = false,
  flipV: boolean = false
): CompactPuzzle {
  // 先转换为标准格式
  let compact: CompactPuzzle;
  if ('b' in puzzle) {
    // UltraCompactPuzzle
    compact = decompressPuzzle(puzzle, size);
  } else {
    // CompactPuzzle
    compact = puzzle;
  }

  let types = compact.t.map(row => [...row]);
  let solution = [...compact.s];

  if (flipH) {
    types = flipTypesH(types);
    solution = solution.map(pos => flipPosH(pos, size));
  }
  if (flipV) {
    types = flipTypesV(types);
    solution = solution.map(pos => flipPosV(pos, size));
  }

  const rotations = ((rotation % 4) + 4) % 4;
  for (let i = 0; i < rotations; i++) {
    types = rotateTypes90(types);
    solution = solution.map(pos => rotatePos(pos, size));
  }

  return { t: types, s: solution };
}

/** 获取随机变换的谜题 */
export function getRandomTransformedPuzzle(puzzle: AnyCompactPuzzle, size: number): CompactPuzzle {
  const rotation = Math.floor(Math.random() * 4);
  const flipH = Math.random() < 0.5;
  const flipV = Math.random() < 0.5;
  return transformCompactPuzzle(puzzle, size, rotation, flipH, flipV);
}

// ==================== 获取谜题 ====================

const PUZZLE_MAP: Record<number, AnyCompactPuzzle[]> = {
  5: PUZZLES_5X5,
  6: PUZZLES_6X6,
  7: PUZZLES_7X7,
  10: PUZZLES_10X10,
  12: PUZZLES_12X12,
};

const DIFFICULTY_NAME: Record<number, string> = {
  1: '入门',
  2: '简单',
  3: '中等',
  4: '困难',
  5: '专家',
};

/** 从对应尺寸库中随机获取一个谜题（带变换） */
export function getRandomPuzzleFromBank(
  size: number,
  difficulty: number
): PuzzleEntry | null {
  const puzzles = PUZZLE_MAP[size];
  if (!puzzles || puzzles.length === 0) return null;

  // 根据难度选择范围
  let startIdx = 0;
  let endIdx = puzzles.length;

  if (size === 5 || size === 6 || size === 7 || size === 10 || size === 12) {
    // Has 100 generated puzzles (not sorted by difficulty).
    // Use the full range for any requested difficulty.
    startIdx = 0;
    endIdx = puzzles.length;
  }

  // 确保范围有效
  startIdx = Math.max(0, Math.min(startIdx, puzzles.length - 1));
  endIdx = Math.max(startIdx + 1, Math.min(endIdx, puzzles.length));

  const available = puzzles.slice(startIdx, endIdx);
  if (available.length === 0) return null;

  const basePuzzle = available[Math.floor(Math.random() * available.length)];
  const transformed = getRandomTransformedPuzzle(basePuzzle, size);

  return {
    id: `${size}x${size}-${Math.random().toString(36).substring(2, 6)}`,
    size,
    difficulty,
    difficultyName: DIFFICULTY_NAME[difficulty] || '未知',
    types: transformed.t,
    solution: transformed.s,
  };
}

/** 转换为游戏格式 */
export function convertPuzzleEntry(puzzle: PuzzleEntry) {
  return {
    types: puzzle.types,
    solution: new Set(puzzle.solution),
    name: puzzle.id,
  };
}

/** 获取统计信息 */
export function getBankStats() {
  return {
    bySize: {
      5: PUZZLES_5X5.length,
      6: PUZZLES_6X6.length,
      7: PUZZLES_7X7.length,
      10: PUZZLES_10X10.length,
      12: PUZZLES_12X12.length,
    },
    total: PUZZLES_5X5.length + PUZZLES_6X6.length + PUZZLES_7X7.length + PUZZLES_10X10.length + PUZZLES_12X12.length,
  };
}
