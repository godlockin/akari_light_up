// 格子类型
export type CellType =
  | 'white'           // 白格（可放灯）
  | 'black'           // 黑格（无数字，纯阻挡）
  | 'black-0'         // 黑格数字0
  | 'black-1'         // 黑格数字1
  | 'black-2'         // 黑格数字2
  | 'black-3'         // 黑格数字3
  | 'black-4';        // 黑格数字4

// 格子状态
export interface Cell {
  type: CellType;
  bulb: boolean;          // 是否有灯泡
  marked: boolean;        // 是否被标记(×)
  illuminated: boolean;   // 是否被照亮
  hasError: boolean;      // 是否有错误
  isHinted: boolean;      // 是否被提示高亮
}

// 游戏状态
export type GameStatus = 'idle' | 'playing' | 'won';

// 难度配置
export interface DifficultyConfig {
  blackRatio: [number, number];     // 黑格比例范围
  clueDensity: [number, number];    // 数字提示密度
  minBacktrackDepth: number;        // 最小回溯深度
}

// 难度映射
export const DIFFICULTY_CONFIG: Record<number, DifficultyConfig> = {
  1: { blackRatio: [0.15, 0.20], clueDensity: [0.60, 0.80], minBacktrackDepth: 0 },
  2: { blackRatio: [0.20, 0.25], clueDensity: [0.40, 0.60], minBacktrackDepth: 1 },
  3: { blackRatio: [0.25, 0.30], clueDensity: [0.25, 0.40], minBacktrackDepth: 2 },
  4: { blackRatio: [0.30, 0.35], clueDensity: [0.15, 0.25], minBacktrackDepth: 3 },
  5: { blackRatio: [0.35, 0.40], clueDensity: [0.05, 0.15], minBacktrackDepth: 5 },
};

// 坐标
export interface Position {
  row: number;
  col: number;
}

// 推理步骤（用于提示）
export interface ReasoningStep {
  position: Position;
  action: 'place_bulb' | 'mark';
  reason: string;
}

// 求解结果
export interface SolveResult {
  solvable: boolean;
  unique: boolean;
  solution: Set<string>;      // 灯泡位置集合，格式 "row,col"
  steps: ReasoningStep[];
}

// 辅助函数：位置转字符串
export function posToString(row: number, col: number): string {
  return `${row},${col}`;
}

// 辅助函数：字符串转位置
export function stringToPos(str: string): Position {
  const [row, col] = str.split(',').map(Number);
  return { row, col };
}

// 检查是否是黑格
export function isBlackCell(type: CellType): boolean {
  return type !== 'white';
}

// 检查黑格是否有数字
export function hasNumber(type: CellType): boolean {
  return type.startsWith('black-');
}

// 获取黑格数字
export function getCellNumber(type: CellType): number | null {
  if (!hasNumber(type)) return null;
  return parseInt(type.split('-')[1], 10);
}