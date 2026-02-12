import { useState, useCallback } from 'react';
import { Cell } from '../core/types';
import { cloneGrid } from '../core/solver';

interface HistoryState {
  grid: Cell[][];
}

export function useHistory(_initialGrid: Cell[][] = []) {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const pushState = useCallback((grid: Cell[][]) => {
    setHistory(prev => {
      // 如果在历史中间，截断后面的记录
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ grid: cloneGrid(grid) });
      // 限制历史记录数量
      if (newHistory.length > 100) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setCurrentIndex(prev => Math.min(prev + 1, 99));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return cloneGrid(history[currentIndex - 1].grid);
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return cloneGrid(history[currentIndex + 1].grid);
    }
    return null;
  }, [currentIndex, history]);

  const reset = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    pushState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  };
}