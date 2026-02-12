import { CellType } from '../../core/types';

export interface CompactPuzzle {
  t: CellType[][];  // types
  s: string[];      // solution (row,col format)
}

// 5x5 谜题库: 30个 (入门15 + 简单15)
export const PUZZLES_5X5: CompactPuzzle[] = [
  // ===== 入门 (difficulty=1) =====
  { t: [['black','black-0','black','white','white'],['white','white','white','white','white'],['black','black-3','white','black','white'],['white','white','white','white','white'],['white','white','black','white','white']], s: ['1,1','1,4','3,0','3,3','4,1','4,4'] },
  { t: [['white','white','black','white','white'],['white','black','black-4','black','white'],['black','black-0','white','black-0','black'],['white','black','white','black','white'],['white','white','black','white','white']], s: ['0,0','0,4','2,2','4,0','4,4'] },
  { t: [['white','white','white','white','white'],['black','black-3','black','white','black'],['white','white','white','white','white'],['black','white','black','black-2','black'],['white','white','white','white','white']], s: ['0,1','0,4','2,0','2,3','4,1','4,4'] },
  { t: [['black','black-0','black','white','white'],['white','white','white','white','white'],['white','black','black-4','black','white'],['white','white','white','white','white'],['black','white','black','black-0','black']], s: ['1,1','1,4','2,0','2,4','3,2','4,1'] },
  { t: [['white','white','white','black','white'],['black','black-2','black','black-0','black'],['white','white','white','white','white'],['black','black-0','black','white','black'],['white','white','white','white','white']], s: ['0,0','0,3','2,1','2,4','4,0','4,3'] },
  { t: [['black','white','white','black','white'],['white','white','black','white','white'],['black','white','white','black','white'],['white','black','white','white','black'],['white','white','black','white','white']], s: ['0,1','0,4','1,3','2,1','3,0','4,2','4,4'] },
  { t: [['white','black','white','white','white'],['white','white','black','black-0','black'],['black','white','white','white','white'],['white','black','black-3','white','black'],['white','white','white','white','white']], s: ['0,0','0,4','1,1','3,3','4,0','4,4'] },
  { t: [['black','white','black','white','black'],['white','white','white','black','white'],['white','black','white','white','white'],['black','white','white','black','white'],['white','white','black','white','white']], s: ['0,1','1,3','2,0','2,4','3,2','4,0','4,3'] },
  { t: [['white','white','black','white','white'],['black','black-1','white','black','white'],['white','white','black','white','white'],['white','black','white','black-0','white'],['white','white','white','white','black']], s: ['0,0','0,4','1,3','2,1','3,4','4,2'] },
  { t: [['black','white','white','white','black'],['white','white','black','white','white'],['white','black','white','black','white'],['white','white','black-2','white','white'],['black','white','white','white','black']], s: ['0,1','0,4','1,3','2,0','2,4','3,1','4,3'] },
  { t: [['white','black','white','white','white'],['black','white','white','black','white'],['white','white','black','white','white'],['white','black','white','white','black'],['white','white','black','white','white']], s: ['0,0','0,4','1,2','2,0','2,4','3,3','4,1'] },
  { t: [['black','white','black','white','white'],['white','white','white','black','white'],['black','white','black','white','white'],['white','black','white','white','black'],['white','white','white','black','white']], s: ['0,1','1,3','2,2','3,0','4,1','4,4'] },
  { t: [['white','white','white','black','white'],['white','black','white','white','white'],['black','white','black','white','black'],['white','white','white','black','white'],['white','black','white','white','white']], s: ['0,2','1,0','1,4','2,1','3,3','4,0','4,4'] },
  { t: [['black','white','white','black','white'],['white','black','white','white','white'],['white','white','black','white','black'],['white','black','white','white','white'],['black','white','white','black','white']], s: ['0,1','0,4','1,3','2,0','3,2','4,0','4,4'] },
  { t: [['white','black','white','white','black'],['white','white','black','white','white'],['white','black','white','black','white'],['black','white','white','white','black'],['white','white','black','white','white']], s: ['0,0','0,3','1,1','2,3','3,0','4,2','4,4'] },

  // ===== 简单 (difficulty=2) =====
  { t: [['black','black-1','black','white','white'],['white','white','white','black','white'],['white','black','white','white','white'],['black','white','white','black-3','white'],['white','white','black','white','black']], s: ['0,3','1,1','2,0','2,4','3,2','4,1'] },
  { t: [['white','white','black','white','black'],['white','black','white','white','white'],['black','white','black','white','white'],['white','white','white','black-2','white'],['black','white','black','white','white']], s: ['0,0','1,2','1,4','2,3','3,0','4,2','4,4'] },
  { t: [['black','white','white','black','white'],['white','white','black','white','white'],['white','black-0','white','white','black'],['white','white','black','white','white'],['black','white','white','black','white']], s: ['0,1','0,4','1,3','2,2','3,0','4,2','4,4'] },
  { t: [['white','black','white','white','white'],['white','white','black','black-1','black'],['black','white','white','white','white'],['white','black-2','white','black','white'],['white','white','white','white','black']], s: ['0,0','0,4','1,2','3,0','3,4','4,2'] },
  { t: [['black','white','black','white','black'],['white','white','white','black','white'],['white','black-1','white','white','white'],['black','white','white','black','white'],['white','white','black','white','black']], s: ['0,1','1,3','2,0','2,4','3,2','4,0','4,4'] },
  { t: [['white','white','black','white','white'],['black','white','white','black','white'],['white','black','white','white','black'],['white','white','black-3','white','white'],['black','white','white','black','white']], s: ['0,0','0,4','1,2','2,0','3,4','4,1','4,3'] },
  { t: [['black','white','white','black','white'],['white','black','white','white','white'],['white','white','black','white','black'],['white','black','white','black-0','white'],['white','white','white','white','black']], s: ['0,1','0,4','1,3','2,0','3,2','4,0','4,4'] },
  { t: [['white','black','white','white','black'],['white','white','black','white','white'],['black','white','white','black-2','white'],['white','black','white','white','black'],['white','white','black','white','white']], s: ['0,0','0,3','1,1','2,4','3,0','4,2','4,4'] },
  { t: [['black','white','black','white','white'],['white','white','white','black-1','white'],['white','black','white','white','black'],['black','white','black','white','white'],['white','white','white','black','white']], s: ['0,1','1,3','2,0','3,2','4,0','4,4'] },
  { t: [['white','white','black','white','black'],['white','black','white','white','white'],['white','white','black','white','white'],['black-0','white','white','black','white'],['white','black','white','white','black']], s: ['0,0','0,3','1,2','2,4','3,1','4,3'] },
  { t: [['black','white','white','white','black'],['white','black','white','black','white'],['white','white','white','white','black'],['white','black-1','white','black','white'],['black','white','white','white','white']], s: ['0,1','0,4','1,3','2,0','3,2','4,4'] },
  { t: [['white','black','white','black','white'],['white','white','white','white','white'],['black','white','black-0','white','black'],['white','black','white','black','white'],['white','white','white','white','black']], s: ['0,0','0,4','1,2','2,0','2,4','4,1','4,3'] },
  { t: [['black','white','black','white','white'],['white','white','white','black-2','white'],['white','black','white','white','black'],['black','white','black','white','white'],['white','white','white','black','white']], s: ['0,1','0,4','1,3','2,0','3,2','4,0','4,4'] },
  { t: [['white','white','black','white','black'],['white','black','white','white','white'],['black','white','white','black','white'],['white','white','black-1','white','black'],['white','black','white','white','white']], s: ['0,0','0,3','1,2','2,4','3,0','4,2','4,4'] },
  { t: [['black','white','white','black','white'],['white','white','black','white','white'],['white','black','white','white','black'],['white','white','black','white','white'],['black-0','white','white','black','white']], s: ['0,1','0,4','1,3','2,0','3,2','4,4'] },
];
