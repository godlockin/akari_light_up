import { useState, useCallback, useRef } from 'react';
import { Cell, CellType, GameStatus } from '../core/types';
import { generatePuzzle } from '../core/generator';
import {
  createEmptyGrid,
  cloneGrid,
  updateIllumination,
  updateErrors,
  checkWin,
  getHintPosition,
} from '../core/solver';
import { useHistory } from './useHistory';

export function useGame() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [size, setSize] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [solution, setSolution] = useState<Set<string>>(new Set());
  const [hintMessage, setHintMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const { pushState, undo: undoHistory, redo: redoHistory, reset: resetHistory, canUndo, canRedo } = useHistory();

  const generateNewPuzzle = useCallback((newSize: number, newDifficulty: number, maxRetries = 5) => {
    setIsGenerating(true);

    // 使用 setTimeout 让 UI 有机会更新
    setTimeout(() => {
      let result = null;
      let attempts = 0;

      // 自动重试直到成功或达到最大重试次数
      while (!result && attempts < maxRetries) {
        result = generatePuzzle(newSize, newDifficulty);
        attempts++;
      }

      if (result) {
        const newGrid = createEmptyGrid(newSize, result.types);
        updateIllumination(newGrid);

        setGrid(newGrid);
        setSize(newSize);
        setDifficulty(newDifficulty);
        setSolution(result.solution);
        setStatus('playing');
        setHintMessage('');
        resetHistory();
        pushState(newGrid);

        const now = Date.now();
        startTimeRef.current = now;
        setStartTime(now);

        if (attempts > 1) {
          console.log(`谜题生成成功，重试次数: ${attempts}`);
        }
      } else {
        alert('生成谜题失败，请尝试其他难度或尺寸');
      }

      setIsGenerating(false);
    }, 10);
  }, [pushState, resetHistory]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (status !== 'playing') return;

    setGrid(prevGrid => {
      const cell = prevGrid[row][col];
      // 不能操作黑格
      if (cell.type !== 'white') return prevGrid;

      const newGrid = cloneGrid(prevGrid);

      // 三态循环：空白 -> 灯泡 -> 标记 -> 空白
      if (!cell.bulb && !cell.marked) {
        // 放置灯泡
        newGrid[row][col].bulb = true;
      } else if (cell.bulb) {
        // 移除灯泡，添加标记
        newGrid[row][col].bulb = false;
        newGrid[row][col].marked = true;
      } else if (cell.marked) {
        // 移除标记
        newGrid[row][col].marked = false;
      }

      // 更新照亮状态和错误检测
      updateIllumination(newGrid);
      updateErrors(newGrid);

      // 检查胜利
      if (checkWin(newGrid)) {
        setStatus('won');
      }

      pushState(newGrid);
      return newGrid;
    });
  }, [status, pushState]);

  const resetGame = useCallback(() => {
    if (grid.length === 0) return;

    const types: CellType[][] = grid.map(row => row.map(cell => cell.type));
    const newGrid = createEmptyGrid(size, types);
    updateIllumination(newGrid);

    setGrid(newGrid);
    setStatus('playing');
    setHintMessage('');
    resetHistory();
    pushState(newGrid);

    const now = Date.now();
    startTimeRef.current = now;
    setStartTime(now);
  }, [grid, size, pushState, resetHistory]);

  const undo = useCallback(() => {
    const prevGrid = undoHistory();
    if (prevGrid) {
      setGrid(prevGrid);
      // 检查当前状态
      if (checkWin(prevGrid)) {
        setStatus('won');
      }
    }
  }, [undoHistory]);

  const redo = useCallback(() => {
    const nextGrid = redoHistory();
    if (nextGrid) {
      setGrid(nextGrid);
      if (checkWin(nextGrid)) {
        setStatus('won');
      }
    }
  }, [redoHistory]);

  const getHint = useCallback(() => {
    if (status !== 'playing' || solution.size === 0) return;

    // 清除之前的提示
    setGrid(prevGrid => {
      const newGrid = cloneGrid(prevGrid);
      for (let row = 0; row < newGrid.length; row++) {
        for (let col = 0; col < newGrid[row].length; col++) {
          newGrid[row][col].isHinted = false;
        }
      }
      return newGrid;
    });

    const hint = getHintPosition(grid, solution);
    if (hint) {
      setGrid(prevGrid => {
        const newGrid = cloneGrid(prevGrid);
        newGrid[hint.position.row][hint.position.col].isHinted = true;
        return newGrid;
      });
      setHintMessage(hint.reason);

      // 3秒后清除提示
      setTimeout(() => {
        setGrid(prevGrid => {
          const newGrid = cloneGrid(prevGrid);
          for (let row = 0; row < newGrid.length; row++) {
            for (let col = 0; col < newGrid[row].length; col++) {
              newGrid[row][col].isHinted = false;
            }
          }
          return newGrid;
        });
        setHintMessage('');
      }, 3000);
    } else {
      setHintMessage('没有可用的提示');
      setTimeout(() => setHintMessage(''), 3000);
    }
  }, [status, solution, grid]);

  return {
    grid,
    size,
    difficulty,
    status,
    isGenerating,
    generatePuzzle: generateNewPuzzle,
    handleCellClick,
    resetGame,
    undo,
    redo,
    canUndo,
    canRedo,
    getHint,
    hintMessage,
    startTime,
  };
}