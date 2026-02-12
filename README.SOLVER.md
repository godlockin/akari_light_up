# Akari Light Up 求解器

## TypeScript 求解器

位置: `scripts/solver.ts`

### 用法

\`\`bash
bun scripts/solver.ts <编码字符串> <大小> [选项]
\`\`

### 参数

| 参数 | 说明 |
|------|------|
| `<编码字符串>` | 棋盘编码，例如: `wwbwbwwb3bw0bwwwwwbwwwb4bwwbwwbwwbwb0bwb2bwwwwwww` |
| `<大小>` | 棋盘大小，例如: 7 |
| `--show-board` | 显示棋盘（可视化） |
| `--show-solution` | 显示解（可视化） |
| `--max-solutions <n>` | 最多找 n 个解（默认1） |
| `--timeout <ms>` | 超时时间（毫秒） |

### 编码格式

- `w` / `.`: 白格
- `b` / `#`: 黑格（无数字）
- `0-4`: 黑格（带数字）

### 示例

\`\`bash
# 显示第一个 7x7 谜题
bun scripts/solver.ts wwbwbwwb3bw0bwwwwwbwwwb4bwwbwwbwwbwb0bwb2bwwwwwww 7 --show-solution

# 显示棋盘但不求解
bun scripts/solver.ts wwbwbwwb3bw0bwwwwwbwwwb4bwwbwwbwwbwb0bwb2bwwwwwww 7 --show-board
\`\`

### 输出说明

- **可解**: 谜题是否有解
- **唯一解**: 是否只有一个有效解
- **解的数量**: 找到的解的数量
- **回溯步数**: 算法尝试次数
- **传播调用**: 约束传播次数
- **最大深度**: 回溯最大深度
- **灯泡数量**: 解中的灯泡数
- **灯泡位置**: 灯泡坐标列表 (row, col)

## 关于预设谜题

**注意**: 当前谜题库中的大部分预设谜题可能存在问题（无法求解或有多解）。建议使用此求解器验证和调试谜题生成逻辑。
