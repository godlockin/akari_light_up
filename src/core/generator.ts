import {
  CellType,
  Position,
  DIFFICULTY_CONFIG,
  posToString,
} from './types';
import { solve } from './solver';

// 对称模板类型
type SymmetryType = 'center' | 'horizontal' | 'vertical' | 'both' | 'none';

/**
 * 生成随机数
 */
function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 随机选择数组元素
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
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
 * 获取对称位置
 */
function getSymmetricPositions(
  size: number,
  row: number,
  col: number,
  symmetry: SymmetryType
): Position[] {
  const positions: Position[] = [{ row, col }];

  switch (symmetry) {
    case 'center':
      positions.push({ row: size - 1 - row, col: size - 1 - col });
      break;
    case 'horizontal':
      positions.push({ row: size - 1 - row, col });
      break;
    case 'vertical':
      positions.push({ row, col: size - 1 - col });
      break;
    case 'both':
      positions.push({ row: size - 1 - row, col });
      positions.push({ row, col: size - 1 - col });
      positions.push({ row: size - 1 - row, col: size - 1 - col });
      break;
    case 'none':
    default:
      break;
  }

  return positions;
}

/**
 * 生成模板 - 黑格位置
 */
function generateTemplate(
  size: number,
  blackRatio: number,
  symmetry: SymmetryType
): Position[] {
  const blackCells: Position[] = [];
  const used = new Set<string>();
  const targetCount = Math.floor(size * size * blackRatio);

  const centerPositions: Position[] = [];
  const center = Math.floor(size / 2);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (symmetry === 'center' || symmetry === 'both') {
        if (row * size + col < (size * size) / 2) {
          centerPositions.push({ row, col });
        }
      } else if (symmetry === 'horizontal') {
        if (row <= center) {
          centerPositions.push({ row, col });
        }
      } else if (symmetry === 'vertical') {
        if (col <= center) {
          centerPositions.push({ row, col });
        }
      } else {
        centerPositions.push({ row, col });
      }
    }
  }

  const shuffled = shuffle(centerPositions);

  for (const pos of shuffled) {
    if (blackCells.length >= targetCount) break;

    const symmetricPositions = getSymmetricPositions(size, pos.row, pos.col, symmetry);
    let canAdd = true;

    for (const sp of symmetricPositions) {
      if (used.has(posToString(sp.row, sp.col))) {
        canAdd = false;
        break;
      }
    }

    if (canAdd) {
      for (const sp of symmetricPositions) {
        blackCells.push(sp);
        used.add(posToString(sp.row, sp.col));
      }
    }
  }

  return blackCells;
}

/**
 * 逆向生成灯泡解 - 改进版，确保有解
 */
function generateSolution(
  size: number,
  blackCells: Position[]
): { bulbs: Set<string>; types: CellType[][] } {
  const types: CellType[][] = [];
  for (let row = 0; row < size; row++) {
    types[row] = [];
    for (let col = 0; col < size; col++) {
      types[row][col] = 'white';
    }
  }

  for (const pos of blackCells) {
    types[pos.row][pos.col] = 'black';
  }

  const whiteCells: Position[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (types[row][col] === 'white') {
        whiteCells.push({ row, col });
      }
    }
  }

  const bulbs = new Set<string>();

  const getIlluminatedBy = (row: number, col: number): Set<string> => {
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
      while (r >= 0 && r < size && c >= 0 && c < size && types[r][c] === 'white') {
        result.add(posToString(r, c));
        r += dir.dr;
        c += dir.dc;
      }
    }

    return result;
  };

  // 使用最大覆盖贪心策略
  const uncoveredCells = new Set(whiteCells.map(p => posToString(p.row, p.col)));

  while (uncoveredCells.size > 0) {
    let bestPos: Position | null = null;
    let bestCoverage = 0;

    // 找能覆盖最多未照亮格子的位置
    for (const pos of whiteCells) {
      const key = posToString(pos.row, pos.col);
      if (bulbs.has(key)) continue;

      const illuminatedBy = getIlluminatedBy(pos.row, pos.col);
      let coverage = 0;
      for (const cell of illuminatedBy) {
        if (uncoveredCells.has(cell)) coverage++;
      }

      if (coverage > bestCoverage) {
        bestCoverage = coverage;
        bestPos = pos;
      }
    }

    if (bestPos && bestCoverage > 0) {
      const key = posToString(bestPos.row, bestPos.col);
      bulbs.add(key);
      const illuminatedBy = getIlluminatedBy(bestPos.row, bestPos.col);
      for (const cell of illuminatedBy) {
        uncoveredCells.delete(cell);
      }
    } else {
      // 强制放置一个灯
      for (const cell of uncoveredCells) {
        bulbs.add(cell);
        const illuminatedBy = getIlluminatedBy(
          parseInt(cell.split(',')[0]),
          parseInt(cell.split(',')[1])
        );
        for (const c of illuminatedBy) {
          uncoveredCells.delete(c);
        }
        break;
      }
    }
  }

  return { bulbs, types };
}

/**
 * 推导黑格数字
 */
function deriveNumbers(
  types: CellType[][],
  bulbs: Set<string>,
  clueDensity: number
): void {
  const size = types.length;
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  const blackCellsWithNumbers: { pos: Position; count: number }[] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (types[row][col] === 'black') {
        let count = 0;
        for (const dir of directions) {
          const r = row + dir.dr;
          const c = col + dir.dc;
          if (r >= 0 && r < size && c >= 0 && c < size) {
            if (bulbs.has(posToString(r, c))) {
              count++;
            }
          }
        }
        blackCellsWithNumbers.push({ pos: { row, col }, count });
      }
    }
  }

  const showCount = Math.max(1, Math.floor(blackCellsWithNumbers.length * clueDensity));
  const shuffled = shuffle(blackCellsWithNumbers);

  for (let i = 0; i < shuffled.length; i++) {
    const { pos, count } = shuffled[i];
    if (i < showCount && count <= 4) {
      types[pos.row][pos.col] = `black-${count}` as CellType;
    }
  }
}

/**
 * 单次生成尝试
 */
function singleAttempt(
  size: number,
  difficulty: number,
  attemptBlackRatio?: number,
  attemptClueDensity?: number,
  attemptSymmetry?: SymmetryType
): { types: CellType[][]; solution: Set<string> } | null {
  const config = DIFFICULTY_CONFIG[difficulty];

  const blackRatio = attemptBlackRatio ?? random(
    Math.round(config.blackRatio[0] * 100),
    Math.round(config.blackRatio[1] * 100)
  ) / 100;

  const clueDensity = attemptClueDensity ?? random(
    Math.round(config.clueDensity[0] * 100),
    Math.round(config.clueDensity[1] * 100)
  ) / 100;

  const symmetries: SymmetryType[] = ['center', 'horizontal', 'vertical', 'both', 'none'];
  const symmetry = attemptSymmetry ?? randomChoice(symmetries);

  const blackCells = generateTemplate(size, blackRatio, symmetry);
  const { bulbs, types } = generateSolution(size, blackCells);
  deriveNumbers(types, bulbs, clueDensity);

  const result = solve(types);
  if (result.solvable && result.unique) {
    return { types, solution: result.solution };
  }

  return null;
}

/**
 * 生成谜题 - 增强版，带进度回调
 */
export async function generatePuzzle(
  size: number,
  difficulty: number,
  maxAttempts: number = 2000,
  onProgress?: (attempt: number, maxAttempts: number) => void
): Promise<{ types: CellType[][]; solution: Set<string> } | null> {
  const config = DIFFICULTY_CONFIG[difficulty];

  // 策略1: 使用配置范围内的参数
  for (let attempt = 0; attempt < Math.min(maxAttempts / 3, 500); attempt++) {
    if (attempt % 50 === 0) {
      onProgress?.(attempt, maxAttempts);
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const result = singleAttempt(size, difficulty);
    if (result) {
      console.log(`谜题生成成功，尝试次数: ${attempt + 1}`);
      return result;
    }
  }

  // 策略2: 降低黑格密度，增加成功率
  const easierBlackRatio: [number, number] = [
    Math.max(0.1, config.blackRatio[0] - 0.05),
    Math.max(0.15, config.blackRatio[1] - 0.05)
  ];

  for (let attempt = 0; attempt < Math.min(maxAttempts / 3, 500); attempt++) {
    if (attempt % 50 === 0) {
      onProgress?.(attempt + 500, maxAttempts);
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const blackRatio = random(
      Math.round(easierBlackRatio[0] * 100),
      Math.round(easierBlackRatio[1] * 100)
    ) / 100;
    const clueDensity = random(50, 90) / 100;

    const symmetries: SymmetryType[] = ['center', 'horizontal', 'vertical', 'both', 'none'];
    const result = singleAttempt(size, difficulty, blackRatio, clueDensity, randomChoice(symmetries));
    if (result) {
      console.log(`谜题生成成功(策略2)，尝试次数: ${attempt + 501}`);
      return result;
    }
  }

  // 策略3: 使用固定对称性和更高数字密度
  const fixedSymmetries: SymmetryType[] = ['center', 'horizontal', 'vertical'];
  for (const symmetry of fixedSymmetries) {
    for (let attempt = 0; attempt < 200; attempt++) {
      if (attempt % 50 === 0) {
        onProgress?.(attempt + 1000, maxAttempts);
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const blackRatio = random(15, 25) / 100;
      const clueDensity = random(60, 100) / 100;

      const result = singleAttempt(size, difficulty, blackRatio, clueDensity, symmetry);
      if (result) {
        console.log(`谜题生成成功(策略3-${symmetry})，尝试次数: ${attempt + 1001}`);
        return result;
      }
    }
  }

  // 最终策略: 极简配置，确保能生成
  for (let attempt = 0; attempt < 500; attempt++) {
    if (attempt % 100 === 0) {
      onProgress?.(attempt + 1600, maxAttempts);
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const blackRatio = random(10, 20) / 100;
    const clueDensity = 0.9;

    const result = singleAttempt(size, difficulty, blackRatio, clueDensity, 'center');
    if (result) {
      console.log(`谜题生成成功(最终策略)，尝试次数: ${attempt + 1601}`);
      return result;
    }
  }

  console.log(`谜题生成失败，已达到最大尝试次数: ${maxAttempts}`);
  return null;
}

/**
 * 同步生成谜题（用于兼容性）
 */
export function generatePuzzleSync(
  size: number,
  difficulty: number
): { types: CellType[][]; solution: Set<string> } | null {
  const config = DIFFICULTY_CONFIG[difficulty];

  // 尝试多种策略
  for (let strategy = 0; strategy < 5; strategy++) {
    const blackRatioRange: [number, number] = strategy === 0
      ? config.blackRatio
      : [Math.max(0.1, config.blackRatio[0] - 0.05 * strategy), Math.max(0.15, config.blackRatio[1] - 0.05 * strategy)];

    const clueDensityRange: [number, number] = strategy < 2
      ? config.clueDensity
      : [0.5, 0.9];

    for (let attempt = 0; attempt < 300; attempt++) {
      const blackRatio = random(
        Math.round(blackRatioRange[0] * 100),
        Math.round(blackRatioRange[1] * 100)
      ) / 100;

      const clueDensity = random(
        Math.round(clueDensityRange[0] * 100),
        Math.round(clueDensityRange[1] * 100)
      ) / 100;

      const symmetries: SymmetryType[] = strategy < 3
        ? ['center', 'horizontal', 'vertical', 'both', 'none']
        : ['center', 'horizontal'];
      const symmetry = randomChoice(symmetries);

      const blackCells = generateTemplate(size, blackRatio, symmetry);
      const { bulbs, types } = generateSolution(size, blackCells);
      deriveNumbers(types, bulbs, clueDensity);

      const result = solve(types);
      if (result.solvable && result.unique) {
        return { types, solution: result.solution };
      }
    }
  }

  return null;
}
