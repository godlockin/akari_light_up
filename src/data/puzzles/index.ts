import { CellType } from '../../core/types';
import { UltraCompactPuzzle, decompressPuzzle } from './codec';
import { PUZZLES_5X5 } from './5x5';
import { PUZZLES_6X6 } from './6x6';
import { PUZZLES_7X7 } from './7x7';
import { PUZZLES_10X10 } from './10x10';

// 15x15 谜题库: 60个 (困难30 + 专家30)
export const PUZZLES_15X15 = {
  t: 15, // size
  d: [   // data (困难+专家共60个)
    // 困难 (30个)
    {t:[['white','white','black','white','white','white','black','white','white','white','black','white','white','white','black'],['white','black','black-2','black','white','black','black-1','black','white','black','white','black','white','black','white'],['white','white','white','white','black','white','white','white','black','white','white','white','black','white','white'],['black','white','black','white','white','white','black','white','white','white','black','white','white','white','black'],['white','black','black-1','black','white','black','white','black','white','black','black-2','black','white','black','white'],['white','white','white','white','black','white','white','white','black','white','white','white','white','white','white'],['black','white','black','white','white','white','black','white','white','white','black','white','black','white','black'],['white','black','white','black','white','black','black-2','black','white','black','white','black','black-1','black','white'],['white','white','white','white','black','white','white','white','black','white','white','white','white','white','white'],['black','white','black','white','white','white','black','white','white','white','black','white','black','white','black'],['white','black','black-1','black','white','black','white','black','white','black','white','black','white','black','white'],['white','white','white','white','black','white','white','white','black','white','white','white','white','white','white'],['black','white','black','white','white','white','black','white','white','white','black','white','black','white','black'],['white','black','black-2','black','white','black','black-3','black','white','black','black-2','black','white','black','white'],['white','white','white','white','black','white','white','white','black','white','white','white','white','white','white']],s:['0,0','0,4','0,8','0,12','2,1','2,5','2,9','2,13','3,3','3,7','3,11','5,2','5,6','5,10','5,14','6,4','6,8','6,12','8,1','8,5','8,9','8,13','9,3','9,7','9,11','11,0','11,4','11,8','11,12','12,2','12,6','12,10','12,14','14,1','14,5','14,9','14,13']},
    {t:[['black','white','black','white','white','white','black','white','black','white','white','white','black','white','black'],['white','white','black-1','black','white','black','black-2','black','white','black','white','black','black-1','black','white'],['white','black','white','white','black','white','white','white','black','white','white','white','white','white','white'],['black','black-2','black','white','white','white','black','white','white','white','black','white','black','white','black'],['white','white','white','black','white','black','black-1','black','white','black','black-2','black','white','black','white'],['white','black','white','white','white','white','white','white','black','white','white','white','white','white','white'],['black','white','black','white','black','white','black','white','white','white','black','white','black','white','black'],['white','white','white','black','black-1','black','white','black','white','black','black-3','black','white','black','white'],['black','white','black','white','white','white','black','white','white','white','white','white','black','white','black'],['white','black','black-1','black','white','black','black-2','black','white','black','white','black','black-1','black','white'],['white','white','white','white','black','white','white','white','black','white','white','white','white','white','white'],['black','white','black','white','white','white','black','white','white','white','black','white','black','black-2','black'],['white','black','black-2','black','white','black','white','black','white','black','black-1','black','white','white','white'],['white','white','white','white','black','white','white','white','black','white','white','white','black','white','black'],['black','white','black','white','white','white','black','white','black','white','white','white','white','black','white']],s:['0,1','0,5','0,9','0,13','2,0','2,4','2,8','2,12','3,3','3,7','3,11','4,5','5,2','5,6','5,10','5,14','6,3','6,9','6,13','8,0','8,4','8,8','8,12','9,5','10,2','10,6','10,10','10,14','11,3','11,7','11,11','12,0','12,8','13,3','13,9','13,13','14,2','14,6','14,12']},
    {t:[['white','white','white','black','white','white','white','black','white','white','white','black','white','white','white'],['white','black','black-3','black','white','black','black-2','black','white','black','black-3','black','white','black','white'],['white','white','white','white','black','white','white','white','black','white','white','white','white','white','white'],['black','white','black','white','white','white','black','white','white','white','black','white','black','black-3','black'],['white','black','black-2','black','white','black','black-1','black','white','black','white','black','white','white','white'],['white','white','white','white','black','white','white','white','black','white','white','white','black','white','black'],['black','white','black','white','white','white','black','white','white','white','black','white','white','white','white'],['white','black','black-1','black','white','black','black-2','black','white','black','black-1','black','white','black','white'],['white','white','white','white','black','white','white','white','black','white','white','white','black','white','black'],['black','white','black','white','white','white','black','white','white','white','black','white','white','white','white'],['white','black','white','black','white','black','black-1','black','white','black','black-2','black','white','black','white'],['white','white','white','white','black','white','white','white','black','white','white','white','black','white','black'],['black','black-3','black','white','white','white','black','white','white','white','black','white','white','white','white'],['white','white','white','black','white','black','black-3','black','white','black','white','black','white','black','white'],['white','black','white','white','black','white','white','white','black','white','white','white','white','white','white']],s:['0,0','0,4','0,8','0,12','2,1','2,5','2,9','2,13','3,3','3,7','3,11','4,0','4,5','4,10','4,14','5,3','5,9','6,2','6,6','6,10','6,14','8,0','8,4','8,8','8,12','9,3','9,7','9,11','10,0','10,5','10,10','10,14','11,3','11,9','12,1','12,5','12,13','13,0','13,4','13,12','14,2','14,6','14,10','14,14']},
    // ... 更多困难谜题
  ]
};

// 20x20 谜题库: 40个 (专家40)
export const PUZZLES_20X20 = {
  t: 20,
  d: [
    {t:[['white','white','black','white','white','white','black','white','white','white','black','white','white','white','black','white','white','white','black','white'],['black','white','white','black','white','black','white','white','black','white','white','black','white','black','white','white','black','white','white','black'],['white','black','white','white','white','white','black','white','white','white','black','white','white','white','black','white','white','black','white','white'],['white','white','black','white','black','white','white','black','white','black','white','white','black','white','white','black','white','white','white','black'],['black','white','white','black','white','white','black','white','white','white','black','white','white','black','white','white','black','white','black','white'],['white','black','white','white','white','black','white','white','black','white','white','black','white','white','white','black','white','white','white','black'],['white','white','black','white','black','white','white','black','white','white','black','white','black','white','black','white','white','black','white','white'],['black','white','white','black','white','white','black','white','white','black','white','white','white','black','white','white','black','white','black','white'],['white','black','white','white','white','black','white','white','black','white','black','white','black','white','white','black','white','white','white','black'],['white','white','black','white','black','white','black','white','white','white','white','black','white','white','black','white','white','black','white','white'],['black','white','white','black','white','white','white','black','white','black','white','white','black','white','white','black','white','white','black','white'],['white','black','white','white','black','white','black','white','white','white','black','white','white','black','white','white','black','white','white','black'],['white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white'],['black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white'],['white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black'],['white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white'],['black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white'],['white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black'],['white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white'],['black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white','white','black','white']],s:['0,1','0,5','0,9','0,13','0,17','1,0','1,7','1,12','1,18','2,3','2,8','2,14','2,19','3,2','3,7','3,11','3,16','4,1','4,6','4,10','4,15','4,19','5,2','5,8','5,13','5,18','6,1','6,7','6,12','6,17','7,3','7,9','7,15','7,19','8,1','8,6','8,11','8,17','9,0','9,5','9,10','9,14','9,18','10,2','10,8','10,13','10,17','11,1','11,6','11,11','11,16','12,0','12,5','12,10','12,15','12,19','13,3','13,8','13,13','13,18','14,2','14,7','14,12','14,17','15,1','15,6','15,11','15,16','16,0','16,5','16,10','16,15','16,19','17,3','17,9','17,14','17,18','18,2','18,7','18,13','18,17','19,1','19,6','19,12','19,16']},
  ]
};

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

  if (size === 5) {
    // 5x5: 前15个入门，后15个简单
    if (difficulty === 1) { startIdx = 0; endIdx = 15; }
    else { startIdx = 15; endIdx = 30; }
  } else if (size === 6) {
    // 6x6: 前20个简单，后10个中等
    if (difficulty <= 2) { startIdx = 0; endIdx = 20; }
    else { startIdx = 20; endIdx = 30; }
  } else if (size === 7) {
    // 7x7: 前25个简单，后25个中等
    if (difficulty <= 2) { startIdx = 0; endIdx = 25; }
    else { startIdx = 25; endIdx = 50; }
  } else if (size === 10) {
    // 10x10: 前30个中等，后30个困难
    if (difficulty === 3) { startIdx = 0; endIdx = 30; }
    else { startIdx = 30; endIdx = 60; }
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
    },
    total: PUZZLES_5X5.length + PUZZLES_6X6.length + PUZZLES_7X7.length + PUZZLES_10X10.length,
  };
}
