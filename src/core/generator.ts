import {
  CellType,
  Position,
  DIFFICULTY_CONFIG,
  posToString,
  stringToPos,
} from './types';
import { solve } from './solver';

/**
 * 生成随机数
 */
function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 打乱数组
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 获取某位置能照亮的所有格子（包括自己）
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
 * 生成谜题 - 新策略：先放灯，再推导黑格
 *
 * 策略：
 * 1. 在白格中随机放置灯泡，确保互不照射
 * 2. 在灯泡之间的行/列交叉点放置黑格作为分隔
 * 3. 确保所有白格被照亮
 * 4. 推导数字约束
 * 5. 验证唯一解
 */
function generatePuzzleInternal(
  size: number,
  difficulty: number,
  targetBulbCount?: number
): { types: CellType[][]; solution: Set<string> } | null {
  const config = DIFFICULTY_CONFIG[difficulty];

  // 初始化全白
  const types: CellType[][] = [];
  for (let row = 0; row < size; row++) {
    types[row] = [];
    for (let col = 0; col < size; col++) {
      types[row][col] = 'white';
    }
  }

  const bulbs = new Set<string>();
  const illuminated = new Set<string>();

  // 步骤1：放置灯泡 - 使用贪心策略确保覆盖所有格子
  const allCells: Position[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      allCells.push({ row, col });
    }
  }

  // 随机打乱尝试顺序，增加多样性
  const shuffledCells = shuffle(allCells);

  for (const pos of shuffledCells) {
    const key = posToString(pos.row, pos.col);

    // 如果已经被照亮，跳过（高难度时有一定概率仍放置）
    if (illuminated.has(key)) {
      // 高难度：允许一些"额外"的灯泡增加复杂度
      if (difficulty >= 4 && Math.random() < 0.1 && bulbs.size < targetBulbCount!) {
        // 检查是否与现有灯泡冲突
        let conflict = false;
        const directions = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dr, dc] of directions) {
          let r = pos.row + dr;
          let c = pos.col + dc;
          while (r >= 0 && r < size && c >= 0 && c < size) {
            const k = posToString(r, c);
            if (bulbs.has(k)) {
              conflict = true;
              break;
            }
            r += dr;
            c += dc;
          }
          if (conflict) break;
        }

        if (!conflict) {
          bulbs.add(key);
          // 更新照亮区域
          const illuminatedBy = getIlluminatedFrom(size, pos.row, pos.col, new Set());
          for (const cell of illuminatedBy) {
            illuminated.add(cell);
          }
      }
      }
      continue;
    }

    // 放置灯泡
    bulbs.add(key);
    const illuminatedBy = getIlluminatedFrom(size, pos.row, pos.col, new Set());
    for (const cell of illuminatedBy) {
      illuminated.add(cell);
    }
  }

  // 步骤2：检查是否所有格子都被照亮
  if (illuminated.size < size * size * 0.95) {
    return null; // 覆盖率不够
  }

  // 步骤3：在需要的位置添加黑格
  // 策略：在两个灯泡互相能看到的位置放置黑格
  const blackCells = new Set<string>();
  const bulbArray = Array.from(bulbs).map(stringToPos);

  for (let i = 0; i < bulbArray.length; i++) {
    for (let j = i + 1; j < bulbArray.length; j++) {
      const b1 = bulbArray[i];
      const b2 = bulbArray[j];

      // 检查是否在同一行或同一列
      if (b1.row === b2.row) {
        // 同一行，检查中间是否需要黑格
        const minCol = Math.min(b1.col, b2.col);
        const maxCol = Math.max(b1.col, b2.col);

        // 如果距离较远，在中间位置放黑格
        if (maxCol - minCol > 2) {
          const midCol = Math.floor((minCol + maxCol) / 2);
          const key = posToString(b1.row, midCol);
          if (!bulbs.has(key)) {
            blackCells.add(key);
            types[b1.row][midCol] = 'black';
          }
        }
      } else if (b1.col === b2.col) {
        // 同一列
        const minRow = Math.min(b1.row, b2.row);
        const maxRow = Math.max(b1.row, b2.row);

        if (maxRow - minRow > 2) {
          const midRow = Math.floor((minRow + maxRow) / 2);
          const key = posToString(midRow, b1.col);
          if (!bulbs.has(key)) {
            blackCells.add(key);
            types[midRow][b1.col] = 'black';
          }
        }
      }
    }
  }

  // 步骤4：根据难度添加额外黑格
  const targetBlackCount = Math.floor(size * size *
    random(Math.round(config.blackRatio[0] * 100), Math.round(config.blackRatio[1] * 100)) / 100);

  const remainingCells = shuffle(allCells.filter(p => {
    const k = posToString(p.row, p.col);
    return !bulbs.has(k) && !blackCells.has(k);
  }));

  for (const pos of remainingCells) {
    if (blackCells.size >= targetBlackCount) break;

    const key = posToString(pos.row, pos.col);

    // 检查放置黑格后是否仍能保持解的有效性
    // 简化：确保不放灯泡的位置
    if (!bulbs.has(key)) {
      blackCells.add(key);
      types[pos.row][pos.col] = 'black';
    }
  }

  // 步骤5：推导数字
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const blackWithNumbers: { pos: Position; count: number }[] = [];

  for (const key of blackCells) {
    const pos = stringToPos(key);
    let count = 0;

    for (const [dr, dc] of directions) {
      const r = pos.row + dr;
      const c = pos.col + dc;
      if (r >= 0 && r < size && c >= 0 && c < size) {
        if (bulbs.has(posToString(r, c))) {
          count++;
        }
      }
    }

    blackWithNumbers.push({ pos, count });
  }

  // 根据clueDensity决定显示哪些数字
  const clueDensity = random(
    Math.round(config.clueDensity[0] * 100),
    Math.round(config.clueDensity[1] * 100)
  ) / 100;

  const showCount = Math.max(1, Math.floor(blackWithNumbers.length * clueDensity));
  const shuffled = shuffle(blackWithNumbers);

  for (let i = 0; i < shuffled.length; i++) {
    const { pos, count } = shuffled[i];
    if (i < showCount && count <= 4) {
      types[pos.row][pos.col] = `black-${count}` as CellType;
    }
  }

  // 步骤6：验证唯一解
  const result = solve(types);
  if (result.solvable && result.unique) {
    return { types, solution: result.solution };
  }

  return null;
}

/**
 * 异步生成谜题
 */
export async function generatePuzzle(
  size: number,
  difficulty: number,
  maxAttempts: number = 1000,
  onProgress?: (attempt: number, maxAttempts: number) => void
): Promise<{ types: CellType[][]; solution: Set<string> } | null> {

  // 估计需要的灯泡数量
  const estimatedBulbCount = Math.floor(size * size / (difficulty <= 2 ? 4 : 3));

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt % 20 === 0) {
      onProgress?.(attempt, maxAttempts);
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // 根据尝试次数调整参数
    const targetBulbCount = estimatedBulbCount + Math.floor(attempt / 50);

    const result = generatePuzzleInternal(size, difficulty, targetBulbCount);
    if (result) {
      console.log(`谜题生成成功，尝试次数: ${attempt + 1}`);
      return result;
    }
  }

  console.log(`谜题生成失败，尝试次数: ${maxAttempts}`);
  return null;
}

/**
 * 同步生成谜题
 */
export function generatePuzzleSync(
  size: number,
  difficulty: number
): { types: CellType[][]; solution: Set<string> } | null {
  const estimatedBulbCount = Math.floor(size * size / (difficulty <= 2 ? 4 : 3));

  for (let attempt = 0; attempt < 500; attempt++) {
    const targetBulbCount = estimatedBulbCount + Math.floor(attempt / 50);
    const result = generatePuzzleInternal(size, difficulty, targetBulbCount);
    if (result) {
      return result;
    }
  }

  return null;
}
