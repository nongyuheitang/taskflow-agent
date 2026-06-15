# TaskFlow Agent — CLAUDE.md

## 项目概述

TaskFlow Agent 是一个融合 AI 辅助拆解能力的任务管理工作台。纯前端实现，Vite + React + TypeScript + Zustand + localStorage。

## 技术决策

- **Zustand over Redux/Context**: 轻量、无需 Provider 包裹、selector 天然防重渲染
- **规则引擎 over LLM**: 零延迟、零费用、离线可用；预留 API 接口方便升级
- **纯 CSS over UI 库**: 展示 CSS 功底，CSS 变量体系支持主题扩展
- **localStorage 同步写入**: 操作即持久化，无额外 effect 开销

## 项目结构

```
src/types.ts              — 所有类型定义（Task, Subtask, FilterOptions, etc.）
src/store/taskStore.ts    — Zustand store（状态 + 操作 + 派生计算）
src/lib/storage.ts        — localStorage 读写
src/lib/taskParser.ts     — AI 拆解引擎 + 面试讲解词
src/lib/taskStats.ts      — 统计计算 + Today Plan 推荐算法
src/lib/exportData.ts     — JSON 导入导出
src/data/demoTasks.ts     — 8 条面试相关示例数据
src/components/           — 10 个组件
  Header.tsx              — 顶栏（搜索 + AI 入口 + 新建）
  Sidebar.tsx             — 深色侧栏（导航 + 筛选 + 导入导出）
  TaskCard.tsx            — 任务卡片（拖拽源）
  TaskList.tsx            — 列表视图
  KanbanBoard.tsx         — 看板视图（HTML5 DnD）
  TaskForm.tsx            — 新建/编辑弹窗
  TaskDetail.tsx          — 右侧详情面板
  StatsPanel.tsx          — 数据统计（环形图 + 柱状图）
  InterviewMode.tsx       — AI 拆解 + 面试讲解词
src/App.tsx               — 三栏布局 + 视图路由 + TodayPlan
src/styles.css            — 全局样式（dark sidebar + AI workbench 风格）
```

## 开发命令

```bash
npm run dev      # 开发模式（HMR）
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

## 代码风格

- 组件使用 `export default function`
- Store 使用 Zustand selector 模式订阅
- lib 层纯函数、零副作用
- 类型定义集中在 types.ts
- CSS 使用简写类名（组件内部用 BEM 风格简化）
