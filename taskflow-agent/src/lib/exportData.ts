// ============================================================
// 导入 / 导出
// ============================================================

import { Task } from '../types';

export function exportToJson(tasks: Task[]): string {
  return JSON.stringify(
    {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      taskCount: tasks.length,
      tasks,
    },
    null,
    2
  );
}

export function downloadJson(json: string, filename?: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `taskflow-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJson(raw: string): { tasks: Task[]; error: string | null } {
  try {
    const data = JSON.parse(raw);
    const tasks: Task[] = Array.isArray(data) ? data : data.tasks ?? [];
    if (!tasks.length) return { tasks: [], error: '未找到有效任务数据' };
    return { tasks: tasks.filter((t) => t?.id && t?.title), error: null };
  } catch {
    return { tasks: [], error: 'JSON 解析失败' };
  }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('读取失败'));
    r.readAsText(file);
  });
}
