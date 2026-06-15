// ============================================================
// Zustand Store — 全部状态与操作
// ============================================================

import { create } from 'zustand';
import {
  Task,
  TaskStatus,
  TaskPriority,
  ViewMode,
  FilterOptions,
  Subtask,
  AIConfig,
  AIProvider,
  DecomposeMode,
} from '../types';
import { saveTasks, loadTasks, saveSettings, loadSettings } from '../lib/storage';
import { demoTasks } from '../data/demoTasks';

// ---- 筛选 & 排序工具（导出给组件使用）----

const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

function matchFilter(task: Task, opts: FilterOptions): boolean {
  if (opts.status !== 'all' && task.status !== opts.status) return false;
  if (opts.priority !== 'all' && task.priority !== opts.priority) return false;
  if (opts.tag && !task.tags.includes(opts.tag)) return false;
  if (opts.searchQuery) {
    const q = opts.searchQuery.toLowerCase();
    if (!task.title.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q) && !task.tags.some((t) => t.toLowerCase().includes(q)))
      return false;
  }
  return true;
}

export function filterAndSort(tasks: Task[], opts: FilterOptions): Task[] {
  return tasks
    .filter((t) => matchFilter(t, opts))
    .sort((a, b) => {
      const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pd) return pd;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
}

export function filterToday(tasks: Task[]): Task[] {
  const today = new Date().toISOString().slice(0, 10);
  return tasks.filter((t) => t.dueDate === today);
}

export function filterHighPriority(tasks: Task[]): Task[] {
  return tasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done');
}

export function getAllTags(tasks: Task[]): string[] {
  const set = new Set<string>();
  tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
  return Array.from(set).sort();
}

// ---- 工具 ----

let _id = Date.now();
function uid(): string {
  return `t-${++_id}-${Math.random().toString(36).slice(2, 8)}`;
}
const now = () => new Date().toISOString();

// ---- 持久化设置 ----

interface Settings {
  viewMode: ViewMode;
}
const saved: Settings = loadSettings() as unknown as Settings;

// ---- AI 配置持久化 ----

const AI_CONFIG_KEY = 'taskflow-ai-config';

function loadAIConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        provider: (parsed.provider as AIProvider) || 'gemini',
        apiKey: parsed.apiKey || '',
        model: parsed.model || '',
        customEndpoint: parsed.customEndpoint || '',
      };
    }
  } catch { /* ignore */ }
  return { provider: 'zhipu', apiKey: '', model: '', customEndpoint: '' };
}

function saveAIConfig(config: AIConfig): void {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
}

// ---- Store ----

export interface TaskState {
  tasks: Task[];
  viewMode: ViewMode;
  filterOptions: FilterOptions;
  selectedTaskId: string | null;
  isFormOpen: boolean;
  editingTask: Task | null;
  notification: string | null;
  aiPanelOpen: boolean;
  aboutPanelOpen: boolean;
  aiConfig: AIConfig;
  decomposeMode: DecomposeMode;

  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  setViewMode: (m: ViewMode) => void;
  setFilterOptions: (o: Partial<FilterOptions>) => void;
  resetFilters: () => void;

  selectTask: (id: string | null) => void;
  openForm: (task?: Task) => void;
  closeForm: () => void;
  showNotification: (msg: string) => void;
  setAiPanelOpen: (v: boolean) => void;
  setAboutPanelOpen: (v: boolean) => void;

  setAIConfig: (config: Partial<AIConfig>) => void;
  setDecomposeMode: (mode: DecomposeMode) => void;

  importTasks: (tasks: Task[]) => void;
  loadDemoData: () => void;
  clearAll: () => void;
}

// ---- Create ----

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: loadTasks(),
  viewMode: saved.viewMode ?? 'list',
  filterOptions: { status: 'all', priority: 'all', tag: '', searchQuery: '' },
  selectedTaskId: null,
  isFormOpen: false,
  editingTask: null,
  notification: null,
  aiPanelOpen: false,
  aboutPanelOpen: false,
  aiConfig: loadAIConfig(),
  decomposeMode: 'rule',

  // ===== CRUD =====

  addTask: (data) => {
    const task: Task = { ...data, id: uid(), createdAt: now(), updatedAt: now() };
    set((s) => {
      const tasks = [...s.tasks, task];
      saveTasks(tasks);
      return { tasks, isFormOpen: false, editingTask: null };
    });
    get().showNotification('✓ 任务已创建');
  },

  updateTask: (id, data) => {
    set((s) => {
      const tasks = s.tasks.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: now() } : t
      );
      saveTasks(tasks);
      return { tasks, isFormOpen: false, editingTask: null };
    });
    get().showNotification('✓ 任务已更新');
  },

  deleteTask: (id) => {
    set((s) => {
      const tasks = s.tasks.filter((t) => t.id !== id);
      saveTasks(tasks);
      return { tasks, selectedTaskId: s.selectedTaskId === id ? null : s.selectedTaskId };
    });
    get().showNotification('🗑 任务已删除');
  },

  toggleTaskStatus: (id) => {
    const order: TaskStatus[] = ['todo', 'doing', 'done'];
    set((s) => {
      const tasks = s.tasks.map((t) =>
        t.id === id
          ? { ...t, status: order[(order.indexOf(t.status) + 1) % 3], updatedAt: now() }
          : t
      );
      saveTasks(tasks);
      return { tasks };
    });
  },

  // ===== 子任务 =====

  addSubtask: (taskId, title) => {
    const st: Subtask = { id: `s-${uid()}`, title, completed: false };
    set((s) => {
      const tasks = s.tasks.map((t) =>
        t.id === taskId ? { ...t, subtasks: [...t.subtasks, st], updatedAt: now() } : t
      );
      saveTasks(tasks);
      return { tasks };
    });
  },

  toggleSubtask: (taskId, subtaskId) => {
    set((s) => {
      const tasks = s.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
          updatedAt: now(),
        };
      });
      saveTasks(tasks);
      return { tasks };
    });
  },

  deleteSubtask: (taskId, subtaskId) => {
    set((s) => {
      const tasks = s.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
          updatedAt: now(),
        };
      });
      saveTasks(tasks);
      return { tasks };
    });
  },

  // ===== 视图 & 筛选 =====

  setViewMode: (viewMode) => {
    set({ viewMode, selectedTaskId: null });
    saveSettings({ viewMode });
  },

  setFilterOptions: (o) => set((s) => ({ filterOptions: { ...s.filterOptions, ...o } })),

  resetFilters: () =>
    set({ filterOptions: { status: 'all', priority: 'all', tag: '', searchQuery: '' } }),

  // ===== UI =====

  selectTask: (id) => set({ selectedTaskId: id }),
  openForm: (task) => set({ isFormOpen: true, editingTask: task ?? null }),
  closeForm: () => set({ isFormOpen: false, editingTask: null }),
  showNotification: (msg) => {
    set({ notification: msg });
    setTimeout(() => set({ notification: null }), 2200);
  },
  setAiPanelOpen: (v) => set({ aiPanelOpen: v }),
  setAboutPanelOpen: (v) => set({ aboutPanelOpen: v }),
  setAIConfig: (partial) =>
    set((s) => {
      const aiConfig = { ...s.aiConfig, ...partial };
      saveAIConfig(aiConfig);
      return { aiConfig };
    }),
  setDecomposeMode: (mode) => set({ decomposeMode: mode }),

  // ===== 批量 =====

  importTasks: (incoming) => {
    set((s) => {
      const map = new Map(s.tasks.map((t) => [t.id, t]));
      incoming.forEach((t) => map.set(t.id, t));
      const tasks = Array.from(map.values());
      saveTasks(tasks);
      return { tasks };
    });
    get().showNotification(`✓ 已导入 ${incoming.length} 个任务`);
  },

  loadDemoData: () => {
    set((s) => {
      const map = new Map(s.tasks.map((t) => [t.id, t]));
      demoTasks.forEach((t) => map.set(t.id, t));
      const tasks = Array.from(map.values());
      saveTasks(tasks);
      return { tasks };
    });
    get().showNotification('✓ 示例数据已加载（8 个任务）');
  },

  clearAll: () => {
    set({ tasks: [], selectedTaskId: null });
    saveTasks([]);
    get().showNotification('🗑 全部任务已清除');
  },
}));

