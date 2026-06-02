// ============================================================
// TaskFlow Agent — 核心类型
// ============================================================

export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ViewMode = 'list' | 'kanban' | 'today' | 'high-priority' | 'stats';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  tag: string;
  searchQuery: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  doing: number;
  done: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
}

export interface DecomposeResult {
  original: string;
  subtasks: string[];
  reasoning: string;
}

/** Today Plan 推荐项 */
export interface TodayPlanItem {
  task: Task;
  score: number;
  reason: string;
}

/** Interview Mode 讲解卡片 */
export interface InterviewCard {
  section: string;
  title: string;
  points: string[];
  code?: string;
}
