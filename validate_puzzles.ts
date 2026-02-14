/**
 * Akari Light Up 谜题库验证脚本
 * 使用求解器验证所有预设谜题的正确性
 */

import { readFileSync, writeFileSync } from 'fs';
import { parseCompactPuzzle, solvePuzzle, formatBoard, formatSolution, type CellType } from './scripts/solver';

// ==================== 类型定义 ====================

interface UltraCompactPuzzle {
  b: string;  // 棋盘编码
  s: string[];  // 预设解
}

interface PuzzleInfo {
  size: number;
  encoded: string;
  presetSolution: string[];
}

interface ValidationReport {
  file: string;
  size: number;
  puzzleIndex: number;
  encoded: string;
  solvable: boolean;
  unique: boolean;
  solutionCount: number;
  backtrackSteps: number;
  presetSolutionValid: boolean;
  presetMatches: boolean;
  presetBulbs: string[];
  foundBulbs: string[];
  issues: string[];
}

interface Summary {
  total: number;
  solvable: number;
  unsolvable: number;
  unique: number;
  multiple: number;
  presetValid: number;
  presetInvalid: number;
  byFile: Record<string, {
    total: number;
    solvable: number;
    unsolvable: number;
    presetValid: number;
  }>;
}

// ==================== 谜题解析 ====================

// 从文件解析谜题
function parsePuzzles(content: string, size: number): PuzzleInfo[] {
  // 匹配 { b: 'xxx', s: [...] } 格式
  const puzzleRegex = /{[\s\S]*?b:\s*'([^']+)'[\s\S]*?s:\s*\[([^\]]+)\]/g;
  const matches = [...content.matchAll(puzzleRegex)];

  return matches.map((match, index) => {
    const encoded = match[1];
    const solutionStr = match[2];
    // 解析预设解数组 - 格式为 ['1,1','1,4','3,0']
    // 需要按 ', ' 或 ',' 分割，然后去掉引号
    const presetSolution = solutionStr
      .split("','")
      .map(s => s.trim().replace(/['\[\]]/g, ''))
      .filter(s => s.length > 0 && s.includes(','));

    return { size, encoded, presetSolution };
  });
}

// ==================== 验证逻辑 ====================

// 验证单个谜题
function validatePuzzle(puzzle: PuzzleInfo, index: number, file: string): ValidationReport {
  const { size, encoded, presetSolution } = puzzle;
  const issues: string[] = [];

  // 验证预设解坐标是否在有效范围内
  let presetSolutionValid = true;
  for (const pos of presetSolution) {
    const [row, col] = pos.split(',').map(Number);
    if (isNaN(row) || isNaN(col) || row < 0 || row >= size || col < 0 || col >= size) {
      issues.push(`预设解包含无效坐标: ${pos} (有效范围: 0-${size-1})`);
      presetSolutionValid = false;
    }
  }

  // 解码棋盘
  const types = parseCompactPuzzle(encoded, size);

  // 使用求解器求解
  const result = solvePuzzle(types, {
    maxSolutions: 10,  // 最多找10个解
    timeout: 30000,    // 30秒超时
  });

  // 验证预设解
  let presetMatches = false;
  if (result.solution && presetSolutionValid) {
    const foundBulbs = result.solution.bulbs;
    const presetBulbs = new Set(presetSolution);
    const foundBulbsSet = new Set(foundBulbs);

    // 检查预设解是否与找到的解匹配
    if (presetBulbs.size === foundBulbsSet.size) {
      presetMatches = true;
      for (const bulb of presetBulbs) {
        if (!foundBulbsSet.has(bulb)) {
          presetMatches = false;
          issues.push(`预设解与求解器找到的解不匹配`);
          break;
        }
      }
    } else {
      issues.push(`预设解灯泡数(${presetBulbs.size})与求解器解(${foundBulbsSet.size})不匹配`);
    }
  } else if (!presetSolutionValid) {
    issues.push(`预设解坐标无效，无法验证匹配`);
  } else if (!result.solvable) {
    issues.push(`谜题无解，预设解无效`);
  }

  // 收集更多问题
  if (!result.solvable) {
    issues.push('谜题无解');
  } else if (!result.unique) {
    issues.push(`谜题有多个解 (${result.solutionCount}个)`);
  } else if (!presetMatches) {
    issues.push('预设解与求解器解不匹配');
  }

  return {
    file,
    size,
    puzzleIndex: index,
    encoded,
    solvable: result.solvable,
    unique: result.unique,
    solutionCount: result.solutionCount,
    backtrackSteps: result.stats.backtrackSteps,
    presetSolutionValid,
    presetMatches,
    presetBulbs: presetSolution,
    foundBulbs: result.solution ? Array.from(result.solution.bulbs) : [],
    issues,
  };
}

// ==================== 主函数 ====================

function validateAll(): void {
  const puzzlesDir = process.cwd();
  const files = [
    { name: 'src/data/puzzles/5x5.ts', size: 5 },
    { name: 'src/data/puzzles/6x6.ts', size: 6 },
    { name: 'src/data/puzzles/7x7.ts', size: 7 },
    { name: 'src/data/puzzles/10x10.ts', size: 10 },
  ];

  const summary: Summary = {
    total: 0,
    solvable: 0,
    unsolvable: 0,
    unique: 0,
    multiple: 0,
    presetValid: 0,
    presetInvalid: 0,
    byFile: {},
  };

  const reports: ValidationReport[] = [];

  for (const { name, size } of files) {
    console.log(`\n验证 ${name}...`);
    const content = readFileSync(name, 'utf-8');
    const puzzles = parsePuzzles(content, size);

    console.log(`  找到 ${puzzles.length} 个谜题`);

    summary.byFile[name] = { total: puzzles.length, solvable: 0, unsolvable: 0, presetValid: 0 };

    for (let i = 0; i < puzzles.length; i++) {
      console.log(`  验证谜题 ${i + 1}/${puzzles.length}...`);
      const report = validatePuzzle(puzzles[i], i, name);
      reports.push(report);

      summary.total++;
      if (report.solvable) summary.solvable++;
      else summary.unsolvable++;
      if (report.unique) summary.unique++;
      else if (report.solvable) summary.multiple++;
      if (report.presetMatches) {
        summary.presetValid++;
        summary.byFile[name]!.presetValid++;
      }
      if (!report.presetSolutionValid || !report.presetMatches) {
        summary.presetInvalid++;
      }
      if (report.solvable) {
        summary.byFile[name]!.solvable++;
      } else {
        summary.byFile[name]!.unsolvable++;
      }
    }
  }

  // 生成报告
  let reportText = '# Akari Light Up 谜题库验证报告\n\n';
  reportText += `生成时间: ${new Date().toISOString()}\n\n`;

  // 汇总
  reportText += '## 汇总\n\n';
  reportText += `| 指标 | 数量 | 百分比 |\n`;
  reportText += `|------|------|--------|\n`;
  reportText += `| 总计 | ${summary.total} | 100% |\n`;
  reportText += `| 可解 | ${summary.solvable} | ${((summary.solvable / summary.total) * 100).toFixed(1)}% |\n`;
  reportText += `| 不可解 | ${summary.unsolvable} | ${((summary.unsolvable / summary.total) * 100).toFixed(1)}% |\n`;
  reportText += `| 唯一解 | ${summary.unique} | ${((summary.unique / summary.total) * 100).toFixed(1)}% |\n`;
  reportText += `| 多解 | ${summary.multiple} | ${((summary.multiple / summary.total) * 100).toFixed(1)}% |\n`;
  reportText += `| 预设解正确 | ${summary.presetValid} | ${((summary.presetValid / summary.total) * 100).toFixed(1)}% |\n`;
  reportText += `| 预设解错误 | ${summary.presetInvalid} | ${((summary.presetInvalid / summary.total) * 100).toFixed(1)}% |\n\n`;

  // 按文件统计
  reportText += '## 按文件统计\n\n';
  for (const [fileName, stats] of Object.entries(summary.byFile)) {
    reportText += `### ${fileName}\n\n`;
    reportText += `- 总计: ${stats.total}\n`;
    reportText += `- 可解: ${stats.solvable}\n`;
    reportText += `- 不可解: ${stats.unsolvable}\n`;
    reportText += `- 预设解正确: ${stats.presetValid}\n\n`;
  }

  // 问题谜题详情
  const problemReports = reports.filter(r => r.issues.length > 0);
  if (problemReports.length > 0) {
    reportText += '## 问题谜题详情\n\n';
    reportText += `共 ${problemReports.length} 个问题谜题\n\n`;

    for (const report of problemReports) {
      reportText += `### ${report.file.split('/')[3]} - 谜题 ${report.puzzleIndex + 1} (${report.size}x${report.size})\n\n`;
      reportText += `**编码**: \`${report.encoded}\`\n\n`;
      reportText += `**可解**: ${report.solvable ? '是' : '否'}\n`;
      reportText += `**唯一解**: ${report.unique ? '是' : '否'}\n`;
      reportText += `**解的数量**: ${report.solutionCount}\n`;
      reportText += `**预设解有效**: ${report.presetSolutionValid ? '是' : '否'}\n`;
      reportText += `**预设解匹配**: ${report.presetMatches ? '是' : '否'}\n\n`;

      reportText += `**问题**:\n`;
      if (report.issues && report.issues.length > 0) {
        for (const issue of report.issues) {
          reportText += `- ${issue}\n`;
        }
      }
      reportText += '\n';

      if (report.presetSolution && report.presetSolution.length > 0) {
        reportText += `**预设解**: ${report.presetSolution.join(', ')}\n`;
      }
      if (report.foundBulbs && report.foundBulbs.length > 0) {
        reportText += `**求解器解**: ${report.foundBulbs.join(', ')}\n`;
      }
      reportText += '\n';
    }
  }

  // 正确谜题详情
  const validReports = reports.filter(r => r.issues.length === 0 && r.solvable && r.unique);
  if (validReports.length > 0) {
    reportText += `## 有效谜题 (${validReports.length}个)\n\n`;
    reportText += `以下谜题可解且有唯一解，预设解正确:\n\n`;
    for (const report of validReports) {
      reportText += `- ${report.file} - 谜题 ${report.puzzleIndex + 1}\n`;
    }
    reportText += '\n';
  }

  writeFileSync('VALIDATION_REPORT.md', reportText, 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('验证完成！');
  console.log('='.repeat(60));
  console.log(`总计: ${summary.total} 个谜题`);
  console.log(`可解: ${summary.solvable} 个 (${((summary.solvable / summary.total) * 100).toFixed(1)}%)`);
  console.log(`不可解: ${summary.unsolvable} 个 (${((summary.unsolvable / summary.total) * 100).toFixed(1)}%)`);
  console.log(`唯一解: ${summary.unique} 个 (${((summary.unique / summary.total) * 100).toFixed(1)}%)`);
  console.log(`预设解正确: ${summary.presetValid} 个 (${((summary.presetValid / summary.total) * 100).toFixed(1)}%)`);
  console.log(`预设解错误: ${summary.presetInvalid} 个 (${((summary.presetInvalid / summary.total) * 100).toFixed(1)}%)`);
  console.log('');
  console.log('详细报告已保存到: VALIDATION_REPORT.md');
}

// 运行验证
validateAll();
