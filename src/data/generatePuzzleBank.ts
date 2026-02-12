/**
 * 预生成谜题库脚本
 * 运行: npx ts-node src/data/generatePuzzleBank.ts
 */
import { generatePuzzleSync } from '../core/generator';
import { solve } from '../core/solver';
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

// 生成配置
const GENERATION_CONFIG = [
  // 简单难度 (1-2)
  { size: 5, difficulty: 1, difficultyName: '入门', count: 5 },
  { size: 6, difficulty: 2, difficultyName: '简单', count: 5 },
  { size: 7, difficulty: 2, difficultyName: '简单', count: 5 },
  // 中等难度 (3)
  { size: 10, difficulty: 3, difficultyName: '中等', count: 8 },
  // 困难难度 (4-5)
  { size: 15, difficulty: 4, difficultyName: '困难', count: 5 },
  { size: 15, difficulty: 5, difficultyName: '专家', count: 5 },
  { size: 20, difficulty: 5, difficultyName: '专家', count: 3 },
];

function countCells(types: CellType[][]) {
  let blackCount = 0;
  let numberedCount = 0;

  for (const row of types) {
    for (const cell of row) {
      if (cell !== 'white') {
        blackCount++;
        if (cell !== 'black') numberedCount++;
      }
    }
  }

  return { blackCount, numberedCount };
}

export function generatePuzzleBank(): PuzzleEntry[] {
  const bank: PuzzleEntry[] = [];

  for (const config of GENERATION_CONFIG) {
    console.log(`\n生成 ${config.size}x${config.size} ${config.difficultyName} 难度...`);

    let generated = 0;
    let attempts = 0;
    const maxAttempts = config.count * 50;

    while (generated < config.count && attempts < maxAttempts) {
      attempts++;

      const result = generatePuzzleSync(config.size, config.difficulty);

      if (result) {
        // 验证解
        const validation = solve(result.types);
        if (!validation.unique || !validation.solvable) {
          continue;
        }

        // 检查重复
        const typesJson = JSON.stringify(result.types);
        const isDuplicate = bank.some(p => JSON.stringify(p.types) === typesJson);
        if (isDuplicate) {
          continue;
        }

        const { blackCount, numberedCount } = countCells(result.types);

        const entry: PuzzleEntry = {
          id: `${config.difficultyName}-${config.size}x${config.size}-${String(generated + 1).padStart(3, '0')}`,
          size: config.size,
          difficulty: config.difficulty,
          difficultyName: config.difficultyName,
          types: result.types,
          solution: Array.from(result.solution),
          blackCount,
          numberedCount,
          bulbCount: result.solution.size,
        };

        bank.push(entry);
        generated++;

        console.log(`  ✓ ${entry.id} (黑格:${blackCount}, 数字:${numberedCount}, 灯泡:${entry.bulbCount})`);
      }
    }

    if (generated < config.count) {
      console.log(`  ⚠️ 只生成了 ${generated}/${config.count} 个谜题`);
    }
  }

  return bank;
}

// 生成并输出
if (require.main === module) {
  const bank = generatePuzzleBank();

  console.log('\n\n========== 生成完成 ==========');
  console.log(`总计: ${bank.length} 个谜题`);

  // 按难度统计
  const stats: Record<string, number> = {};
  for (const p of bank) {
    const key = `${p.difficultyName}(${p.size}x${p.size})`;
    stats[key] = (stats[key] || 0) + 1;
  }

  console.log('\n分布:');
  for (const [key, count] of Object.entries(stats)) {
    console.log(`  ${key}: ${count}个`);
  }

  // 输出为JSON格式
  console.log('\n\n========== 复制到 puzzleBank.ts ==========\n');
  console.log('export const PUZZLE_BANK = ' + JSON.stringify(bank, null, 2) + ';');
}
