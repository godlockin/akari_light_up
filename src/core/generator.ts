import {
  CellType,
  Position,
  posToString,
  stringToPos,
} from './types';
import { solve } from './solver';

/**
 * 难度配置 - 按照用户规范
 */
const DIFFICULTY_PROFILES = {
  // 简单: 5-7x5-7, 15%黑格, 给满数字(多用0,3,4)
  easy: {
    sizeRange: [5, 7] as [number, number],
    blackRatio: 0.15,
    clueDensity: 1.0,
  },
  // 中等: 10x10, 20%黑格, 删掉30%数字, 多留1,2
  medium: {
    sizeRange: [10, 10] as [number, number],
    blackRatio: 0.20,
    clueDensity: 0.70,
  },
  // 困难: 15x15以上, 22%黑格, 删掉60%数字, 大量无数字黑格
  hard: {
    sizeRange: [15, 25] as [number, number],
    blackRatio: 0.22,
    clueDensity: 0.40,
  },
};

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 获取某位置能照亮的所有格子
 */
function getIlluminatedFrom(
  size: number,
  row: number,
  col: number,
  blackCells: Set<string>
): Set<string> {
  const result = new Set<string>();
  result.add(posToString(row, col));

  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  for (const dir of directions) {
    let r = row + dir.dr;
    let c = col + dir.dc;
    while (r >= 0 && r < size && c >= 0 && c < size) {
      const key = posToString(r, c);
      if (blackCells.has(key)) break;
      result.add(key);
      r += dir.dr;
      c += dir.dc;
    }
  }

  return result;
}

/**
 * 生成黑格 - 避免2x2全黑和全黑边框
 */
function generateBlackCells(
  size: number,
  ratio: number
): Set<string> {
  const blackCells = new Set<string>();
  const targetCount = Math.floor(size * size * ratio);

  // 所有可能的格子（排除边框）
  const candidates: Position[] = [];
  for (let r = 1; r < size - 1; r++) {
    for (let c = 1; c < size - 1; c++) {
      candidates.push({ row: r, col: c });
    }
  }

  const shuffled = shuffle(candidates);

  for (const pos of shuffled) {
    if (blackCells.size >= targetCount) break;

    // 检查是否形成2x2黑格块
    const neighbors = [
      { r: pos.row - 1, c: pos.col },
      { r: pos.row + 1, c: pos.col },
      { r: pos.row, c: pos.col - 1 },
      { r: pos.row, c: pos.col + 1 },
      { r: pos.row - 1, c: pos.col - 1 },
      { r: pos.row - 1, c: pos.col + 1 },
      { r: pos.row + 1, c: pos.col - 1 },
      { r: pos.row + 1, c: pos.col + 1 },
    ];

    let wouldForm2x2 = false;
    for (const n of neighbors) {
      const key1 = posToString(n.r, pos.col);
      const key2 = posToString(pos.row, n.c);
      if (blackCells.has(key1) && blackCells.has(key2)) {
        wouldForm2x2 = true;
        break;
      }
    }

    if (!wouldForm2x2) {
      blackCells.add(posToString(pos.row, pos.col));
    }
  }

  return blackCells;
}

/**
 * 贪心放置灯泡 - 确保全覆盖且不冲突
 */
function placeBulbs(
  size: number,
  blackCells: Set<string>
): Set<string> | null {
  const bulbs = new Set<string>();
  const illuminated = new Set<string>();

  // 所有白格
  const whiteCells: Position[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const key = posToString(r, c);
      if (!blackCells.has(key)) {
        whiteCells.push({ row: r, col: c });
      }
    }
  }

  // 最大覆盖贪心
  while (illuminated.size < whiteCells.length) {
    let bestPos: Position | null = null;
    let bestCoverage = 0;

    for (const pos of whiteCells) {
      const key = posToString(pos.row, pos.col);
      if (bulbs.has(key)) continue;

      const coverage = getIlluminatedFrom(size, pos.row, pos.col, blackCells);
      let uncoveredCount = 0;
      for (const cell of coverage) {
        if (!blackCells.has(cell) && !illuminated.has(cell)) {
          uncoveredCount++;
        }
      }

      if (uncoveredCount > bestCoverage) {
        bestCoverage = uncoveredCount;
        bestPos = pos;
      }
    }

    // 如果没有找到能覆盖新格子的位置，找第一个未照亮的
    if (!bestPos || bestCoverage === 0) {
      for (const pos of whiteCells) {
        const key = posToString(pos.row, pos.col);
        if (!illuminated.has(key) && !bulbs.has(key)) {
          bestPos = pos;
          break;
        }
      }
    }

    if (!bestPos) return null; // 无法完成

    const key = posToString(bestPos.row, bestPos.col);
    bulbs.add(key);

    const newlyLit = getIlluminatedFrom(size, bestPos.row, bestPos.col, blackCells);
    for (const cell of newlyLit) {
      if (!blackCells.has(cell)) {
        illuminated.add(cell);
      }
    }
  }

  return bulbs;
}

/**
 * 根据难度配置推导数字
 */
function deriveNumbers(
  size: number,
  types: CellType[][],
  blackCells: Set<string>,
  bulbs: Set<string>,
  profile: { sizeRange: [number, number]; blackRatio: number; clueDensity: number }
): void {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  // 统计每个黑格相邻的灯数量
  const blackWithNumbers: { pos: Position; count: number }[] = [];

  for (const key of blackCells) {
    const pos = stringToPos(key);
    let count = 0;
    for (const [dr, dc] of directions) {
      const r = pos.row + dr;
      const c = pos.col + dc;
      if (r >= 0 && r < size && c >= 0 && c < size) {
        if (bulbs.has(posToString(r, c))) count++;
      }
    }
    blackWithNumbers.push({ pos, count });
  }

  // 根据难度配置决定显示哪些数字
  if (profile.clueDensity === 1.0) {
    // 简单：给满数字，优先0,3,4
    const prioritized = shuffle(blackWithNumbers.filter(b => b.count === 0 || b.count >= 3))
      .concat(shuffle(blackWithNumbers.filter(b => b.count >= 1 && b.count <= 2)));

    for (const { pos, count } of prioritized) {
      if (count <= 4) {
        types[pos.row][pos.col] = `black-${count}` as CellType;
      }
    }
  } else {
    // 中等/困难：按密度保留
    const shuffled = shuffle(blackWithNumbers);
    const showCount = Math.max(1, Math.floor(shuffled.length * profile.clueDensity));

    for (let i = 0; i < shuffled.length; i++) {
      const { pos, count } = shuffled[i];
      if (i < showCount && count <= 4) {
        types[pos.row][pos.col] = `black-${count}` as CellType;
      }
    }
  }
}

/**
 * 验证谜题有唯一解
 */
function validatePuzzle(types: CellType[][]): boolean {
  const result = solve(types);
  return result.solvable && result.unique;
}

/**
 * 单次生成尝试
 */
function generateAttempt(
  size: number,
  profile: { sizeRange: [number, number]; blackRatio: number; clueDensity: number }
): { types: CellType[][]; solution: Set<string> } | null {
  // 1. 生成黑格
  const blackCells = generateBlackCells(size, profile.blackRatio);

  // 2. 放置灯泡
  const bulbs = placeBulbs(size, blackCells);
  if (!bulbs) return null;

  // 3. 初始化类型网格
  const types: CellType[][] = [];
  for (let r = 0; r < size; r++) {
    types[r] = [];
    for (let c = 0; c < size; c++) {
      const key = posToString(r, c);
      types[r][c] = blackCells.has(key) ? 'black' : 'white';
    }
  }

  // 4. 推导数字
  deriveNumbers(size, types, blackCells, bulbs, profile);

  // 5. 验证唯一解
  if (!validatePuzzle(types)) return null;

  return { types, solution: bulbs };
}

/**
 * 异步生成谜题 - 多难度支持
 */
export async function generatePuzzle(
  size: number,
  difficulty: number,
  maxAttempts: number = 500,
  onProgress?: (attempt: number, maxAttempts: number) => void
): Promise<{ types: CellType[][]; solution: Set<string>; profile: string } | null> {

  // 根据难度选择配置
  let profile: typeof DIFFICULTY_PROFILES.easy;
  let profileName: string;

  if (difficulty <= 2) {
    profile = DIFFICULTY_PROFILES.easy;
    profileName = '简单';
  } else if (difficulty <= 4) {
    profile = DIFFICULTY_PROFILES.medium;
    profileName = '中等';
  } else {
    profile = DIFFICULTY_PROFILES.hard;
    profileName = '困难';
  }

  // 根据难度调整棋盘大小
  let actualSize = size;
  if (difficulty <= 2 && size > 7) {
    actualSize = random(5, 7);  // 简单强制小棋盘
  } else if (difficulty === 3 && size < 10) {
    actualSize = 10;  // 中等强制10x10
  } else if (difficulty >= 4 && size < 15) {
    actualSize = random(15, Math.min(25, size + 5));  // 困难大棋盘
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt % 20 === 0) {
      onProgress?.(attempt, maxAttempts);
      await new Promise(resolve => requestAnimationFrame(resolve));
    }

    const result = generateAttempt(actualSize, profile);
    if (result) {
      console.log(`[${profileName}] ${actualSize}x${actualSize} 谜题生成成功，尝试 ${attempt + 1} 次`);
      return {
        types: result.types,
        solution: result.solution,
        profile: profileName
      };
    }
  }

  // 失败后尝试放宽条件
  console.log(`标准配置失败，尝试放宽条件...`);
  const relaxedProfile = { ...profile, blackRatio: profile.blackRatio * 0.8 };

  for (let attempt = 0; attempt < 100; attempt++) {
    const result = generateAttempt(actualSize, relaxedProfile);
    if (result) {
      console.log(`[${profileName}] ${actualSize}x${actualSize} 谜题生成成功(放宽条件)，尝试 ${attempt + 1} 次`);
      return {
        types: result.types,
        solution: result.solution,
        profile: profileName
      };
    }
  }

  return null;
}

/**
 * 同步生成谜题
 */
export function generatePuzzleSync(
  size: number,
  difficulty: number
): { types: CellType[][]; solution: Set<string> } | null {

  let profile: typeof DIFFICULTY_PROFILES.easy;

  if (difficulty <= 2) {
    profile = DIFFICULTY_PROFILES.easy;
  } else if (difficulty <= 4) {
    profile = DIFFICULTY_PROFILES.medium;
  } else {
    profile = DIFFICULTY_PROFILES.hard;
  }

  let actualSize = size;
  if (difficulty <= 2 && size > 7) {
    actualSize = random(5, 7);
  } else if (difficulty === 3 && size < 10) {
    actualSize = 10;
  } else if (difficulty >= 4 && size < 15) {
    actualSize = random(15, Math.min(25, size + 5));
  }

  for (let attempt = 0; attempt < 300; attempt++) {
    const result = generateAttempt(actualSize, profile);
    if (result) return result;
  }

  return null;
}
