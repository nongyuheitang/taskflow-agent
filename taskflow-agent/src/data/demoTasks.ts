// ============================================================
// 示例数据 — 面向 FDE 面试 / 作品集 / AI 工具场景
// ============================================================

import { Task } from '../types';

const day = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const ts = (offset: number, hour: number): string =>
  `${day(offset)}T${String(hour).padStart(2, '0')}:00:00.000Z`;

export const demoTasks: Task[] = [
  {
    id: 'demo-1',
    title: '完成作品集网站的设计与开发',
    description:
      '使用 React + Framer Motion 搭建个人作品集网站，展示 3 个代表性项目、技能雷达图和联系方式。目标是 2 天内上线并用 GitHub Pages 部署。',
    status: 'doing',
    priority: 'urgent',
    dueDate: day(0),
    tags: ['前端', '作品集', '面试准备'],
    subtasks: [
      { id: 's1-1', title: '设计信息架构和视觉风格', completed: true },
      { id: 's1-2', title: '搭建 Vite + React 项目并配置路由', completed: true },
      { id: 's1-3', title: '实现首页 Hero 动画和项目卡片', completed: false },
      { id: 's1-4', title: '部署到 GitHub Pages 并配置自定义域名', completed: false },
      { id: 's1-5', title: '用 Lighthouse 跑一遍性能优化', completed: false },
    ],
    createdAt: ts(-4, 9),
    updatedAt: ts(-1, 18),
  },
  {
    id: 'demo-2',
    title: '准备字节跳动 FDE 实习生面试',
    description:
      '复习 JS/TS 基础、React 原理（Fiber/Hooks/调度）、浏览器渲染流程、前端工程化。准备 2 个深度项目案例，每个能展开讲 10 分钟。',
    status: 'doing',
    priority: 'urgent',
    dueDate: day(1),
    tags: ['面试准备', '职业'],
    subtasks: [
      { id: 's2-1', title: '整理 JS 核心知识点（闭包/原型/事件循环）', completed: true },
      { id: 's2-2', title: '梳理 React Fiber 和并发模式原理', completed: false },
      { id: 's2-3', title: '准备项目深挖问题的回答（难点/优化/协作）', completed: false },
      { id: 's2-4', title: '模拟 3 轮技术面并录音复盘', completed: false },
    ],
    createdAt: ts(-5, 10),
    updatedAt: ts(-1, 22),
  },
  {
    id: 'demo-3',
    title: '实现 TaskFlow Agent AI 拆解功能',
    description:
      '设计并实现轻量级任务拆解引擎。当前阶段用规则匹配实现，预留了接入 Claude API 的接口。需要覆盖 8 大领域关键词和 6 种动作模式。',
    status: 'doing',
    priority: 'high',
    dueDate: day(0),
    tags: ['开发', 'AI', '个人项目'],
    subtasks: [
      { id: 's3-1', title: '设计 DecomposeResult 类型和引擎接口', completed: true },
      { id: 's3-2', title: '编写 8 大领域模板和关键词匹配', completed: true },
      { id: 's3-3', title: '添加兜底通用模板和 reasoning 输出', completed: false },
      { id: 's3-4', title: '预留 Claude API 接入适配器', completed: false },
    ],
    createdAt: ts(-3, 14),
    updatedAt: ts(-1, 16),
  },
  {
    id: 'demo-4',
    title: '设计系统组件库 — Button/Input/Modal',
    description:
      '为团队搭建一套轻量级设计系统。基于 CSS 变量实现主题切换能力，使用 React + TypeScript 编写 3 个核心组件，配合 Storybook 文档。',
    status: 'todo',
    priority: 'high',
    dueDate: day(3),
    tags: ['设计', '组件库', '团队'],
    subtasks: [
      { id: 's4-1', title: '定义 Design Token（颜色/间距/圆角/阴影）', completed: false },
      { id: 's4-2', title: '搭建组件开发环境 + Storybook', completed: false },
      { id: 's4-3', title: '实现 Button/Input/Modal 组件', completed: false },
      { id: 's4-4', title: '编写使用文档和最佳实践', completed: false },
    ],
    createdAt: ts(-2, 11),
    updatedAt: ts(-2, 11),
  },
  {
    id: 'demo-5',
    title: '重构项目中的状态管理（Context → Zustand）',
    description:
      '团队项目当前用 React Context + useReducer 管理全局状态，存在不必要的 re-render。需要迁移到 Zustand 并保证功能不受影响。',
    status: 'todo',
    priority: 'medium',
    dueDate: day(5),
    tags: ['重构', '性能优化', '团队'],
    subtasks: [
      { id: 's5-1', title: '分析现有 Context 结构和使用点', completed: false },
      { id: 's5-2', title: '设计 Zustand store 结构', completed: false },
      { id: 's5-3', title: '逐模块迁移并验证', completed: false },
      { id: 's5-4', title: '用 React DevTools Profiler 对比前后渲染次数', completed: false },
    ],
    createdAt: ts(-1, 9),
    updatedAt: ts(-1, 9),
  },
  {
    id: 'demo-6',
    title: '调研 AI 代码审查工具并输出评估报告',
    description:
      '调研 GitHub Copilot、Cursor、Claude Code 等 AI 编程工具的代码审查能力。从准确性、覆盖率、误报率、集成体验四个维度对比。',
    status: 'todo',
    priority: 'medium',
    dueDate: day(7),
    tags: ['AI', '调研', '分享'],
    subtasks: [
      { id: 's6-1', title: '收集 5 个真实 PR 作为测试用例', completed: false },
      { id: 's6-2', title: '逐一评测每个工具的 review 建议', completed: false },
      { id: 's6-3', title: '整理对比表格和推荐方案', completed: false },
    ],
    createdAt: ts(-1, 15),
    updatedAt: ts(-1, 15),
  },
  {
    id: 'demo-7',
    title: '学习 Framer Motion 并给作品集加动画',
    description:
      '学习 Framer Motion 的核心 API（motion / AnimatePresence / layout / variants），给作品集网站加上页面过渡和滚动动画。',
    status: 'todo',
    priority: 'low',
    dueDate: day(10),
    tags: ['学习', '动画', '作品集'],
    subtasks: [
      { id: 's7-1', title: '阅读 Framer Motion 官方文档', completed: false },
      { id: 's7-2', title: '实现页面切换过渡动画', completed: false },
      { id: 's7-3', title: '添加滚动触发入场动画', completed: false },
    ],
    createdAt: ts(-1, 20),
    updatedAt: ts(-1, 20),
  },
  {
    id: 'demo-8',
    title: '编写 TaskFlow Agent 项目 README 和面试讲解词',
    description:
      '撰写完整的项目文档，包括架构说明、AI 拆解设计思路、FDE 视角下的项目价值。同时准备面试时每个功能点的讲解话术。',
    status: 'done',
    priority: 'urgent',
    dueDate: day(-1),
    tags: ['文档', '面试准备', '个人项目'],
    subtasks: [
      { id: 's8-1', title: '写项目背景和痛点分析', completed: true },
      { id: 's8-2', title: '画技术架构图和组件树', completed: true },
      { id: 's8-3', title: '写 AI 拆解设计文档', completed: true },
      { id: 's8-4', title: '准备面试演示流程和讲解词', completed: true },
    ],
    createdAt: ts(-6, 10),
    updatedAt: ts(-1, 17),
  },
];
