import React, { useState, useEffect } from 'react';

interface TimerProps {
  startTime: number | null;
  isRunning: boolean;
}

const Timer: React.FC<TimerProps> = ({ startTime, isRunning }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime || !isRunning) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isRunning]);

  useEffect(() => {
    if (!isRunning && startTime) {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }
  }, [isRunning, startTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-xl font-mono">
      <span>⏱</span>
      <span>{formatTime(elapsed)}</span>
    </div>
  );
};

export default React.memo(Timer);