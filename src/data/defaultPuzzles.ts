import { CellType } from '../core/types';

/**
 * 默认谜题数据结构
 */
export interface DefaultPuzzle {
  id: string;
  size: number;
  difficulty: number;
  types: CellType[][];
  solution: string[];
  name: string;
}

/**
 * 预生成的默认谜题库
 * 当实时生成失败时作为 fallback 使用
 */
export const DEFAULT_PUZZLES: DefaultPuzzle[] = [
  // ========== 简单难度 (5x5) ==========
  {
    id: 'easy-5x5-001',
    size: 5,
    difficulty: 1,
    types: [
      ['white', 'white', 'white', 'white', 'white'],
      ['white', 'black-2', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'black-1', 'white'],
      ['white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'black-3', 'white', 'white'],
    ],
    solution: ['0,0', '0,3', '1,4', '2,1', '3,0', '3,3', '4,1', '4,4'],
    name: '入门 5x5 #1',
  },
  {
    id: 'easy-5x5-002',
    size: 5,
    difficulty: 1,
    types: [
      ['white', 'white', 'white', 'black-0', 'white'],
      ['white', 'black', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'black-2', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,1', '0,4', '1,3', '2,0', '2,2', '3,4', '4,1', '4,3'],
    name: '入门 5x5 #2',
  },
  {
    id: 'easy-6x6-001',
    size: 6,
    difficulty: 2,
    types: [
      ['white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'black-1', 'white', 'white', 'black-2', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'black-3', 'white', 'white', 'white'],
      ['white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,1', '0,4', '1,0', '1,5', '2,2', '3,0', '3,5', '4,3', '5,1', '5,4'],
    name: '简单 6x6 #1',
  },
  {
    id: 'easy-7x7-001',
    size: 7,
    difficulty: 2,
    types: [
      ['white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'black-2', 'white', 'white', 'white', 'black-1', 'white'],
      ['white', 'white', 'white', 'black', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'black-3', 'white', 'white', 'white'],
      ['white', 'black-0', 'white', 'white', 'white', 'black-2', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,1', '0,5', '1,3', '1,6', '2,0', '2,4', '3,2', '3,6', '4,1', '4,5', '5,3', '6,0', '6,4'],
    name: '简单 7x7 #1',
  },

  // ========== 中等难度 (10x10) ==========
  {
    id: 'medium-10x10-001',
    size: 10,
    difficulty: 3,
    types: [
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'black-2', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'black-1', 'white'],
      ['white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'black-3', 'white', 'white', 'black-2', 'white', 'white'],
      ['white', 'black-1', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white'],
      ['white', 'white', 'black-2', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'black-1', 'white', 'white', 'black-3', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,1', '0,4', '0,8', '1,3', '1,7', '2,1', '2,5', '2,9', '3,2', '3,6', '3,9',
               '4,1', '4,5', '4,8', '5,0', '5,4', '5,9', '6,2', '6,7', '7,1', '7,5', '7,8',
               '8,3', '8,7', '9,0', '9,5', '9,9'],
    name: '中等 10x10 #1',
  },
  {
    id: 'medium-10x10-002',
    size: 10,
    difficulty: 3,
    types: [
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'black', 'white', 'white', 'white', 'white', 'white', 'black-2', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'black-1', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'black-3', 'white', 'white', 'white', 'white', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'black-2', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'black-1', 'white', 'white', 'white', 'white', 'black-3', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'black-2', 'white', 'white', 'white', 'white', 'black-1', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,0', '0,3', '0,7', '1,2', '1,5', '1,9', '2,3', '2,8', '3,1', '3,5', '3,9',
               '4,3', '4,7', '5,0', '5,5', '5,8', '6,2', '6,6', '6,9', '7,1', '7,4', '7,8',
               '8,3', '8,6', '9,0', '9,5', '9,9'],
    name: '中等 10x10 #2',
  },

  // ========== 困难难度 (15x15) ==========
  {
    id: 'hard-15x15-001',
    size: 15,
    difficulty: 5,
    types: [
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'black', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'black-2', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'black-2', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white', 'black-1', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'black-3', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'black', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white', 'black-2', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white', 'black-1', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'black-3', 'white', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'black-2', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'black', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,2', '0,6', '0,10', '0,14', '1,1', '1,5', '1,9', '1,13',
               '2,3', '2,7', '2,12', '3,0', '3,5', '3,9', '3,13',
               '4,2', '4,6', '4,11', '4,14', '5,1', '5,4', '5,8', '5,12',
               '6,2', '6,6', '6,10', '6,14', '7,3', '7,8', '7,13',
               '8,1', '8,5', '8,10', '8,14', '9,2', '9,7', '9,12',
               '10,1', '10,5', '10,9', '10,13', '11,3', '11,7', '11,11',
               '12,1', '12,6', '12,10', '12,14', '13,3', '13,8', '13,12',
               '14,0', '14,5', '14,9', '14,14'],
    name: '困难 15x15 #1',
  },
  {
    id: 'hard-15x15-002',
    size: 15,
    difficulty: 5,
    types: [
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'black-1', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'black-2', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'black', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'black-3', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'black-2', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'black-2', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'black-1', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
    ],
    solution: ['0,1', '0,5', '0,9', '0,13', '1,3', '1,7', '1,11', '1,14',
               '2,0', '2,4', '2,8', '2,12', '3,2', '3,6', '3,10', '3,14',
               '4,1', '4,5', '4,9', '4,13', '5,3', '5,7', '5,11', '5,14',
               '6,2', '6,6', '6,10', '6,14', '7,1', '7,5', '7,9', '7,13',
               '8,3', '8,7', '8,12', '9,1', '9,5', '9,10', '9,14',
               '10,2', '10,6', '10,9', '10,13', '11,1', '11,5', '11,8', '11,12',
               '12,3', '12,7', '12,11', '12,14', '13,2', '13,6', '13,10', '13,14',
               '14,1', '14,5', '14,9', '14,13'],
    name: '困难 15x15 #2',
  },
];

/**
 * 获取默认谜题
 * @param size 期望的棋盘大小
 * @param difficulty 难度等级
 * @returns 匹配的默认谜题，如果没有则返回 null
 */
export function getDefaultPuzzle(
  size: number,
  difficulty: number
): DefaultPuzzle | null {
  // 根据难度选择合适的尺寸范围
  let targetSizes: number[];
  if (difficulty <= 2) {
    targetSizes = [5, 6, 7];
  } else if (difficulty === 3) {
    targetSizes = [10];
  } else {
    targetSizes = [15, 20, 25];
  }

  // 优先找完全匹配的
  let candidates = DEFAULT_PUZZLES.filter(
    (p) => p.size === size && p.difficulty === difficulty
  );

  // 如果没有完全匹配，找尺寸在目标范围内的
  if (candidates.length === 0) {
    candidates = DEFAULT_PUZZLES.filter(
      (p) => targetSizes.includes(p.size) && p.difficulty === difficulty
    );
  }

  // 如果还是没有，找同难度最近的
  if (candidates.length === 0) {
    candidates = DEFAULT_PUZZLES.filter((p) => p.difficulty === difficulty);
  }

  if (candidates.length === 0) return null;

  // 随机返回一个候选
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * 转换默认谜题格式以适配游戏逻辑
 */
export function convertDefaultPuzzle(puzzle: DefaultPuzzle): {
  types: CellType[][];
  solution: Set<string>;
} {
  return {
    types: puzzle.types,
    solution: new Set(puzzle.solution),
  };
}

/**
 * 检查是否有可用的默认谜题
 */
export function hasDefaultPuzzle(size: number, difficulty: number): boolean {
  return getDefaultPuzzle(size, difficulty) !== null;
}
