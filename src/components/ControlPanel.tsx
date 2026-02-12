import React from 'react';

interface ControlPanelProps {
  onHint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onHint,
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      <button
        onClick={onHint}
        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        提示
      </button>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        撤销
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        重做
      </button>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
      >
        重置
      </button>
    </div>
  );
};

export default React.memo(ControlPanel);