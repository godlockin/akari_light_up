import React from 'react';
import { Cell } from '../core/types';
import CellComponent from './Cell';

interface GameBoardProps {
  grid: Cell[][];
  onCellClick: (row: number, col: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ grid, onCellClick }) => {
  if (grid.length === 0) return null;

  const size = grid.length;

  return (
    <div className="flex flex-col items-center">
      <div
        className="grid gap-0 bg-gray-400 p-0.5 rounded"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <CellComponent
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              row={rowIndex}
              col={colIndex}
              onClick={onCellClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(GameBoard);