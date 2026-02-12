/**
 * 预生成谜题库
 * 包含多种难度和尺寸的谜题，支持棋盘变换（旋转+翻转）
 */
import { CellType } from '../core/types';

export interface PuzzleEntry {
  id: string;
  size: number;
  difficulty: number;
  difficultyName: string;
  types: CellType[][];
  solution: string[];
  blackCount: number;
  numberedCount: number;
  bulbCount: number;
}

// ==================== 棋盘变换工具函数 ====================

/**
 * 旋转 types 矩阵 90 度顺时针
 */
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

/**
 * 水平翻转 types 矩阵
 */
function flipTypesHorizontal(types: CellType[][]): CellType[][] {
  return types.map(row => [...row].reverse());
}

/**
 * 垂直翻转 types 矩阵
 */
function flipTypesVertical(types: CellType[][]): CellType[][] {
  return [...types].reverse();
}

/**
 * 旋转位置 90 度顺时针
 */
function rotatePos90(pos: string, size: number): string {
  const [r, c] = pos.split(',').map(Number);
  return `${c},${size - 1 - r}`;
}

/**
 * 水平翻转位置
 */
function flipPosHorizontal(pos: string, size: number): string {
  const [r, c] = pos.split(',').map(Number);
  return `${r},${size - 1 - c}`;
}

/**
 * 垂直翻转位置
 */
function flipPosVertical(pos: string, size: number): string {
  const [r, c] = pos.split(',').map(Number);
  return `${size - 1 - r},${c}`;
}

/**
 * 应用变换到谜题
 * @param puzzle 原始谜题
 * @param rotation 旋转次数（0-3，每次90度）
 * @param flipH 是否水平翻转
 * @param flipV 是否垂直翻转
 */
export function transformPuzzle(
  puzzle: PuzzleEntry,
  rotation: number = 0,
  flipH: boolean = false,
  flipV: boolean = false
): PuzzleEntry {
  let types = puzzle.types.map(row => [...row]);
  let solution = [...puzzle.solution];
  const size = puzzle.size;

  // 应用水平翻转
  if (flipH) {
    types = flipTypesHorizontal(types);
    solution = solution.map(pos => flipPosHorizontal(pos, size));
  }

  // 应用垂直翻转
  if (flipV) {
    types = flipTypesVertical(types);
    solution = solution.map(pos => flipPosVertical(pos, size));
  }

  // 应用旋转
  const rotations = ((rotation % 4) + 4) % 4;
  for (let i = 0; i < rotations; i++) {
    types = rotateTypes90(types);
    solution = solution.map(pos => rotatePos90(pos, size));
  }

  const transformSuffix = `
    ${rotation > 0 ? `R${rotation * 90}` : ''}
    ${flipH ? 'H' : ''}
    ${flipV ? 'V' : ''}
  `.trim() || 'original';

  return {
    ...puzzle,
    id: `${puzzle.id}(${transformSuffix})`,
    types,
    solution,
  };
}

/**
 * 获取随机变换的谜题
 * 1 个基础谜题可以通过变换生成 32 种不同形态（4旋转 × 2水平 × 2垂直，但有重复）
 * 实际上不同的形态约有 8 种
 */
export function getRandomTransformedPuzzle(puzzle: PuzzleEntry): PuzzleEntry {
  const rotation = Math.floor(Math.random() * 4); // 0, 1, 2, 3
  const flipH = Math.random() < 0.5;
  const flipV = Math.random() < 0.5;
  return transformPuzzle(puzzle, rotation, flipH, flipV);
}

/**
 * 获取一个谜题的所有唯一变换形态
 */
export function getAllUniqueTransforms(puzzle: PuzzleEntry): PuzzleEntry[] {
  const transforms: PuzzleEntry[] = [];
  const seen = new Set<string>();

  for (let r = 0; r < 4; r++) {
    for (let fh = 0; fh < 2; fh++) {
      for (let fv = 0; fv < 2; fv++) {
        const transformed = transformPuzzle(puzzle, r, fh === 1, fv === 1);
        const key = JSON.stringify(transformed.types);
        if (!seen.has(key)) {
          seen.add(key);
          transforms.push(transformed);
        }
      }
    }
  }

  return transforms;
}

// ==================== 基础谜题库 ====================

// 精简但高质量的基础谜题库 (18个核心谜题)
// 每个可以通过变换生成多种形态
const BASE_PUZZLES: PuzzleEntry[] = [
  // ========== 5x5 入门 (3个基础，变出约24种) ==========
  {
    id: '入门-5x5-A',
    size: 5,
    difficulty: 1,
    difficultyName: '入门',
    types: [
      ['black', 'black-0', 'black', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white'],
      ['black', 'black-3', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'black', 'white', 'white'],
    ],
    solution: ['1,1', '1,4', '3,0', '3,3', '4,1', '4,4'],
    blackCount: 5,
    numberedCount: 4,
    bulbCount: 6,
  },
  {
    id: '入门-5x5-B',
    size: 5,
    difficulty: 1,
    difficultyName: '入门',
    types: [
      ['white', 'white', 'black', 'white', 'white'],
      ['white', 'black', 'black-4', 'black', 'white'],
      ['black', 'black-0', 'white', 'black-0', 'black'],
      ['white', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'black', 'white', 'white'],
    ],
    solution: ['0,0', '0,4', '2,2', '4,0', '4,4'],
    blackCount: 8,
    numberedCount: 6,
    bulbCount: 5,
  },
  {
    id: '入门-5x5-C',
    size: 5,
    difficulty: 1,
    difficultyName: '入门',
    types: [
      ['white', 'white', 'white', 'white', 'white'],
      ['black', 'black-3', 'black', 'white', 'black'],
      ['white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'black-2', 'black'],
      ['white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,1', '0,4', '2,0', '2,3', '4,1', '4,4'],
    blackCount: 6,
    numberedCount: 4,
    bulbCount: 6,
  },

  // ========== 7x7 简单 (3个基础) ==========
  {
    id: '简单-7x7-A',
    size: 7,
    difficulty: 2,
    difficultyName: '简单',
    types: [
      ['white', 'white', 'black', 'white', 'black', 'white', 'white'],
      ['black', 'black-3', 'black', 'white', 'black-0', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['white', 'black', 'black-4', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['black', 'black-0', 'black', 'white', 'black', 'black-2', 'black'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,0', '0,3', '0,6', '2,1', '2,4', '2,6', '4,0', '4,2', '4,4', '6,1', '6,3', '6,5'],
    blackCount: 13,
    numberedCount: 8,
    bulbCount: 12,
  },
  {
    id: '简单-7x7-B',
    size: 7,
    difficulty: 2,
    difficultyName: '简单',
    types: [
      ['white', 'white', 'white', 'black', 'white', 'white', 'white'],
      ['white', 'black', 'black-4', 'black', 'black-2', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'black-0', 'black', 'white', 'black'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'black', 'black-1', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'black', 'white', 'white', 'white'],
    ],
    solution: ['0,0', '0,3', '0,6', '2,1', '2,4', '2,6', '4,0', '4,3', '4,5', '6,0', '6,3', '6,6'],
    blackCount: 14,
    numberedCount: 8,
    bulbCount: 12,
  },
  {
    id: '简单-7x7-C',
    size: 7,
    difficulty: 2,
    difficultyName: '简单',
    types: [
      ['black', 'white', 'black', 'black-0', 'black', 'white', 'black'],
      ['white', 'white', 'white', 'black', 'white', 'white', 'white'],
      ['white', 'black', 'black-3', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'black-2', 'black'],
      ['black', 'white', 'black', 'white', 'black', 'black', 'white'],
      ['black-0', 'black', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'black', 'white', 'black'],
    ],
    solution: ['0,1', '0,5', '1,3', '2,0', '2,5', '3,2', '4,3', '4,6', '5,2', '5,5', '6,1', '6,3', '6,5'],
    blackCount: 17,
    numberedCount: 7,
    bulbCount: 13,
  },

  // ========== 10x10 中等 (4个基础) ==========
  {
    id: '中等-10x10-A',
    size: 10,
    difficulty: 3,
    difficultyName: '中等',
    types: [
      ['white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['white', 'black', 'black-2', 'black', 'white', 'black', 'black-3', 'black', 'white', 'black'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white'],
      ['black-0', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'black-2', 'black'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white'],
      ['white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'black'],
      ['white', 'black', 'black-1', 'black', 'white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'black-2', 'black', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,0', '0,4', '0,7', '0,9', '2,1', '2,3', '2,6', '2,8', '3,3', '4,2', '4,5', '4,8', '5,1', '5,4', '5,9', '6,2', '6,6', '7,4', '7,8', '8,0', '8,3', '8,6', '9,1', '9,4', '9,9'],
    blackCount: 22,
    numberedCount: 10,
    bulbCount: 25,
  },
  {
    id: '中等-10x10-B',
    size: 10,
    difficulty: 3,
    difficultyName: '中等',
    types: [
      ['white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['white', 'black', 'black-3', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'black', 'black-1', 'black', 'white', 'black', 'white', 'black', 'black-1', 'black'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'black', 'black-0', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white'],
    ],
    solution: ['0,0', '0,4', '0,6', '0,9', '2,1', '2,3', '2,5', '2,8', '3,2', '3,6', '3,9', '5,0', '5,3', '5,7', '6,2', '6,6', '8,1', '8,4', '8,8', '9,0', '9,3', '9,9'],
    blackCount: 26,
    numberedCount: 10,
    bulbCount: 22,
  },
  {
    id: '中等-10x10-C',
    size: 10,
    difficulty: 3,
    difficultyName: '中等',
    types: [
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'black-2', 'black', 'white', 'black', 'black-1', 'black', 'white', 'white'],
      ['white', 'black', 'black', 'white', 'white', 'white', 'white', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black-2', 'black'],
      ['black', 'white', 'black', 'black-1', 'black', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'black', 'black-2', 'black', 'white', 'white'],
      ['white', 'black', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white'],
      ['white', 'black-2', 'black', 'white', 'black', 'white', 'black', 'white', 'white', 'white'],
      ['black', 'white', 'white', 'white', 'white', 'black', 'white', 'black', 'black-3', 'black'],
      ['white', 'white', 'black', 'white', 'black', 'white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,1', '0,4', '0,7', '1,0', '1,6', '2,3', '2,7', '3,0', '3,5', '4,2', '4,8', '5,1', '5,4', '5,9', '6,2', '6,6', '7,3', '7,8', '8,1', '8,7', '9,0', '9,3', '9,6', '9,9'],
    blackCount: 26,
    numberedCount: 10,
    bulbCount: 24,
  },
  {
    id: '中等-10x10-D',
    size: 10,
    difficulty: 3,
    difficultyName: '中等',
    types: [
      ['white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['white', 'black', 'black-4', 'black', 'white', 'black', 'black-3', 'black', 'white', 'black'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'black', 'black-0', 'black', 'white', 'black', 'white', 'black', 'black-1', 'black'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'black', 'black-2', 'black', 'white', 'black', 'black-3', 'black', 'white', 'black'],
      ['white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white'],
    ],
    solution: ['0,0', '0,5', '0,9', '2,0', '2,3', '2,6', '2,9', '3,2', '3,5', '3,8', '5,1', '5,4', '5,7', '6,0', '6,3', '6,6', '6,9', '8,1', '8,4', '8,7', '9,0', '9,3', '9,9'],
    blackCount: 28,
    numberedCount: 10,
    bulbCount: 23,
  },

  // ========== 15x15 困难 (4个基础) ==========
  {
    id: '困难-15x15-A',
    size: 15,
    difficulty: 4,
    difficultyName: '困难',
    types: [
      ['white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black'],
      ['white', 'black', 'black-2', 'black', 'white', 'black', 'black-1', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black'],
      ['white', 'black', 'black-1', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'black'],
      ['white', 'black', 'white', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'white', 'black', 'black-1', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'black'],
      ['white', 'black', 'black-1', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'black'],
      ['white', 'black', 'black-2', 'black', 'white', 'black', 'black-3', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,0', '0,4', '0,8', '0,12', '2,1', '2,5', '2,9', '2,13', '3,3', '3,7', '3,11', '5,2', '5,6', '5,10', '5,14', '6,4', '6,8', '6,12', '8,1', '8,5', '8,9', '8,13', '9,3', '9,7', '9,11', '11,0', '11,4', '11,8', '11,12', '12,2', '12,6', '12,10', '12,14', '14,1', '14,5', '14,9', '14,13'],
    blackCount: 42,
    numberedCount: 16,
    bulbCount: 37,
  },
  {
    id: '困难-15x15-B',
    size: 15,
    difficulty: 4,
    difficultyName: '困难',
    types: [
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black'],
      ['white', 'white', 'black-1', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'white', 'black', 'black-1', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'black-2', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'black'],
      ['white', 'white', 'white', 'black', 'white', 'black', 'black-1', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'black'],
      ['white', 'white', 'white', 'black', 'black-1', 'black', 'white', 'black', 'white', 'black', 'black-3', 'black', 'white', 'black', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'black', 'white', 'black'],
      ['white', 'black', 'black-1', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'white', 'black', 'black-1', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'black-2', 'black'],
      ['white', 'black', 'black-2', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'black-1', 'black', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white'],
    ],
    solution: ['0,1', '0,5', '0,9', '0,13', '2,0', '2,4', '2,8', '2,12', '3,3', '3,7', '3,11', '4,5', '5,2', '5,6', '5,10', '5,14', '6,3', '6,9', '6,13', '8,0', '8,4', '8,8', '8,12', '9,5', '10,2', '10,6', '10,10', '10,14', '11,3', '11,7', '11,11', '12,0', '12,8', '13,3', '13,9', '13,13', '14,2', '14,6', '14,12'],
    blackCount: 44,
    numberedCount: 18,
    bulbCount: 39,
  },
  {
    id: '困难-15x15-C',
    size: 15,
    difficulty: 4,
    difficultyName: '困难',
    types: [
      ['white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white'],
      ['white', 'black', 'black-3', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'black-3', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'black-3', 'black'],
      ['white', 'black', 'black-2', 'black', 'white', 'black', 'black-1', 'black', 'white', 'black', 'white', 'black', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'black', 'black-1', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'black-1', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'black', 'white', 'black', 'white', 'black', 'black-1', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black'],
      ['black', 'black-3', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'black', 'white', 'black', 'black-3', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,0', '0,4', '0,8', '0,12', '2,1', '2,5', '2,9', '2,13', '3,3', '3,7', '3,11', '4,0', '4,5', '4,10', '4,14', '5,3', '5,9', '6,2', '6,6', '6,10', '6,14', '8,0', '8,4', '8,8', '8,12', '9,3', '9,7', '9,11', '10,0', '10,5', '10,10', '10,14', '11,3', '11,9', '12,1', '12,5', '12,13', '13,0', '13,4', '13,12', '14,2', '14,6', '14,10', '14,14'],
    blackCount: 44,
    numberedCount: 18,
    bulbCount: 44,
  },
  {
    id: '困难-15x15-D',
    size: 15,
    difficulty: 4,
    difficultyName: '困难',
    types: [
      ['black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['white', 'black', 'black-2', 'black', 'white', 'black', 'black-3', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'black-2', 'black'],
      ['white', 'black', 'black-1', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'black-1', 'black', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'black', 'black-0', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'black', 'black-2', 'black', 'white', 'black', 'black-1', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black'],
      ['black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'black', 'black-1', 'black', 'white', 'black', 'black-3', 'black', 'white', 'black', 'black-2', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white'],
    ],
    solution: ['0,1', '0,5', '0,9', '0,13', '2,0', '2,4', '2,8', '2,12', '3,3', '3,7', '3,11', '4,5', '4,10', '5,2', '5,6', '5,14', '6,1', '6,9', '6,13', '8,0', '8,4', '8,8', '8,12', '9,3', '9,7', '9,11', '10,0', '10,5', '10,10', '10,14', '11,3', '11,9', '12,2', '12,6', '12,12', '13,0', '13,5', '13,14', '14,2', '14,7', '14,10'],
    blackCount: 44,
    numberedCount: 19,
    bulbCount: 41,
  },

  // ========== 20x20 专家 (4个基础) ==========
  {
    id: '专家-20x20-A',
    size: 20,
    difficulty: 5,
    difficultyName: '专家',
    types: [
      ['white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
    ],
    solution: ['0,1', '0,5', '0,9', '0,13', '0,17', '1,0', '1,7', '1,12', '1,18', '2,3', '2,8', '2,14', '2,19', '3,2', '3,7', '3,11', '3,16', '4,1', '4,6', '4,10', '4,15', '4,19', '5,2', '5,8', '5,13', '5,18', '6,1', '6,7', '6,12', '6,17', '7,3', '7,9', '7,15', '7,19', '8,1', '8,6', '8,11', '8,17', '9,0', '9,5', '9,10', '9,14', '9,18', '10,2', '10,8', '10,13', '10,17', '11,1', '11,6', '11,11', '11,16', '12,0', '12,5', '12,10', '12,15', '12,19', '13,3', '13,8', '13,13', '13,18', '14,2', '14,7', '14,12', '14,17', '15,1', '15,6', '15,11', '15,16', '16,0', '16,5', '16,10', '16,15', '16,19', '17,3', '17,9', '17,14', '17,18', '18,2', '18,7', '18,13', '18,17', '19,1', '19,6', '19,12', '19,16'],
    blackCount: 72,
    numberedCount: 0,
    bulbCount: 85,
  },
  {
    id: '专家-20x20-B',
    size: 20,
    difficulty: 5,
    difficultyName: '专家',
    types: [
      ['black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['white', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'black', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
    ],
    solution: ['0,1', '0,6', '0,11', '0,16', '1,3', '1,9', '1,14', '1,19', '2,1', '2,6', '2,12', '2,17', '3,2', '3,8', '3,13', '3,18', '4,0', '4,7', '4,11', '4,16', '5,2', '5,9', '5,15', '5,19', '6,1', '6,6', '6,12', '6,17', '7,3', '7,10', '7,15', '8,1', '8,8', '8,13', '8,18', '9,2', '9,7', '9,12', '9,17', '10,0', '10,6', '10,11', '10,16', '11,2', '11,9', '11,14', '11,19', '12,1', '12,7', '12,12', '12,17', '13,3', '13,9', '13,15', '14,1', '14,6', '14,11', '14,16', '15,2', '15,8', '15,13', '15,18', '16,0', '16,7', '16,12', '16,17', '17,3', '17,10', '17,15', '18,1', '18,6', '18,13', '18,18', '19,2', '19,9', '19,14', '19,19'],
    blackCount: 76,
    numberedCount: 0,
    bulbCount: 80,
  },
  {
    id: '专家-20x20-C',
    size: 20,
    difficulty: 5,
    difficultyName: '专家',
    types: [
      ['white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white'],
      ['black', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'white', 'black', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['black', 'white', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'white'],
      ['white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
    ],
    solution: ['0,0', '0,5', '0,10', '0,15', '0,19', '1,2', '1,7', '1,12', '1,18', '2,4', '2,9', '2,14', '2,19', '3,1', '3,6', '3,11', '3,16', '4,0', '4,5', '4,10', '4,15', '4,19', '5,3', '5,8', '5,13', '5,17', '6,1', '6,7', '6,12', '6,18', '7,0', '7,5', '7,10', '7,15', '7,19', '8,2', '8,9', '8,14', '9,1', '9,6', '9,12', '9,17', '10,0', '10,5', '10,10', '10,15', '11,2', '11,8', '11,13', '11,18', '12,1', '12,6', '12,11', '12,16', '12,19', '13,0', '13,5', '13,10', '13,15', '14,2', '14,8', '14,14', '14,18', '15,1', '15,7', '15,13', '15,19', '16,0', '16,6', '16,12', '16,17', '17,3', '17,10', '17,15', '18,2', '18,8', '18,14', '18,19', '19,1', '19,6', '19,12', '19,17'],
    blackCount: 80,
    numberedCount: 0,
    bulbCount: 84,
  },
  {
    id: '专家-20x20-D',
    size: 20,
    difficulty: 5,
    difficultyName: '专家',
    types: [
      ['white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white'],
      ['white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black'],
      ['black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white'],
      ['white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'white'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'black'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white'],
      ['black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white'],
      ['white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black', 'white', 'white', 'black'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white'],
    ],
    solution: ['0,0', '0,6', '0,12', '0,18', '1,1', '1,8', '1,15', '2,3', '2,10', '2,17', '3,0', '3,7', '3,14', '4,2', '4,9', '4,16', '5,1', '5,8', '5,15', '5,19', '6,3', '6,11', '6,18', '7,0', '7,9', '7,17', '8,2', '8,10', '8,16', '9,1', '9,8', '9,14', '9,19', '10,2', '10,9', '10,15', '11,3', '11,11', '11,18', '12,1', '12,8', '12,15', '12,19', '13,0', '13,7', '13,14', '14,2', '14,10', '14,17', '15,1', '15,9', '15,18', '16,3', '16,12', '16,19', '17,0', '17,8', '17,17', '18,2', '18,11', '19,1', '19,10', '19,19'],
    blackCount: 74,
    numberedCount: 0,
    bulbCount: 63,
  },
];

// ==================== 导出扩展谜题库 ====================

/**
 * 获取指定难度和尺寸的随机谜题（带随机变换）
 */
export function getRandomPuzzleFromBank(
  size: number,
  difficulty: number
): PuzzleEntry | null {
  // 首先尝试精确匹配
  let candidates = BASE_PUZZLES.filter(
    (p) => p.size === size && p.difficulty === difficulty
  );

  // 如果没有精确匹配，尝试同尺寸不同难度
  if (candidates.length === 0) {
    candidates = BASE_PUZZLES.filter((p) => p.size === size);
  }

  // 如果还是没有，尝试同难度不同尺寸
  if (candidates.length === 0) {
    candidates = BASE_PUZZLES.filter((p) => p.difficulty === difficulty);
  }

  // 如果还是没有，使用所有基础谜题
  if (candidates.length === 0) {
    candidates = BASE_PUZZLES;
  }

  // 随机选择一个基础谜题
  const basePuzzle = candidates[Math.floor(Math.random() * candidates.length)];

  // 应用随机变换
  return getRandomTransformedPuzzle(basePuzzle);
}

/**
 * 根据条件获取谜题列表
 */
export function getPuzzlesByCriteria(
  size?: number,
  difficulty?: number
): PuzzleEntry[] {
  return BASE_PUZZLES.filter((p) => {
    if (size !== undefined && p.size !== size) return false;
    if (difficulty !== undefined && p.difficulty !== difficulty) return false;
    return true;
  });
}

/**
 * 转换PuzzleEntry为游戏所需格式
 */
export interface ConvertedPuzzle {
  types: CellType[][];
  solution: Set<string>;
  name: string;
}

export function convertPuzzleEntry(puzzle: PuzzleEntry): ConvertedPuzzle {
  return {
    types: puzzle.types,
    solution: new Set(puzzle.solution),
    name: puzzle.id,
  };
}

/**
 * 获取谜题库统计信息
 */
export function getBankStats(): {
  total: number;
  uniqueTransforms: number;
  bySize: Record<number, number>;
  byDifficulty: Record<number, number>;
} {
  // 计算所有唯一变换的总数
  let totalUniqueTransforms = 0;
  for (const puzzle of BASE_PUZZLES) {
    const transforms = getAllUniqueTransforms(puzzle);
    totalUniqueTransforms += transforms.length;
  }

  const stats = {
    total: BASE_PUZZLES.length,
    uniqueTransforms: totalUniqueTransforms,
    bySize: {} as Record<number, number>,
    byDifficulty: {} as Record<number, number>,
  };

  for (const puzzle of BASE_PUZZLES) {
    stats.bySize[puzzle.size] = (stats.bySize[puzzle.size] || 0) + 1;
    stats.byDifficulty[puzzle.difficulty] =
      (stats.byDifficulty[puzzle.difficulty] || 0) + 1;
  }

  return stats;
}

/**
 * 导出默认谜题（保持与旧版兼容）
 */
export function getDefaultPuzzle(
  size: number,
  difficulty: number
): ConvertedPuzzle | null {
  const puzzle = getRandomPuzzleFromBank(size, difficulty);
  return puzzle ? convertPuzzleEntry(puzzle) : null;
}

// 导出基础谜题库供高级使用
export { BASE_PUZZLES };
