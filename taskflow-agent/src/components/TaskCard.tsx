import { Task, TaskPriority, TaskStatus } from '../types';
import { useTaskStore } from '../store/taskStore';

const PRI_MAP: Record<TaskPriority, { cls: string; label: string }> = {
  urgent: { cls: 'pri-urgent', label: '紧急' },
  high: { cls: 'pri-high', label: '高' },
  medium: { cls: 'pri-medium', label: '中' },
  low: { cls: 'pri-low', label: '低' },
};
const ST_MAP: Record<TaskStatus, string> = { todo: '待办', doing: '进行中', done: '已完成' };

function isOverdue(d: string, s: TaskStatus) {
  return d && s !== 'done' && d < new Date().toISOString().slice(0, 10);
}
function isToday(d: string) { return d === new Date().toISOString().slice(0, 10); }

export default function TaskCard({ task, compact }: { task: Task; compact?: boolean }) {
  const toggleStatus = useTaskStore((s) => s.toggleTaskStatus);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const selectTask = useTaskStore((s) => s.selectTask);
  const openForm = useTaskStore((s) => s.openForm);

  const overdue = isOverdue(task.dueDate, task.status);
  const today = isToday(task.dueDate);
  const doneCount = task.subtasks.filter((s) => s.completed).length;
  const hasSubtasks = task.subtasks.length > 0;

  const onDrag = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`task-card ${compact ? 'compact' : ''} ${overdue ? 'overdue' : ''}`}
      draggable
      onDragStart={onDrag}
      onClick={() => selectTask(task.id)}
    >
      <div className="tc-top">
        <button
          className={`cb ${task.status === 'done' ? 'cb-checked' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleStatus(task.id); }}
          title="切换状态"
        >
          {task.status === 'done' && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
        </button>
        <span className={`tc-title ${task.status === 'done' ? 'done' : ''}`}>{task.title}</span>
        <div className="tc-actions">
          <button className="icon-btn" title="编辑" onClick={(e) => { e.stopPropagation(); openForm(task); }}>✎</button>
          <button className="icon-btn danger" title="删除" onClick={(e) => { e.stopPropagation(); if (confirm('删除此任务？')) deleteTask(task.id); }}>✕</button>
        </div>
      </div>

      {!compact && task.description && <p className="tc-desc">{task.description}</p>}

      <div className="tc-meta">
        <span className={`badge badge-st-${task.status}`}>{ST_MAP[task.status]}</span>
        <span className={`badge ${PRI_MAP[task.priority].cls}`}>{PRI_MAP[task.priority].label}</span>
        {task.dueDate && (
          <span className={`badge badge-date ${overdue ? 'date-overdue' : ''} ${today && !overdue ? 'date-today' : ''}`}>
            {overdue ? '已逾期' : today ? '今天' : task.dueDate}
          </span>
        )}
        {hasSubtasks && <span className="badge badge-sub">✓ {doneCount}/{task.subtasks.length}</span>}
        {task.tags.slice(0, 2).map((t) => <span key={t} className="badge badge-tag">{t}</span>)}
        {task.tags.length > 2 && <span className="badge badge-tag">+{task.tags.length - 2}</span>}
      </div>
    </div>
  );
}
