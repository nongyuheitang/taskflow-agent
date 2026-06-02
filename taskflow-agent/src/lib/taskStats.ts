// ============================================================
// 统计计算 & Today Plan 智能推荐
// ============================================================

import { Task, TaskStats, TodayPlanItem, TaskPriority } from '../types';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---- 统计 ----

export function computeStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const doing = tasks.filter((t) => t.status === 'doing').length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const urgent = tasks.filter((t) => t.priority === 'urgent').length;
  const high = tasks.filter((t) => t.priority === 'high').length;
  const medium = tasks.filter((t) => t.priority === 'medium').length;
  const low = tasks.filter((t) => t.priority === 'low').length;

  const today = todayStr();
  const overdue = tasks.filter(
    (t) => t.dueDate && t.dueDate < today && t.status !== 'done'
  ).length;
  const dueToday = tasks.filter(
    (t) => t.dueDate === today && t.status !== 'done'
  ).length;

  return {
    total,
    todo,
    doing,
    done,
    urgent,
    high,
    medium,
    low,
    overdue,
    dueToday,
    completionRate: total ? Math.round((done / total) * 100) : 0,
  };
}

// ---- Today Plan 智能推荐 ----

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  urgent: 100,
  high: 70,
  medium: 40,
  low: 10,
};

function dueScore(dueDate: string): number {
  if (!dueDate) return 0;
  const today = todayStr();
  const diff =
    (new Date(dueDate).getTime() - new Date(today).getTime()) / 86400000;
  if (diff < 0) return 60; // 已逾期
  if (diff === 0) return 50; // 今天
  if (diff <= 2) return 30; // 2 天内
  if (diff <= 7) return 15; // 一周内
  return 5;
}

function statusScore(task: Task): number {
  if (task.status === 'doing') return 20; // 进行中的优先
  return 0;
}

export function getTodayPlan(tasks: Task[]): TodayPlanItem[] {
  const candidates = tasks.filter((t) => t.status !== 'done');
  const scored = candidates.map((task) => {
    const score =
      PRIORITY_WEIGHT[task.priority] + dueScore(task.dueDate) + statusScore(task);
    let reason = '';
    if (task.priority === 'urgent') reason = '紧急优先';
    else if (task.priority === 'high') reason = '高优先级';
    else if (task.dueDate && task.dueDate < todayStr()) reason = '已逾期';
    else if (task.dueDate === todayStr()) reason = '今日截止';
    else if (task.status === 'doing') reason = '正在推进中';
    else reason = '建议推进';
    return { task, score, reason } as TodayPlanItem;
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
