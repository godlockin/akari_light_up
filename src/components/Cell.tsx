import React from 'react';
import { Cell as CellType, getCellNumber, isBlackCell } from '../core/types';

interface CellProps {
  cell: CellType;
  row: number;
  col: number;
  onClick: (row: number, col: number) => void;
}

const CellComponent: React.FC<CellProps> = ({ cell, row, col, onClick }) => {
  const handleClick = () => {
    onClick(row, col);
  };

  const isBlack = isBlackCell(cell.type);
  const number = getCellNumber(cell.type);

  // 基础样式
  let baseClass = 'w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer transition-all duration-200 border border-gray-300 ';

  if (isBlack) {
    // 黑格样式
    baseClass += 'bg-gray-800 text-white font-bold ';
    if (cell.hasError) {
      baseClass += 'ring-2 ring-red-500 ring-offset-1 ';
    }
  } else {
    // 白格样式
    if (cell.bulb) {
      baseClass += 'bg-yellow-400 ';
    } else if (cell.illuminated) {
      baseClass += 'bg-yellow-100 ';
    } else if (cell.marked) {
      baseClass += 'bg-gray-200 ';
    } else {
      baseClass += 'bg-white hover:bg-gray-50 ';
    }

    // 错误高亮
    if (cell.hasError) {
      baseClass += 'ring-2 ring-red-500 ring-offset-1 ';
    }

    // 提示高亮
    if (cell.isHinted) {
      baseClass += 'ring-2 ring-green-500 ring-offset-1 animate-pulse ';
    }
  }

  return (
    <div className={baseClass} onClick={handleClick}>
      {isBlack ? (
        number !== null ? (
          <span className="text-sm sm:text-base">{number}</span>
        ) : null
      ) : cell.bulb ? (
        <span className="text-lg sm:text-xl">💡</span>
      ) : cell.marked ? (
        <span className="text-gray-500 text-lg sm:text-xl">✕</span>
      ) : null}
    </div>
  );
};

export default React.memo(CellComponent);