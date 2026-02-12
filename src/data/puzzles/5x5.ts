import { UltraCompactPuzzle } from './codec';

// 5x5 谜题库: 30个 (入门15 + 简单15)
// 编码: w=white, b=black, 0-4=black-0到black-4
export const PUZZLES_5X5: UltraCompactPuzzle[] = [
  // ===== 入门 (difficulty=1) =====
  { b: 'b0bwwwwwwwb3wbwwwwwwwwbww', s: ['1,1','1,4','3,0','3,3','4,1','4,4'] },
  { b: 'wwbwwwb4bwbb0wb0bwbwbwwbww', s: ['0,0','0,4','2,2','4,0','4,4'] },
  { b: 'wwwwwb3bw wwwwwbwb2bwwwww', s: ['0,1','0,4','2,0','2,3','4,1','4,4'] },
  { b: 'b0bwwwwwwwwb4bwwwwwwb0b', s: ['1,1','1,4','2,0','2,4','3,2','4,1'] },
  { b: 'wwwbwb2b0bwwwwwb0bwwwww', s: ['0,0','0,3','2,1','2,4','4,0','4,3'] },
  { b: 'bwwbwwwwbwwbwbwwwwwbwwwwb', s: ['0,1','0,4','1,3','2,1','3,0','4,2','4,4'] },
  { b: 'wbwwwb0bwwwwwwb3wbwwwww', s: ['0,0','0,4','1,1','3,3','4,0','4,4'] },
  { b: 'bwbwwwwbwwwwbwbwwwwwwbw', s: ['0,1','1,3','2,0','2,4','3,2','4,0','4,3'] },
  { b: 'wwbwwb1wbwwbwwb0wwwb', s: ['0,0','0,4','1,3','2,1','3,4','4,2'] },
  { b: 'bwwwbwwwwb2wwwbwwwwwb', s: ['0,1','0,4','1,3','2,0','2,4','3,1','4,3'] },
  { b: 'wbwwwwbwwwwbwwbwwwwwb', s: ['0,0','0,4','1,2','2,0','2,4','3,3','4,1'] },
  { b: 'bwbwwwwbwwbwwwwwbww', s: ['0,1','1,3','2,2','3,0','4,1','4,4'] },
  { b: 'wwwbwwwwbwbwwwwwbwwww', s: ['0,2','1,0','1,4','2,1','3,3','4,0','4,4'] },
  { b: 'bwwbwwwwbwbwwwwbww', s: ['0,1','0,4','1,3','2,0','3,2','4,0','4,4'] },
  { b: 'wbwwbwbwwwwbwwwwb', s: ['0,0','0,3','1,1','2,3','3,0','4,2','4,4'] },

  // ===== 简单 (difficulty=2) =====
  { b: 'b1bwwbwwwwb3wwwwwwb2bwb', s: ['0,3','1,1','2,0','2,4','3,2','4,1'] },
  { b: 'wwbwbwwbwwwbwwbwbww', s: ['0,0','1,2','1,4','2,3','3,0','4,2','4,4'] },
  { b: 'bwwbwwwwb0wwwwbwbww', s: ['0,1','0,4','1,3','2,2','3,0','4,2','4,4'] },
  { b: 'wwb1bwwb0wwwwb2wwb', s: ['0,0','0,4','1,2','3,0','3,4','4,2'] },
  { b: 'bwbwwb1wwwwbwbwwb', s: ['0,1','1,3','2,0','2,4','3,2','4,0','4,4'] },
  { b: 'wwwwbwwb0wwb3wwwwbwb', s: ['0,0','0,4','1,2','2,0','3,4','4,1','4,3'] },
  { b: 'bwwbwwwwb2wwwwb0bww', s: ['0,1','0,4','1,3','2,0','3,2','4,0','4,4'] },
  { b: 'wbwwb0wwbwwwwb2wwb', s: ['0,0','0,3','1,1','2,4','3,0','4,2','4,4'] },
  { b: 'bwbwwwwb1wwbwbww', s: ['0,1','0,4','1,3','2,0','3,2','4,4'] },
  { b: 'wwbwb1wwbwwwwb0wb', s: ['0,0','0,3','1,2','2,5','3,1','4,3'] },
  { b: 'bwwwbwwbwwwwb1wwwwb', s: ['0,1','0,4','1,3','2,0','3,2','4,4'] },
  { b: 'wbwwb0bwbwbwwwwwb', s: ['0,0','0,4','1,2','2,0','2,4','4,1','4,3'] },
  { b: 'b0bwwb2wwbwbww', s: ['0,1','0,5','1,3','2,0','3,2','4,0','4,4'] },
  { b: 'wwbwb0wwb1wwbwbww', s: ['0,0','0,4','1,2','2,0','3,3','4,1','4,5'] },
  { b: 'bwwbwwwwbwbwwb', s: ['0,1','0,4','1,3','2,0','3,2','4,4'] },
];
