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
 * 策略1: 贪心最大覆盖 - 优先放能照亮最多未覆盖格子的灯
 */
function strategyGreedyCoverage(
  size: number,
  difficulty: number
): { types: CellType[][]; solution: Set<string> } | null {
  const config = DIFFICULTY_CONFIG[difficulty];

  const types: CellType[][] = Array(size).fill(null).map(() => Array(size).fill('white'));
  const bulbs = new Set<string>();
  const illuminated = new Set<string>();
  const allCells: Position[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      allCells.push({ row: r, col: c });
    }
  }

  // 最大覆盖贪心
  while (illuminated.size < size * size) {
    let bestPos: Position | null = null;
    let bestCoverage = 0;

    for (const pos of allCells) {
      const key = posToString(pos.row, pos.col);
      if (bulbs.has(key)) continue;

      const coverage = getIlluminatedFrom(size, pos.row, pos.col, new Set());
      let uncoveredCount = 0;
      for (const cell of coverage) {
        if (!illuminated.has(cell)) uncoveredCount++;
      }

      if (uncoveredCount > bestCoverage) {
        bestCoverage = uncoveredCount;
        bestPos = pos;
      }
    }

    if (!bestPos || bestCoverage === 0) {
      // 找第一个未照亮的格子强制放灯
      for (const pos of allCells) {
        const key = posToString(pos.row, pos.col);
        if (!illuminated.has(key) && !bulbs.has(key)) {
          bestPos = pos;
          break;
        }
      }
    }

    if (!bestPos) break;

    const key = posToString(bestPos.row, bestPos.col);
    bulbs.add(key);
    const newlyLit = getIlluminatedFrom(size, bestPos.row, bestPos.col, new Set());
    for (const cell of newlyLit) {
      illuminated.add(cell);
    }
  }

  return finalizePuzzle(size, types, bulbs, config);
}

/**
 * 策略2: 随机扫描线 - 按行/列扫描随机放置
 */
function strategyScanline(
  size: number,
  difficulty: number
): { types: CellType[][]; solution: Set<string> } | null {
  const config = DIFFICULTY_CONFIG[difficulty];
  const types: CellType[][] = Array(size).fill(null).map(() => Array(size).fill('white'));
  const bulbs = new Set<string>();
  const illuminated = new Set<string>();

  // 随机决定扫描方向
  const scanByRow = Math.random() > 0.5;

  if (scanByRow) {
    for (let row = 0; row < size; row++) {
      const cols = shuffle([...Array(size).keys()]);
      for (const col of cols) {
        const key = posToString(row, col);
        if (!illuminated.has(key)) {
          bulbs.add(key);
          const newlyLit = getIlluminatedFrom(size, row, col, new Set());
          for (const cell of newlyLit) illuminated.add(cell);
        }
      }
    }
  } else {
    for (let col = 0; col < size; col++) {
      const rows = shuffle([...Array(size).keys()]);
      for (const row of rows) {
        const key = posToString(row, col);
        if (!illuminated.has(key)) {
          bulbs.add(key);
          const newlyLit = getIlluminatedFrom(size, row, col, new Set());
          for (const cell of newlyLit) illuminated.add(cell);
        }
      }
    }
  }

  return finalizePuzzle(size, types, bulbs, config);
}

/**
 * 策略3: 棋盘格模式 - 交替放置创造规则结构
 */
function strategyCheckerboard(
  size: number,
  difficulty: number
): { types: CellType[][]; solution: Set<string> } | null {
  const config = DIFFICULTY_CONFIG[difficulty];
  const types: CellType[][] = Array(size).fill(null).map(() => Array(size).fill('white'));
  const bulbs = new Set<string>();

  // 两种棋盘格偏移
  const offset = Math.random() > 0.5 ? 0 : 1;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if ((row + col) % 2 === offset) {
        bulbs.add(posToString(row, col));
      }
    }
  }

  // 移除互相照射的灯（保留奇数位置的）
  const bulbsArray = Array.from(bulbs).map(stringToPos);
  const toRemove = new Set<string>();

  for (let i = 0; i < bulbsArray.length; i++) {
    for (let j = i + 1; j < bulbsArray.length; j++) {
      const b1 = bulbsArray[i];
      const b2 = bulbsArray[j];

      if (b1.row === b2.row || b1.col === b2.col) {
        // 同一行或列，需要移除一个
        if (Math.random() > 0.5) {
          toRemove.add(posToString(b1.row, b1.col));
        } else {
          toRemove.add(posToString(b2.row, b2.col));
        }
      }
    }
  }

  for (const key of toRemove) {
    bulbs.delete(key);
  }

  // 确保全覆盖
  const illuminated = new Set<string>();
  for (const key of bulbs) {
    const pos = stringToPos(key);
    const newlyLit = getIlluminatedFrom(size, pos.row, pos.col, new Set());
    for (const cell of newlyLit) illuminated.add(cell);
  }

  // 补充未照亮的区域
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const key = posToString(r, c);
      if (!illuminated.has(key) && !bulbs.has(key)) {
        bulbs.add(key);
        const newlyLit = getIlluminatedFrom(size, r, c, new Set());
        for (const cell of newlyLit) illuminated.add(cell);
      }
    }
  }

  return finalizePuzzle(size, types, bulbs, config);
}

/**
 * 策略4: 分区递归 - 将棋盘分成小区块分别求解
 */
function strategyPartition(
  size: number,
  difficulty: number
): { types: CellType[][]; solution: Set<string> } | null {
  const config = DIFFICULTY_CONFIG[difficulty];
  const types: CellType[][] = Array(size).fill(null).map(() => Array(size).fill('white'));
  const bulbs = new Set<string>();

  // 分区大小
  const partitionSize = Math.max(3, Math.floor(size / 2));

  for (let startRow = 0; startRow < size; startRow += partitionSize) {
    for (let startCol = 0; startCol < size; startCol += partitionSize) {
      const endRow = Math.min(startRow + partitionSize, size);
      const endCol = Math.min(startCol + partitionSize, size);

      // 在每个分区中心放灯
      const centerRow = Math.floor((startRow + endRow - 1) / 2);
      const centerCol = Math.floor((startCol + endCol - 1) / 2);
      bulbs.add(posToString(centerRow, centerCol));
    }
  }

  // 检查并补充覆盖
  const illuminated = new Set<string>();
  for (const key of bulbs) {
    const pos = stringToPos(key);
    const newlyLit = getIlluminatedFrom(size, pos.row, pos.col, new Set());
    for (const cell of newlyLit) illuminated.add(cell);
  }

  // 补充未照亮的格子
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const key = posToString(r, c);
      if (!illuminated.has(key) && !bulbs.has(key)) {
        // 检查是否与现有灯冲突
        let conflict = false;
        for (const existingKey of bulbs) {
          const existing = stringToPos(existingKey);
          if (existing.row === r || existing.col === c) {
            conflict = true;
            break;
          }
        }
        if (!conflict) {
          bulbs.add(key);
          const newlyLit = getIlluminatedFrom(size, r, c, new Set());
          for (const cell of newlyLit) illuminated.add(cell);
        }
      }
    }
  }

  return finalizePuzzle(size, types, bulbs, config);
}

/**
 * 策略5: 高密度随机 - 适合高难度，允许更多灯
 */
function strategyDenseRandom(
  size: number,
  difficulty: number
): { types: CellType[][]; solution: Set<string> } | null {
  const config = DIFFICULTY_CONFIG[difficulty];
  const types: CellType[][] = Array(size).fill(null).map(() => Array(size).fill('white'));
  const bulbs = new Set<string>();
  const allCells = shuffle([...Array(size * size).keys()].map(i => ({
    row: Math.floor(i / size),
    col: i % size
  })));

  const illuminated = new Set<string>();

  for (const pos of allCells) {
    const key = posToString(pos.row, pos.col);

    // 如果未被照亮，放置灯泡
    if (!illuminated.has(key)) {
      // 检查是否与现有灯泡冲突
      let conflict = false;
      for (const dir of [[-1,0], [1,0], [0,-1], [0,1]]) {
        let r = pos.row + dir[0];
        let c = pos.col + dir[1];
        while (r >= 0 && r < size && c >= 0 && c < size) {
          const k = posToString(r, c);
          if (bulbs.has(k)) {
            conflict = true;
            break;
          }
          r += dir[0];
          c += dir[1];
        }
        if (conflict) break;
      }

      if (!conflict) {
        bulbs.add(key);
        const newlyLit = getIlluminatedFrom(size, pos.row, pos.col, new Set());
        for (const cell of newlyLit) illuminated.add(cell);
      }
    }
  }

  return finalizePuzzle(size, types, bulbs, config);
}

/**
 * 最终处理：添加黑格、数字，验证唯一解
 */
function finalizePuzzle(
  size: number,
  types: CellType[][],
  bulbs: Set<string>,
  config: { blackRatio: [number, number]; clueDensity: [number, number] }
): { types: CellType[][]; solution: Set<string> } | null {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  // 检查全覆盖
  const illuminated = new Set<string>();
  for (const key of bulbs) {
    const pos = stringToPos(key);
    const lit = getIlluminatedFrom(size, pos.row, pos.col, new Set());
    for (const cell of lit) illuminated.add(cell);
  }

  if (illuminated.size < size * size * 0.9) {
    return null; // 覆盖不足
  }

  // 添加黑格分隔
  const blackCells = new Set<string>();
  const bulbArray = Array.from(bulbs).map(stringToPos);

  for (let i = 0; i < bulbArray.length; i++) {
    for (let j = i + 1; j < bulbArray.length; j++) {
      const b1 = bulbArray[i];
      const b2 = bulbArray[j];

      if (b1.row === b2.row && Math.abs(b1.col - b2.col) > 2) {
        const midCol = Math.floor((b1.col + b2.col) / 2);
        const key = posToString(b1.row, midCol);
        if (!bulbs.has(key)) {
          blackCells.add(key);
          types[b1.row][midCol] = 'black';
        }
      } else if (b1.col === b2.col && Math.abs(b1.row - b2.row) > 2) {
        const midRow = Math.floor((b1.row + b2.row) / 2);
        const key = posToString(midRow, b1.col);
        if (!bulbs.has(key)) {
          blackCells.add(key);
          types[midRow][b1.col] = 'black';
        }
      }
    }
  }

  // 添加额外黑格达到目标密度
  const targetBlack = Math.floor(size * size *
    random(Math.round(config.blackRatio[0] * 100), Math.round(config.blackRatio[1] * 100)) / 100);

  const allPositions: Position[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const key = posToString(r, c);
      if (!bulbs.has(key) && !blackCells.has(key)) {
        allPositions.push({ row: r, col: c });
      }
    }
  }

  const shuffled = shuffle(allPositions);
  for (const pos of shuffled) {
    if (blackCells.size >= targetBlack) break;
    const key = posToString(pos.row, pos.col);
    blackCells.add(key);
    types[pos.row][pos.col] = 'black';
  }

  // 推导数字
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

  const clueDensity = random(
    Math.round(config.clueDensity[0] * 100),
    Math.round(config.clueDensity[1] * 100)
  ) / 100;

  const showCount = Math.max(1, Math.floor(blackWithNumbers.length * clueDensity));
  const shuffledNumbers = shuffle(blackWithNumbers);

  for (let i = 0; i < shuffledNumbers.length; i++) {
    const { pos, count } = shuffledNumbers[i];
    if (i < showCount && count <= 4) {
      types[pos.row][pos.col] = `black-${count}` as CellType;
    }
  }

  // 验证唯一解
  const result = solve(types);
  if (result.solvable && result.unique) {
    return { types, solution: result.solution };
  }

  return null;
}

/**
 * 并行生成谜题 - 多策略竞争模式
 */
export async function generatePuzzle(
  size: number,
  difficulty: number,
  maxAttemptsPerStrategy: number = 200,
  onProgress?: (strategyName: string, attempt: number) => void
): Promise<{ types: CellType[][]; solution: Set<string>; strategy: string } | null> {

  const strategies = [
    { name: '贪心覆盖', fn: strategyGreedyCoverage },
    { name: '扫描线', fn: strategyScanline },
    { name: '棋盘格', fn: strategyCheckerboard },
    { name: '分区递归', fn: strategyPartition },
    { name: '密集随机', fn: strategyDenseRandom },
  ];

  // 每个策略的尝试计数
  const attemptCounts: Record<string, number> = {};
  strategies.forEach(s => attemptCounts[s.name] = 0);

  // 创建单个策略的异步迭代器
  async function runStrategy(strategy: typeof strategies[0]): Promise<{ result: { types: CellType[][]; solution: Set<string> }; strategy: string } | null> {
    for (let attempt = 0; attempt < maxAttemptsPerStrategy; attempt++) {
      attemptCounts[strategy.name] = attempt + 1;

      if (attempt % 10 === 0) {
        onProgress?.(strategy.name, attempt);
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const result = strategy.fn(size, difficulty);
      if (result) {
        console.log(`策略 [${strategy.name}] 成功，尝试 ${attempt + 1} 次`);
        return { result, strategy: strategy.name };
      }
    }
    return null;
  }

  // 并行运行所有策略，使用 Promise.race 竞争
  const strategyPromises = strategies.map(s => runStrategy(s));

  // 同时启动所有策略，任一成功立即返回
  const winner = await Promise.race([
    ...strategyPromises,
    // 添加一个永不解决的 Promise 作为保底，防止所有策略同时失败
    new Promise<null>(() => {})
  ]);

  if (winner) {
    return {
      types: winner.result.types,
      solution: winner.result.solution,
      strategy: winner.strategy
    };
  }

  // 如果没有立即获胜者，等待所有策略完成看是否有成功者
  const results = await Promise.allSettled(strategyPromises);

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      return {
        types: result.value.result.types,
        solution: result.value.result.solution,
        strategy: result.value.strategy
      };
    }
  }

  console.log('所有策略均失败');
  return null;
}

/**
 * 同步生成谜题（串行 fallback）
 */
export function generatePuzzleSync(
  size: number,
  difficulty: number
): { types: CellType[][]; solution: Set<string> } | null {
  const strategies = [
    strategyGreedyCoverage,
    strategyScanline,
    strategyCheckerboard,
    strategyPartition,
    strategyDenseRandom,
  ];

  for (let round = 0; round < 100; round++) {
    for (const strategy of strategies) {
      const result = strategy(size, difficulty);
      if (result) return result;
    }
  }

  return null;
}
