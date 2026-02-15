import { useState, useCallback, useRef } from 'react';
import { Cell, CellType, GameStatus } from '../core/types';
import { generatePuzzle, generatePuzzleSync } from '../core/generator';
import {
  createEmptyGrid,
  cloneGrid,
  updateIllumination,
  updateErrors,
  checkWin,
  getHintPosition,
} from '../core/solver';
import { useHistory } from './useHistory';
import {
  getRandomPuzzleFromBank,
  convertPuzzleEntry,
} from '../data/puzzles/index';

export function useGame() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [size, setSize] = useState(0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [solution, setSolution] = useState<Set<string>>(new Set());
  const [hintMessage, setHintMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [isUsingDefault, setIsUsingDefault] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [hintCount, setHintCount] = useState(0);

  const { pushState, undo: undoHistory, redo: redoHistory, reset: resetHistory, canUndo, canRedo } = useHistory();

  // 加载默认谜题（从谜题库随机选择）
  const loadDefaultPuzzle = useCallback((newSize: number) => {
    const puzzle = getRandomPuzzleFromBank(newSize, 1);

    if (puzzle) {
      console.log(`使用谜题库谜题: ${puzzle.id}`);
      const converted = convertPuzzleEntry(puzzle);
      const newGrid = createEmptyGrid(puzzle.size, converted.types);
      updateIllumination(newGrid);

      setGrid(newGrid);
      setSize(puzzle.size);
      setSolution(converted.solution);
      setStatus('playing');
      setHintMessage('');
      setStatus('playing');
      setHintMessage('');
      setHintCount(0);
      setIsUsingDefault(true);
      resetHistory();
      pushState(newGrid);

      const now = Date.now();
      startTimeRef.current = now;
      setStartTime(now);

      return true;
    }

    return false;
  }, [pushState, resetHistory]);

  // 异步生成谜题，带重试和默认题目 fallback
  const generateNewPuzzle = useCallback(async (newSize: number) => {
    setIsGenerating(true);
    setGenerateProgress(0);
    setIsUsingDefault(false);

    // 优先尝试从题库加载（对于已支持的尺寸）
    if ([5, 6, 7, 10, 12].includes(newSize)) {
      if (loadDefaultPuzzle(newSize)) {
        setIsGenerating(false);
        return;
      }
    }

    // 使用 requestAnimationFrame 让 UI 更新
    await new Promise(resolve => requestAnimationFrame(resolve));

    // 设置超时时间（3秒）
    const TIMEOUT = 3000;
    const startTime = Date.now();

    try {
      // 优先使用异步生成，支持进度回调
      const result = await generatePuzzle(
        newSize,
        1,
        200, // 最多尝试 200 次
        (attempt) => {
          const progress = Math.min(90, Math.round((attempt / 200) * 100));
          setGenerateProgress(progress);

          // 检查是否超时
          if (Date.now() - startTime > TIMEOUT) {
            console.log('生成超时，切换到默认谜题');
            throw new Error('TIMEOUT');
          }
        }
      );

      if (result) {
        console.log(`使用配置 [${result.profile}] 生成成功`);
        const newGrid = createEmptyGrid(newSize, result.types);
        updateIllumination(newGrid);

        setGrid(newGrid);
        setSize(newSize);
        setSolution(result.solution);
        setStatus('playing');
        setHintMessage('');
        setStatus('playing');
        setHintMessage('');
        setHintCount(0);
        setIsUsingDefault(false);
        resetHistory();
        pushState(newGrid);

        const now = Date.now();
        startTimeRef.current = now;
        setStartTime(now);
      } else {
        // 如果异步生成返回 null，尝试 fallback
        throw new Error('GENERATION_FAILED');
      }
    } catch (error) {
      console.log('实时生成失败，尝试使用默认谜题...');

      // 尝试加载默认谜题
      const loaded = loadDefaultPuzzle(newSize);

      if (!loaded) {
        // 如果没有合适的默认谜题，尝试同步生成作为最后手段
        console.log('尝试同步生成...');
        const syncResult = generatePuzzleSync(newSize, 1);

        if (syncResult) {
          const newGrid = createEmptyGrid(newSize, syncResult.types);
          updateIllumination(newGrid);

          setGrid(newGrid);
          setSize(newSize);
          setSolution(syncResult.solution);
          setStatus('playing');
          setHintMessage('');
          setStatus('playing');
          setHintMessage('');
          setHintCount(0);
          setIsUsingDefault(false);
          resetHistory();
          pushState(newGrid);

          const now = Date.now();
          startTimeRef.current = now;
          setStartTime(now);
        } else {
          alert('生成谜题失败，请尝试其他难度或尺寸');
        }
      }
    } finally {
      setIsGenerating(false);
      setGenerateProgress(0);
    }
  }, [pushState, resetHistory, loadDefaultPuzzle]);

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
    setStatus('playing');
    setHintMessage('');
    setHintCount(0);
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

      // Calculate distinct bulbs count (solution size)
      const totalBulbs = solution.size;
      const penaltyThreshold = Math.floor(totalBulbs * 0.8);

      // Calculate penalty: 2s usually, 20s if exceeding threshold
      const penaltySeconds = hintCount < penaltyThreshold ? 2 : 20;
      setHintCount(prev => prev + 1);

      if (startTime) {
        setStartTime(prev => prev ? prev - (penaltySeconds * 1000) : null);
        if (startTimeRef.current) {
          startTimeRef.current -= (penaltySeconds * 1000);
        }
      }

      setHintMessage(`${hint.reason} (+${penaltySeconds}秒)`);

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
    status,
    isGenerating,
    generateProgress,
    isUsingDefault,
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
