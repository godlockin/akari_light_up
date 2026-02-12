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
      // 中心对称
      positions.push({ row: size - 1 - row, col: size - 1 - col });
      break;
    case 'horizontal':
      // 水平对称
      positions.push({ row: size - 1 - row, col });
      break;
    case 'vertical':
      // 垂直对称
      positions.push({ row, col: size - 1 - col });
      break;
    case 'both':
      // 水平和垂直对称（四象限对称）
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

  // 获取所有可能的中心位置
  const centerPositions: Position[] = [];
  const center = Math.floor(size / 2);

  // 根据对称类型，确定需要填充的基础区域
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (symmetry === 'center' || symmetry === 'both') {
        // 只需要填充一半区域
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

  // 随机选择位置
  const shuffled = [...centerPositions].sort(() => Math.random() - 0.5);

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
 * 逆向生成灯泡解
 */
function generateSolution(
  size: number,
  blackCells: Position[]
): { bulbs: Set<string>; types: CellType[][] } {
  // 初始化类型网格
  const types: CellType[][] = [];
  for (let row = 0; row < size; row++) {
    types[row] = [];
    for (let col = 0; col < size; col++) {
      types[row][col] = 'white';
    }
  }

  // 标记黑格
  const blackSet = new Set<string>();
  for (const pos of blackCells) {
    types[pos.row][pos.col] = 'black';
    blackSet.add(posToString(pos.row, pos.col));
  }

  // 获取所有白格
  const whiteCells: Position[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (types[row][col] === 'white') {
        whiteCells.push({ row, col });
      }
    }
  }

  // 使用贪心 + 回溯放置灯泡
  const bulbs = new Set<string>();
  const illuminated = new Set<string>();

  // 获取灯泡能照亮的格子
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

  // 检查是否可以放灯（不冲突）
  const canPlaceBulb = (row: number, col: number): boolean => {
    const key = posToString(row, col);
    if (illuminated.has(key)) return false;
    return true;
  };

  // 贪心放置
  const shuffledWhite = [...whiteCells].sort(() => Math.random() - 0.5);

  for (const pos of shuffledWhite) {
    const key = posToString(pos.row, pos.col);
    if (illuminated.has(key)) continue;

    if (canPlaceBulb(pos.row, pos.col)) {
      bulbs.add(key);
      const newIlluminated = getIlluminatedBy(pos.row, pos.col);
      for (const cell of newIlluminated) {
        illuminated.add(cell);
      }
    }
  }

  // 检查是否所有白格都被照亮
  for (const pos of whiteCells) {
    const key = posToString(pos.row, pos.col);
    if (!illuminated.has(key)) {
      // 有未照亮的格子，强制放置
      bulbs.add(key);
      const newIlluminated = getIlluminatedBy(pos.row, pos.col);
      for (const cell of newIlluminated) {
        illuminated.add(cell);
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

  // 统计每个黑格相邻的灯数量
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

  // 根据密度决定显示哪些数字
  const showCount = Math.floor(blackCellsWithNumbers.length * clueDensity);
  const shuffled = [...blackCellsWithNumbers].sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffled.length; i++) {
    const { pos, count } = shuffled[i];
    if (i < showCount) {
      types[pos.row][pos.col] = `black-${count}` as CellType;
    }
  }
}

/**
 * 生成谜题
 */
export function generatePuzzle(
  size: number,
  difficulty: number
): { types: CellType[][]; solution: Set<string> } | null {
  const config = DIFFICULTY_CONFIG[difficulty];
  const blackRatio = random(
    Math.round(config.blackRatio[0] * 100),
    Math.round(config.blackRatio[1] * 100)
  ) / 100;
  const clueDensity = random(
    Math.round(config.clueDensity[0] * 100),
    Math.round(config.clueDensity[1] * 100)
  ) / 100;

  // 选择对称类型
  const symmetries: SymmetryType[] = ['center', 'horizontal', 'vertical', 'both', 'none'];
  const symmetry = randomChoice(symmetries);

  // 最多尝试100次
  for (let attempt = 0; attempt < 100; attempt++) {
    // 生成模板
    const blackCells = generateTemplate(size, blackRatio, symmetry);

    // 逆向生成解
    const { bulbs, types } = generateSolution(size, blackCells);

    // 推导数字
    deriveNumbers(types, bulbs, clueDensity);

    // 验证唯一解
    const result = solve(types);
    if (result.solvable && result.unique) {
      return { types, solution: result.solution };
    }
  }

  // 如果失败，尝试更简单的配置
  for (let attempt = 0; attempt < 50; attempt++) {
    const simplerBlackRatio = Math.max(0.15, blackRatio - 0.05);
    const blackCells = generateTemplate(size, simplerBlackRatio, symmetry);
    const { bulbs, types } = generateSolution(size, blackCells);
    deriveNumbers(types, bulbs, 0.8); // 更高的数字密度

    const result = solve(types);
    if (result.solvable && result.unique) {
      return { types, solution: result.solution };
    }
  }

  return null;
}