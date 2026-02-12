// ==================== 编解码器 ====================
// 将 CellType 压缩为单个字符，大幅减少存储空间

import { CellType } from '../../core/types';

export type CompressedCell = 'w' | 'b' | '0' | '1' | '2' | '3' | '4';

// 编码: CellType -> char
export function encodeCell(cell: string): CompressedCell {
  switch (cell) {
    case 'white': return 'w';
    case 'black': return 'b';
    case 'black-0': return '0';
    case 'black-1': return '1';
    case 'black-2': return '2';
    case 'black-3': return '3';
    case 'black-4': return '4';
    default: return 'w';
  }
}

// 解码: char -> CellType
export function decodeCell(char: CompressedCell): CellType {
  switch (char) {
    case 'w': return 'white';
    case 'b': return 'black';
    case '0': return 'black-0';
    case '1': return 'black-1';
    case '2': return 'black-2';
    case '3': return 'black-3';
    case '4': return 'black-4';
    default: return 'white';
  }
}

// 编码整个棋盘
export function encodeBoard(types: CellType[][]): string {
  return types.map(row => row.map(encodeCell).join('')).join('');
}

// 解码整个棋盘
export function decodeBoard(encoded: string, size: number): CellType[][] {
  const result: CellType[][] = [];
  for (let i = 0; i < size; i++) {
    const row: CellType[] = [];
    for (let j = 0; j < size; j++) {
      row.push(decodeCell(encoded[i * size + j] as CompressedCell));
    }
    result.push(row);
  }
  return result;
}

// ==================== 紧凑谜题接口 ====================
export interface UltraCompactPuzzle {
  b: string;  // board (压缩后的棋盘字符串)
  s: string[]; // solution
}

// 转换为游戏格式
export interface CompactPuzzle {
  t: CellType[][];  // types
  s: string[];      // solution
}

export function decompressPuzzle(puzzle: UltraCompactPuzzle, size: number): CompactPuzzle {
  return {
    t: decodeBoard(puzzle.b, size),
    s: puzzle.s,
  };
}
