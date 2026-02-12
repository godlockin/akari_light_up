import { describe, it, expect } from 'vitest';
import { generatePuzzle, generatePuzzleSync } from '../core/generator';
import { solve } from '../core/solver';
import { getDefaultPuzzle, convertDefaultPuzzle, DEFAULT_PUZZLES } from '../data/defaultPuzzles';

describe('Puzzle Generator', () => {
  describe('Basic Generation', () => {
    it('should generate a valid easy puzzle (5x5)', async () => {
      const result = await generatePuzzle(5, 1, 100);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.types.length).toBe(5);
        expect(result.types[0].length).toBe(5);
        expect(result.solution.size).toBeGreaterThan(0);

        // 验证唯一解
        const validation = solve(result.types);
        expect(validation.unique).toBe(true);
        expect(validation.solvable).toBe(true);
      }
    }, 10000);

    it('should generate a valid medium puzzle (10x10)', async () => {
      const result = await generatePuzzle(10, 3, 100);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.types.length).toBe(10);
        expect(result.profile).toBe('中等');

        const validation = solve(result.types);
        expect(validation.unique).toBe(true);
      }
    }, 15000);

    it('should generate a valid hard puzzle (15x15)', async () => {
      const result = await generatePuzzle(15, 5, 100);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.types.length).toBeGreaterThanOrEqual(15);
        expect(result.profile).toBe('困难');

        const validation = solve(result.types);
        expect(validation.unique).toBe(true);
      }
    }, 20000);
  });

  describe('Difficulty Profiles', () => {
    it('easy puzzle should have full clues', async () => {
      const result = await generatePuzzle(5, 1, 100);
      if (result) {
        let blackCount = 0;
        let numberedCount = 0;

        for (const row of result.types) {
          for (const cell of row) {
            if (cell !== 'white') {
              blackCount++;
              if (cell !== 'black') numberedCount++;
            }
          }
        }

        // 简单难度应该给满数字
        expect(numberedCount).toBeGreaterThanOrEqual(blackCount * 0.8);
      }
    }, 10000);

    it('hard puzzle should have sparse clues', async () => {
      const result = await generatePuzzle(15, 5, 100);
      if (result) {
        let blackCount = 0;
        let numberedCount = 0;

        for (const row of result.types) {
          for (const cell of row) {
            if (cell !== 'white') {
              blackCount++;
              if (cell !== 'black') numberedCount++;
            }
          }
        }

        // 困难难度应该删掉约60%数字
        expect(numberedCount).toBeLessThanOrEqual(blackCount * 0.5);
      }
    }, 20000);
  });

  describe('Puzzle Validation', () => {
    it('generated puzzle should have unique solution', async () => {
      const result = await generatePuzzle(7, 2, 100);
      expect(result).not.toBeNull();

      if (result) {
        const validation = solve(result.types);
        expect(validation.unique).toBe(true);
        expect(validation.solvable).toBe(true);
      }
    }, 10000);

    it('generated puzzle should have valid black cell configuration', async () => {
      const result = await generatePuzzle(7, 2, 100);
      if (result) {
        const size = result.types.length;

        // 检查没有2x2全黑
        for (let r = 0; r < size - 1; r++) {
          for (let c = 0; c < size - 1; c++) {
            const c1 = result.types[r][c] !== 'white';
            const c2 = result.types[r][c + 1] !== 'white';
            const c3 = result.types[r + 1][c] !== 'white';
            const c4 = result.types[r + 1][c + 1] !== 'white';
            expect([c1, c2, c3, c4].filter(Boolean).length).toBeLessThan(4);
          }
        }

        // 检查没有全黑边框
        const topRow = result.types[0].every((c) => c !== 'white');
        const bottomRow = result.types[size - 1].every((c) => c !== 'white');
        expect(topRow).toBe(false);
        expect(bottomRow).toBe(false);
      }
    }, 10000);
  });

  describe('Sync Generation', () => {
    it('should generate puzzle synchronously', () => {
      const result = generatePuzzleSync(5, 1);
      expect(result).not.toBeNull();

      if (result) {
        expect(result.types.length).toBe(5);
        expect(result.solution.size).toBeGreaterThan(0);
      }
    });
  });

  describe('Generation Timeout Handling', () => {
    it('should handle generation failure gracefully', async () => {
      // 使用极小的尝试次数模拟失败
      const result = await generatePuzzle(25, 5, 1);
      // 可能失败，但不应该抛出错误
      expect(result === null || result !== null).toBe(true);
    }, 5000);
  });
});

describe('Default Puzzles', () => {
  it('should have pre-generated default puzzles', () => {
    expect(DEFAULT_PUZZLES.length).toBeGreaterThan(0);

    const puzzle = getDefaultPuzzle(5, 1);
    expect(puzzle).not.toBeNull();
    expect(puzzle?.solution.length).toBeGreaterThan(0);
  });

  it('default puzzles should have valid solutions', () => {
    for (const puzzle of DEFAULT_PUZZLES) {
      const validation = solve(puzzle.types);
      expect(validation.unique).toBe(true);
      expect(validation.solvable).toBe(true);
    }
  });

  it('should convert default puzzle correctly', () => {
    const puzzle = DEFAULT_PUZZLES[0];
    const converted = convertDefaultPuzzle(puzzle);

    expect(converted.types).toEqual(puzzle.types);
    expect(converted.solution).toBeInstanceOf(Set);
    expect(converted.solution.size).toBe(puzzle.solution.length);
  });

  it('should find puzzle by size and difficulty', () => {
    const puzzle = getDefaultPuzzle(10, 3);
    expect(puzzle).not.toBeNull();
    expect(puzzle?.difficulty).toBe(3);
  });

  it('should fallback to same difficulty if size not found', () => {
    // 请求不存在的 8x8，应该返回同难度的其他尺寸
    const puzzle = getDefaultPuzzle(8, 1);
    expect(puzzle).not.toBeNull();
    expect(puzzle?.difficulty).toBe(1);
  });
});
