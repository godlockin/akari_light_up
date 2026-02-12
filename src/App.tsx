import { useState } from 'react'
import GameBoard from './components/GameBoard'
import ControlPanel from './components/ControlPanel'
import Timer from './components/Timer'
import { useGame } from './hooks/useGame'

function App() {
  const {
    grid,
    status,
    isGenerating,
    generateProgress,
    generatePuzzle,
    handleCellClick,
    resetGame,
    undo,
    redo,
    canUndo,
    canRedo,
    getHint,
    startTime,
  } = useGame()

  const [selectedSize, setSelectedSize] = useState<number>(7)
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(2)
  const [customSize, setCustomSize] = useState<string>('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const sizeOptions = [
    { value: 5, label: '5×5' },
    { value: 7, label: '7×7' },
    { value: 10, label: '10×10' },
    { value: 15, label: '15×15' },
    { value: 20, label: '20×20' },
    { value: 25, label: '25×25' },
    { value: 0, label: '自定义' },
  ]

  const difficultyOptions = [
    { value: 1, label: '入门' },
    { value: 2, label: '简单' },
    { value: 3, label: '中等' },
    { value: 4, label: '困难' },
    { value: 5, label: '专家' },
  ]

  const handleGenerate = async () => {
    let finalSize = selectedSize
    if (selectedSize === 0) {
      const parsed = parseInt(customSize, 10)
      if (isNaN(parsed) || parsed < 5 || parsed > 25) {
        alert('请输入5-25之间的数字')
        return
      }
      finalSize = parsed
    }
    await generatePuzzle(finalSize, selectedDifficulty)
  }

  const handleSizeChange = (value: number) => {
    setSelectedSize(value)
    setShowCustomInput(value === 0)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          美术馆亮灯挑战
        </h1>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-600">棋盘大小:</label>
              <select
                value={selectedSize}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                disabled={isGenerating}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {sizeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {showCustomInput && (
                <input
                  type="number"
                  min={5}
                  max={25}
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  disabled={isGenerating}
                  placeholder="5-25"
                  className="border border-gray-300 rounded px-3 py-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-600">难度:</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
                disabled={isGenerating}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {difficultyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold px-6 py-2 rounded transition-colors"
            >
              {isGenerating ? '生成中...' : '生成新挑战'}
            </button>
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>正在生成谜题...</span>
                <span>{generateProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${generateProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                正在尝试多种策略生成有效谜题，请稍候...
              </p>
            </div>
          )}
        </div>

        {/* Game Board */}
        {grid.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <GameBoard
                grid={grid}
                onCellClick={handleCellClick}
              />
            </div>

            {/* Bottom Controls */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <Timer startTime={startTime} isRunning={status === 'playing'} />

                <ControlPanel
                  onHint={getHint}
                  onUndo={undo}
                  onRedo={redo}
                  onReset={resetGame}
                  canUndo={canUndo}
                  canRedo={canRedo}
                />
              </div>
            </div>

            {/* Victory Message */}
            {status === 'won' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 text-center shadow-xl">
                  <h2 className="text-2xl font-bold text-green-600 mb-4">恭喜通关!</h2>
                  <p className="text-gray-600 mb-6">
                    用时: <Timer startTime={startTime} isRunning={false} />
                  </p>
                  <button
                    onClick={handleGenerate}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded transition-colors"
                  >
                    生成新挑战
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              选择棋盘大小和难度，点击"生成新挑战"开始游戏
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
