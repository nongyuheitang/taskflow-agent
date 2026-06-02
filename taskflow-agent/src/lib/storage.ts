// ============================================================
// localStorage 持久化层
// ============================================================

import { Task } from '../types';

const TASKS_KEY = 'taskflow-tasks';
const SETTINGS_KEY = 'taskflow-settings';

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('保存任务失败:', e);
  }
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (t: unknown) =>
        t != null && typeof t === 'object' && typeof (t as Task).id === 'string'
    );
  } catch {
    return [];
  }
}

export function saveSettings(settings: Record<string, unknown>): void {
  try {
    const prev = loadSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...prev, ...settings }));
  } catch { /* ignore */ }
}

export function loadSettings(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
