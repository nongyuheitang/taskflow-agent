# ⚡ TaskFlow Agent

> 把模糊需求变成可执行任务流 — 一个融合 AI 辅助拆解能力的任务管理工作台

---

## 1. 项目背景

在日常开发中，我们经常收到模糊的工作需求——「做一个后台管理系统」「准备面试」「优化性能」。这些需求往往没有清晰的可执行步骤，导致拖延和遗漏。

**TaskFlow Agent** 不是又一个 Todo List 教程。它的核心差异在于：

- 📋 完整的任务管理能力（状态、优先级、标签、子任务、看板）
- 🤖 内置 AI 任务拆解引擎（输入模糊需求 → 输出 3—5 个可执行子步骤）
- 💡 智能推荐 Today Plan（多维度打分，自动推荐今天最重要的 3 个任务）
- 🎤 面试讲解模式（每个技术决策都有讲解词，方便面试展示）

## 2. 用户痛点

| 痛点 | 解决方案 |
|------|---------|
| 收到模糊需求不知从何下手 | AI 拆解引擎自动生成子任务 |
| 任务太多不知道先做什么 | Today Plan 智能推荐 Top 3 |
| 普通 Todo List 维度单一 | 状态 × 优先级 × 标签 × 子任务 四维管理 |
| 面试时讲不出项目亮点 | 内置面试讲解词 + 架构图 |

## 3. 功能列表

### 任务管理
- ✅ 创建 / 编辑 / 删除任务
- ✅ 状态流转：todo → doing → done（循环切换）
- ✅ 四级优先级：low / medium / high / urgent
- ✅ 截止日期（逾期红色标注 + 今日提醒）
- ✅ 自由标签系统
- ✅ 子任务 Checklist + 进度条

### 视图
- ✅ 列表视图 — 默认视图，支持筛选排序
- ✅ 看板视图 — HTML5 拖拽切换状态
- ✅ 今日任务 — 今日截止的任务
- ✅ 高优先级 — urgent + high 筛选
- ✅ 数据统计 — 环形完成率 + 柱状分布图

### AI 能力
- 🤖 AI 任务拆解 — 规则引擎（8 领域 + 6 动作模式）
- 💡 Today Plan — 智能推荐今天 Top 3 任务
- 🎤 面试讲解模式 — 6 张讲解卡片

### 数据
- ✅ localStorage 自动持久化
- ✅ 导出 JSON（含版本号和导出时间戳）
- ✅ 导入 JSON（id 相同则覆盖，新增则追加）
- ✅ 一键填充 8 条面试相关示例数据

## 4. 技术架构

```
┌──────────────────────────────────────────────────┐
│                    App.tsx                        │
│  ┌──────────┬──────────────────┬──────────────┐  │
│  │ Sidebar  │    Main Content  │ Right Panel  │  │
│  │ (深色)   │   (视图区)       │ (详情/推荐)  │  │
│  └──────────┴──────────────────┴──────────────┘  │
│                                                    │
│  Zustand Store (单一数据源)                        │
│  ├── tasks: Task[]                                 │
│  ├── viewMode, filterOptions                       │
│  └── 派生: getFilteredTasks / getTodayPlan / ...  │
│                                                    │
│  lib/ (纯函数层)                                   │
│  ├── storage.ts   → localStorage                  │
│  ├── taskParser.ts → AI 拆解引擎                  │
│  ├── taskStats.ts  → 统计 + Today Plan 推荐       │
│  └── exportData.ts → JSON 导入导出                │
└──────────────────────────────────────────────────┘
```

### 技术选型

| 技术 | 选择 | 理由 |
|------|------|------|
| 构建工具 | Vite | HMR 极速、ESM 原生 |
| UI 框架 | React 18 + TypeScript | 类型安全、生态成熟 |
| 状态管理 | Zustand | 轻量、无 Provider、selector 防重渲染 |
| 持久化 | localStorage | 零依赖、即开即用 |
| 样式 | 纯 CSS | 展示 CSS 功底、无额外依赖 |
| AI 拆解 | 规则引擎 | 零延迟、零费用、离线可用 |

## 5. AI Breakdown 设计说明

### 规则引擎分层匹配

```
输入："做一个电商管理后台"
  │
  ├─ 第1层：分隔符拆分（自然语言列表检测）
  │   如："A、B、C" → 直接提取
  │
  ├─ 第2层：领域关键词匹配（8 大领域模板）
  │   后台|管理|dashboard → 设计数据模型→搭建框架→...
  │
  ├─ 第3层：动作模式匹配（6 种动作模式）
  │   学习|调研|修复|测试|部署|文档 → 对应模板
  │
  └─ 第4层：通用兜底模板
      明确目标→拆解步骤→最小行动→定期回顾→复盘
```

### 为什么用规则引擎而不是 LLM？

1. **可演示性强** — 不需要 API key，面试现场即开即用
2. **响应零延迟** — 不用等待网络请求
3. **结果可解释** — 每条拆解附带 `reasoning` 字段
4. **预留升级路径** — `decomposeTask()` 是纯函数，替换返回值为 API 调用即可升级为 Claude

### 升级为 Claude API 的方式

```typescript
// src/lib/taskParser.ts — 替换 decomposeTask
export async function decomposeTask(input: string): Promise<DecomposeResult> {
  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    messages: [{ role: 'user', content: `拆解任务为 3-5 个子步骤：${input}` }],
  });
  return parseResponse(msg);
}
```

## 启动

```bash
npm install
npm run dev      # 开发
npm run build    # 构建
```
cd taskflow-agent
npm run dev