# 美术馆亮灯挑战 (Akari/Light Up)

一个可部署到 Cloudflare Pages 的在线益智游戏。

## 游戏规则

1. **光线方向**：灯泡沿横纵四个方向照射，不斜射
2. **光线阻挡**：黑格（墙壁）阻挡光线，无法穿透
3. **黑格类型**：
   - 带数字：约束上下左右灯数量
   - 无数字：纯阻挡光线
4. **数字约束**：黑格数字约束其上下左右4格的灯数量，对角不受限
5. **灯不互照**：每个灯不能被其他灯照亮
6. **胜利条件**：所有白色格子都被灯泡或光线覆盖

## 操作说明

- **点击白格**：循环切换三种状态
  - 空白 → 放置灯泡 💡 + 照亮区域
  - 灯泡 → 移除灯泡 + 标记 ❌
  - 标记 → 清除标记

## 功能特性

- 支持 5×5 到 25×25 自定义棋盘大小
- 5级难度（入门/简单/中等/困难/专家）
- 撤销/重做功能
- 提示功能（显示可确定的灯泡位置）
- 实时错误检测（灯照灯、数字超限）
- 计时器

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 部署到 Cloudflare Pages

### 方式一：Git 集成部署（推荐）

1. 将代码推送到 GitHub/GitLab 仓库
2. 登录 Cloudflare Dashboard → Pages
3. 点击 "Create a project"
4. 连接你的 Git 仓库
5. 构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. 点击 "Save and Deploy"

### 方式二：Wrangler CLI 部署

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
wrangler pages deploy dist
```

### 方式三：直接上传

1. 运行 `npm run build` 生成 `dist` 目录
2. 登录 Cloudflare Dashboard → Pages
3. 点击 "Upload assets"
4. 拖拽 `dist` 文件夹上传

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- 自定义谜题生成算法（模板填充 + 逆向生成）
- 求解器（约束传播 + 回溯）
