# 宇宙冥想空间

一个帮助用户通过宇宙视角减轻烦恼的沉浸式冥想应用。

## 功能特点

- 🌌 沉浸式宇宙场景动画
- 🧘‍♀️ 引导式冥想体验
- 🎵 舒缓的背景音乐
- 📱 响应式设计
- 🌟 现代化UI设计

## 技术栈

- React 18
- Vite
- Tailwind CSS
- React Router
- Zustand (状态管理)
- Three.js + React Three Fiber (3D渲染)
- Howler.js (音频处理)
- Lucide React (图标)

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
```

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── cosmic/         # 宇宙相关组件
│   └── meditation/     # 冥想相关组件
├── pages/              # 页面组件
├── stores/             # 状态管理
├── styles/             # 样式文件
├── App.jsx             # 主应用组件
├── main.jsx            # 入口文件
└── nav-items.jsx       # 导航配置
```

## 使用体验

1. 在首页输入你当前的烦恼
2. 点击"开始宇宙之旅"
3. 跟随引导，感受从地球到宇宙的视角变化
4. 在浩瀚宇宙面前，重新审视你的烦恼

## 许可证

MIT 