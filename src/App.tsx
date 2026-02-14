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
    isUsingDefault,
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

  const [selectedSize, setSelectedSize] = useState<number>(5)

  const sizeOptions = [
    { value: 5, label: '5×5' },
    { value: 6, label: '6×6' },
    { value: 7, label: '7×7' },
    { value: 10, label: '10×10' },
  ]

  const handleGenerate = async () => {
    await generatePuzzle(selectedSize)
  }

  const handleSizeChange = (value: number) => {
    setSelectedSize(value)
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

        {/* Rules */}
        {!grid.length && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📜 游戏规则</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <p><span className="font-semibold text-blue-600">1.</span> 点击白格放置灯泡 💡，照亮整行整列</p>
                <p><span className="font-semibold text-blue-600">2.</span> 黑格（墙壁）会阻挡光线传播</p>
                <p><span className="font-semibold text-blue-600">3.</span> 带数字的黑格：周围4格必须有对应数量的灯</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-semibold text-blue-600">4.</span> 任意两个灯泡不能互相照到（红框错误提示）</p>
                <p><span className="font-semibold text-blue-600">5.</span> 所有白格必须被照亮才能获胜</p>
                <p><span className="font-semibold text-blue-600">6.</span> 点击循环：空白 → 灯泡 → 标记❌ → 空白</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Board */}
        {grid.length > 0 ? (
          <>
            {isUsingDefault && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-700 text-center">
                  📌 当前为题库精选谜题（随机选择 + 随机变换）
                </p>
              </div>
            )}
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
              选择棋盘大小，点击"生成新挑战"开始游戏
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
