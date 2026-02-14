/**
 * 从验证报告中提取有效谜题并更新文件
 */

import { readFileSync, writeFileSync } from 'fs';

// 从验证报告读取有效谜题的索引
function getValidPuzzleIndices(reportPath: string, fileName: string): Set<number> {
  const content = readFileSync(reportPath, 'utf-8');
  const lines = content.split('\n');

  const validIndices = new Set<number>();
  let currentFile = '';
  let currentIndex = -1;
  let indexInFile = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测是否是谜题详情标题
    const match = line.match(/^### ([^-]+?-) 谜题 (\d+) /);
    if (match) {
      currentFile = match[1];
      indexInFile = parseInt(match[2], 10);
      // 如果是当前文件且谜题可解
      if (currentFile === fileName && line.includes('可解: 是')) {
        // 向上查找灯泡数量
        let bulbCount = -1;
        for (let j = i - 1; j >= 0 && bulbCount < 0; j--) {
          const bulbMatch = lines[j].match(/^\*\*求解器解: ([\d, ]+)/);
          if (bulbMatch) {
            bulbCount = bulbMatch[1].split(', ').length;
            break;
          }
        }
        if (bulbCount > 0) {
          validIndices.add(indexInFile);
        }
      }
    }

    // 增加文件内索引
    if (line.startsWith('# ') || (line.startsWith('###') && !line.includes('问题'))) {
      indexInFile++;
    }
  }

  return validIndices;
}

// 更新单个谜题文件
function updatePuzzleFile(filePath: string, fileName: string, validIndices: Set<number>) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  console.log(`\n处理 ${fileName}...`);

  // 获取 export 行号和数组开始行号
  let exportLine = -1;
  let arrayStartLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('export')) {
      exportLine = i;
    }
    if (lines[i].trim() === '[' && arrayStartLine < 0) {
      arrayStartLine = i + 1;
    }
  }

  if (exportLine < 0 || arrayStartLine < 0) {
    console.log('  未找到 export 行或数组开始');
    return { originalCount: 0, validCount: 0 };
  }

  // 保留头部
  const headerLines: string[] = [];
  for (let i = 0; i <= exportLine; i++) {
    headerLines.push(lines[i]);
  }

  // 过滤谜题
  const filteredPuzzleLines: string[] = [];
  let puzzleIndex = 0;

  for (let i = arrayStartLine; i < lines.length; i++) {
    const line = lines[i].trim();

    // 结束标记
    if (line === ']') {
      break;
    }

    // 空行
    if (line === '') {
      continue;
    }

    // 谜题对象开始
    if (line.startsWith('{')) {
      puzzleIndex++;
      if (validIndices.has(puzzleIndex)) {
        // 保留此谜题及其后续行
        filteredPuzzleLines.push(line);
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          // 下一个谜题或数组结束
          if (nextLine.startsWith('{') || nextLine === ']') {
            break;
          }
          filteredPuzzleLines.push(lines[j]);
          j++;
        }
        i = j - 1; // 跳过已处理的行
      } else {
        // 删除此谜题 - 跳到下一个谜题对象
        puzzleIndex++;
        let j = i;
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          if (nextLine.startsWith('{') || nextLine === ']') {
            break;
          }
          j++;
        }
        i = j - 1; // 跳过已处理的行
      }
    } else if (!line.startsWith('//') && !line.startsWith('export')) {
      // 保留其他行（注释等）
      filteredPuzzleLines.push(line);
    }
  }

  console.log(`  原始: ${puzzleIndex} 个谜题, 保留: ${validIndices.size} 个`);

  // 生成新内容
  let newContent = headerLines.join('\n') + '\n';
  newContent += filteredPuzzleLines.join('\n') + '\n';

  // 备份原文件
  const backupPath = `${filePath}.backup`;
  writeFileSync(backupPath, content, 'utf-8');
  console.log(`  备份已保存到: ${backupPath}`);

  // 写入新文件
  writeFileSync(filePath, newContent, 'utf-8');
  console.log(`  已更新 ${fileName}，保留 ${validIndices.size} 个有效谜题`);

  return { originalCount: puzzleIndex, validCount: validIndices.size };
}

// 主函数
function main(): void {
  const reportPath = 'VALIDATION_REPORT.md';
  const files = [
    { path: 'src/data/puzzles/5x5.ts', name: '5x5.ts' },
    { path: 'src/data/puzzles/6x6.ts', name: '6x6.ts' },
    { path: 'src/data/puzzles/7x7.ts', name: '7x7.ts' },
    { path: 'src/data/puzzles/10x10.ts', name: '10x10.ts' },
  ];

  const summary = {
    totalOriginal: 0,
    totalValid: 0,
    totalInvalid: 0,
  };

  for (const { path, name } of files) {
    const validIndices = getValidPuzzleIndices(reportPath, name);
    const result = updatePuzzleFile(path, name, validIndices);
    summary.totalOriginal += result.originalCount;
    summary.totalValid += result.validCount;
    summary.totalInvalid += result.originalCount - result.validCount;
  }

  // 输出汇总
  console.log('\n' + '='.repeat(60));
  console.log('过滤完成！');
  console.log('='.repeat(60));
  console.log(`原始谜题总数: ${summary.totalOriginal}`);
  console.log(`有效谜题数: ${summary.totalValid} (${((summary.totalValid / summary.totalOriginal) * 100).toFixed(1)}%)`);
  console.log(`删除的无解谜题: ${summary.totalInvalid} (${((summary.totalInvalid / summary.totalOriginal) * 100).toFixed(1)}%)`);
  console.log('\n原文件已备份为 .backup 文件');
}

// 运行
main();
