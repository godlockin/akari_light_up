import { UltraCompactPuzzle } from './codec';

// 6x6 谜题库: 30个 (简单20 + 中等10)
export const PUZZLES_6X6: UltraCompactPuzzle[] = [
  // ===== 简单 (difficulty=2) =====
  { b: 'bwbwww0wwwbwb3wbwwwwwwb2bwbwwwww', s: ['0,1','0,5','1,4','3,0','3,2','4,4','5,1','5,5'] },
  { b: 'wwwbwwb3bb2bwwwwwwbwbwb0bwwbww', s: ['0,0','0,4','2,1','2,3','2,5','4,2','4,5','5,0','5,4'] },
  { b: 'wbwww3bw0bwwwwbwb2bwbwwwbwbwbw', s: ['0,0','0,3','0,5','2,2','2,4','4,0','4,3','4,5','5,1'] },
  { b: 'wwwwwwb4bwb0bwwwwbwb3bwwwwwb0bwb', s: ['0,1','0,4','2,0','2,3','2,5','4,1','4,4','5,3'] },
  { b: 'bwbwb0b3bwbwwwbwb2wwwbwb0bwwww', s: ['0,1','0,5','1,4','3,0','3,3','3,5','5,0','5,2','5,4'] },
  { b: 'wbwwwb2www0bwwwwbwb3wbwwwbww', s: ['0,0','0,3','0,5','2,1','2,4','4,0','4,3','5,2','5,5'] },
  { b: 'bwwwb1bwwwbwbwwb2wbwbwwbwbw', s: ['0,1','0,5','1,3','2,0','2,5','3,2','4,4','5,1','5,3'] },
  { b: 'wwbwww0wb2wbwwwwbwwwbwwbwwww', s: ['0,2','0,5','1,0','1,4','3,1','3,4','4,0','5,2','5,5'] },
  { b: 'bwbwww0b3wwbwbwwb1bwwwwwwwwb', s: ['0,1','0,5','1,2','2,0','2,4','3,3','4,1','5,0','5,4'] },
  { b: 'wbwwb0wwwb1wwbwwb2wwb0wbwwb', s: ['0,0','0,3','0,5','2,2','3,0','3,5','4,3','5,1','5,4'] },
  { b: 'bwwbww2wwwbwwbwbwwbwbwwwwb', s: ['0,1','0,5','1,3','2,0','3,2','4,4','5,1','5,3'] },
  { b: 'wwbwb1wwbwbww0wbwwbwbwwwb', s: ['0,0','0,4','1,2','2,0','3,3','4,1','4,5','5,2'] },
  { b: 'b0bwwb2wwbwbwww0wbwwb1wbwwb', s: ['0,1','0,5','1,3','2,0','3,2','4,4','5,1','5,3'] },
  { b: '0bwbwwwb1wwwwb2wwb0bwwwwb', s: ['0,0','0,3','2,2','2,5','4,1','4,4','5,0','5,3'] },
  { b: 'bwwb2wbwbww0wbwbwwb2wbwbwwb', s: ['0,1','0,5','1,3','2,0','3,2','4,4','5,1','5,3'] },
  { b: 'wwbwww1bwbwwbwbwwb1bwwb', s: ['0,0','0,4','1,2','2,0','3,3','4,1','4,5','5,2'] },
  { b: 'b0bwwb3bwbwwb2wwb0bwwwwb', s: ['0,1','0,5','1,3','2,0','3,2','4,4','5,1','5,3'] },
  { b: 'wbwwb0bwbwwb1wwbwwbwwb', s: ['0,0','0,4','1,2','2,0','2,6','4,3','5,0','6,2','6,5'] },
  { b: 'bwbwwwb3bwbwwb2wwb0bwwb', s: ['0,1','0,5','1,3','2,0','3,2','4,4','5,1','5,3'] },
  { b: 'wwbwwb0wwwb1wwbwbwwbwb1bwwb', s: ['0,0','0,4','1,2','2,0','2,5','4,3','5,0','6,2','6,5'] },

  // ===== 中等 (difficulty=3) =====
  { b: 'wbwwwb0wwb0bwbwwb2wwb1bbwwwwb', s: ['0,0','0,3','0,5','2,1','2,4','4,0','4,3','5,2','5,5'] },
  { b: 'bwwb2wwbwbwww0wbwb3wwbwwwwwb', s: ['0,1','0,5','1,3','2,0','3,2','4,4','5,1','5,3'] },
  { b: 'wwbwwb1bwwbwbwwb3wwb0bwwb', s: ['0,0','0,4','1,2','2,0','2,5','4,3','5,0','6,2','6,5'] },
  { b: 'b0bwwb2wwbwbwww0wbwb1wbwwb', s: ['0,1','0,5','1,3','2,0','3,2','4,4','5,1','5,3'] },
  { b: 'wwbwww1bwbwwb0bwwb3wwb0bwwb', s: ['0,0','0,4','1,2','2,0','3,3','4,1','4,5','5,2','5,5'] },
  { b: 'bwwb0wbwbwwb0wwb2wbwbwwwb', s: ['0,1','0,5','1,3','2,0','2,5','4,2','4,4','5,0','5,3'] },
  { b: 'wbwwb1bwbwwb2wwb0bwwwwwb', s: ['0,0','0,4','1,2','2,0','3,3','4,1','4,5','5,2'] },
  { b: 'b0bwwb3wwbwbwwwb2wwbwbwbwwb', s: ['0,1','0,5','1,3','2,0','3,2','4,4','5,0','5,3'] },
  { b: 'wbwwb1bwwb0bwwb3wwb0bwwb', s: ['0,0','0,4','1,2','2,0','2,6','4,3','5,0','6,2','6,5'] },
  { b: 'bwwb0wbwbwwb3wwb2wbwbwwwb', s: ['0,1','0,5','1,3','2,0','3,2','4,4','5,1','5,3'] },
];
