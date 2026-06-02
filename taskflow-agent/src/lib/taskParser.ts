// ============================================================
// AI 任务拆解引擎（规则驱动，零依赖）
// 设计思路见 README § AI Breakdown 设计说明
// ============================================================

import { DecomposeResult, InterviewCard } from '../types';

// ---- 领域模板 ----

const DOMAINS: Record<string, string[]> = {
  '网站|网页|前端页面|官网|landing': [
    '设计页面信息架构和用户流程',
    '搭建组件结构和路由方案',
    '实现核心页面 UI 和交互',
    '适配移动端响应式布局',
    '性能评测和可访问性检查',
  ],
  '后台|管理|dashboard|管理系统': [
    '设计数据模型和权限体系',
    '搭建布局框架和路由守卫',
    '实现核心 CRUD 和管理功能',
    '接入图表和数据分析面板',
    '编写交接文档和操作手册',
  ],
  'API|接口|服务端': [
    '设计 RESTful 接口契约和数据模型',
    '搭建服务框架和中间件',
    '实现核心业务逻辑',
    '集成 swagger 文档和错误处理',
    '编写集成测试和压测基准',
  ],
  '小程序|微信': [
    '注册账号并配置开发环境',
    '设计页面路由和组件树',
    '实现核心业务功能',
    '集成微信登录和支付能力',
    '提交审核并准备灰度发布方案',
  ],
  'App|移动端|React Native|Flutter': [
    '确定技术选型和项目脚手架',
    '设计导航结构和状态管理方案',
    '实现核心功能页面',
    '双平台适配和真机调试',
    '打包签名和应用商店上架准备',
  ],
  '组件库|设计系统': [
    '调研现有方案并制定设计 Token',
    '搭建组件开发环境和文档站',
    '逐个实现基础组件（Button/Input/Modal 等）',
    '编写 Storybook 文档和单元测试',
    '发布 npm 包并输出迁移指南',
  ],
  '面试|作品集|简历': [
    '梳理目标公司和岗位要求',
    '整理 2—3 个代表性项目案例',
    '准备自我介绍和技术问答提纲',
    '模拟面试并录音复盘',
    '发送感谢信并跟进面试反馈',
  ],
  '优化|性能|重构': [
    '使用 Lighthouse/Profiler 采集基线',
    '定位瓶颈（渲染/网络/打包）',
    '制定优化方案和量化目标',
    '逐步实施并验证效果',
    '沉淀优化 SOP 和监控方案',
  ],
};

// ---- 动作模式 ----

const ACTIONS: [RegExp, string[]][] = [
  [/学|掌握|上手|入门/g, ['搜集最佳学习路径和资料', '制定 2 周学习计划', '动手完成核心 Demo', '写一篇总结笔记或分享']],
  [/调研|选型|评估|对比/g, ['明确评估维度和权重', '收集候选方案资料', '搭建最小 PoC 验证', '输出调研报告和推荐方案']],
  [/修复|修|改|bug/i, ['复现并定位问题根因', '编写修复方案', '实施修复并通过回归测试', '补充单测防止再次出现']],
  [/测试|test/i, ['编写测试计划和用例矩阵', '覆盖核心路径和边界条件', '执行测试并记录结果', '输出测试报告和风险评估']],
  [/部署|上线|发布|CI|CD/i, ['检查部署 check list', '配置 CI/CD 流水线', '灰度发布并监控', '输出上线报告和回滚预案']],
  [/文档|记录|总结|复盘/g, ['梳理文档大纲', '撰写核心内容', '补充示例和 FAQ', 'Review 并发布']],
];

// ---- 兜底通用模板 ----

const FALLBACK = [
  '明确任务目标和验收标准',
  '拆解为 3—5 个可并行或顺序执行的子任务',
  '确定最小可行第一步并开始执行',
  '定时回顾进度并调整计划',
  '完成后复盘并记录经验',
];

// ---- 主拆解函数 ----

export function decomposeTask(input: string): DecomposeResult {
  const s = input.trim();
  if (!s) return { original: input, subtasks: [], reasoning: '请输入任务描述。' };

  // 1. 尝试分隔符拆分（自然语言列表）
  const parts = s
    .split(/[,，、;；\n]|\s+和\s+|\s+然后\s+|\s+之后\s+|\s+以及\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    return {
      original: s,
      subtasks: parts.slice(0, 5).map((p, i) => `${i + 1}. ${p}`),
      reasoning: '检测到多个独立步骤，直接提取为子任务',
    };
  }

  // 2. 关键词匹配领域模板
  for (const [pattern, template] of Object.entries(DOMAINS)) {
    if (new RegExp(pattern).test(s)) {
      return {
        original: s,
        subtasks: template.slice(0, 5),
        reasoning: `匹配领域关键词「${pattern.slice(0, 10)}…」，使用对应拆解模板`,
      };
    }
  }

  // 3. 动作模式匹配
  for (const [regex, template] of ACTIONS) {
    if (regex.test(s)) {
      regex.lastIndex = 0; // 重置 regex 状态
      return {
        original: s,
        subtasks: template,
        reasoning: '根据动作关键词匹配拆解规则',
      };
    }
  }

  // 4. 兜底
  return {
    original: s,
    subtasks: FALLBACK,
    reasoning: '使用通用任务拆解模板',
  };
}

// ============================================================
// Interview Mode 讲解词（静态内容，面试引导用）
// ============================================================

export function getInterviewCards(): InterviewCard[] {
  return [
    {
      section: '项目概述',
      title: 'TaskFlow Agent 是什么？',
      points: [
        '一个融合了 AI 辅助拆解能力的任务管理工作台',
        '定位不是普通 Todo List，而是「把模糊需求变成可执行任务流」的思维工具',
        '纯前端实现，无后端依赖，适合快速演示和迭代',
        '在设计上刻意区别于教程项目 — 三栏布局、暗色侧栏、现代 AI 工作台风格',
      ],
    },
    {
      section: '技术架构',
      title: '技术选型与架构决策',
      points: [
        'Vite + React 18 + TypeScript：类型安全、HMR 极速开发',
        'Zustand：比 Redux 轻量、比 Context 性能好，适合中小型项目',
        'localStorage 持久化：无需后端，数据即开即用',
        '纯 CSS 变量 + 响应式：不依赖 UI 库，展示 CSS 功底',
        '规则引擎替代 LLM：零延迟、零费用、离线可用，预留 API 接入点',
      ],
      code: `// Zustand store 设计 — 单一数据源 + 派生计算
interface TaskState {
  tasks: Task[];           // 所有任务
  viewMode: ViewMode;      // 当前视图
  filterOptions: FilterOptions; // 筛选条件

  // 派生（非持久化）
  getFilteredTasks: () => Task[];
  getTodayPlan: () => TodayPlanItem[];
}`,
    },
    {
      section: '核心功能',
      title: '状态管理与数据流',
      points: [
        '所有状态集中在 Zustand store，组件通过 selector 订阅',
        '数据变更自动触发 localStorage 同步写入（无额外 effect）',
        '筛选 / 排序 / 统计均为派生计算，无需额外状态',
        '子任务通过 taskId 关联，更新精准到单个 subtask',
        '看板拖拽通过 HTML5 Drag & Drop 原生 API 实现，零依赖',
      ],
    },
    {
      section: 'AI Breakdown',
      title: '规则驱动的任务拆解引擎',
      points: [
        '分层匹配：分隔符拆分 → 领域关键词 → 动作模式 → 通用兜底',
        '内置 8 大领域模板（网站、后台、API、小程序、组件库…）',
        '内置 6 种动作模式（学习、调研、修复、测试、部署、文档）',
        '每条拆解结果附带 reasoning 字段，解释匹配逻辑（可解释 AI）',
        '预留了 Claude API / MCP 接入点：替换 taskParser.ts 即可升级为 LLM 拆解',
      ],
      code: `// AI 拆解引擎接口 — 方便替换为真实 LLM
export function decomposeTask(input: string): DecomposeResult {
  // Step 1: 尝试自然语言分隔符
  // Step 2: 领域关键词正则匹配
  // Step 3: 动作模式匹配
  // Step 4: 通用兜底模板
  // → 未来：return await claude.messages.create({...})
}`,
    },
    {
      section: '工程实践',
      title: '代码组织与工程化思维',
      points: [
        '类型定义集中管理（types.ts）→ 所有组件共享类型安全',
        'lib 层纯函数 + 零副作用 → 方便单元测试',
        '组件职责单一：Card 只管展示、Form 只管编辑、List 只管排列',
        'CSS 变量系统 → 统一主题、易于暗色模式扩展',
        '导入导出功能支持数据迁移和备份，考虑用户数据主权',
      ],
    },
    {
      section: 'FDE 能力',
      title: '这个项目展示了哪些 FDE 核心能力？',
      points: [
        '组件化思维：合理拆分 10+ 组件，职责清晰、可复用',
        '状态管理：理解何时用全局状态、何时用局部状态',
        '类型系统：TypeScript 泛型、联合类型、类型守卫',
        'CSS 工程化：变量体系、响应式布局、动画细节',
        '产品思维：不仅实现功能，还设计了空状态、Toast 反馈、确认对话框',
        'AI 集成意识：预留了从规则引擎升级到 LLM 的接口',
        '文档能力：README 包含架构图、面试讲解词、扩展路线',
        '代码即文档：命名清晰、注释恰当、文件结构自解释',
      ],
    },
  ];
}
