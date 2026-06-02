import { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { TaskPriority, TaskStatus } from '../types';

const PRI_MAP: Record<TaskPriority, { cls: string; label: string }> = {
  urgent: { cls: 'pri-urgent', label: '● 紧急' },
  high: { cls: 'pri-high', label: '◐ 高' },
  medium: { cls: 'pri-medium', label: '○ 中' },
  low: { cls: 'pri-low', label: '◌ 低' },
};
const ST_MAP: Record<TaskStatus, string> = { todo: '待办', doing: '进行中', done: '已完成' };

export default function TaskDetail() {
  const selectedId = useTaskStore((s) => s.selectedTaskId);
  const tasks = useTaskStore((s) => s.tasks);
  const selectTask = useTaskStore((s) => s.selectTask);
  const toggleStatus = useTaskStore((s) => s.toggleTaskStatus);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const deleteSubtask = useTaskStore((s) => s.deleteSubtask);
  const addSubtask = useTaskStore((s) => s.addSubtask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const openForm = useTaskStore((s) => s.openForm);
  const [newSub, setNewSub] = useState('');

  const task = tasks.find((t) => t.id === selectedId);
  if (!task) return null;

  const pro = task.subtasks.length
    ? Math.round((task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100) : 0;

  const handleAdd = () => {
    if (newSub.trim()) { addSubtask(task.id, newSub.trim()); setNewSub(''); }
  };

  return (
    <div className="detail">
      {/* 头部 */}
      <div className="detail-head">
        <div className="detail-head-left">
          <h3 className="detail-title">{task.title}</h3>
          <div className="detail-meta">
            <span className={`badge badge-st-${task.status}`}>{ST_MAP[task.status]}</span>
            <span className={`badge ${PRI_MAP[task.priority].cls}`}>{PRI_MAP[task.priority].label}</span>
            {task.dueDate && <span className="badge badge-date">{task.dueDate}</span>}
          </div>
        </div>
        <button className="icon-btn" onClick={() => selectTask(null)}>✕</button>
      </div>

      <div className="detail-body">
        {/* 描述 */}
        {task.description && (
          <div className="detail-sec">
            <h4 className="detail-sec-title">描述</h4>
            <p className="detail-desc">{task.description}</p>
          </div>
        )}

        {/* 标签 */}
        {task.tags.length > 0 && (
          <div className="detail-sec">
            <h4 className="detail-sec-title">标签</h4>
            <div className="tag-list">{task.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
          </div>
        )}

        {/* 子任务 */}
        <div className="detail-sec">
          <h4 className="detail-sec-title">
            子任务
            {task.subtasks.length > 0 && (
              <span className="sub-progress"> ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})</span>
            )}
          </h4>
          {task.subtasks.length > 0 && (
            <>
              <div className="prog-bar"><div className="prog-fill" style={{ width: `${pro}%` }} /></div>
              <ul className="sub-list">
                {task.subtasks.map((st) => (
                  <li key={st.id} className={`sub-item ${st.completed ? 'done' : ''}`}>
                    <button className={`cb-sm ${st.completed ? 'cb-checked' : ''}`} onClick={() => toggleSubtask(task.id, st.id)}>
                      {st.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                    <span>{st.title}</span>
                    <button className="icon-btn xs" onClick={() => deleteSubtask(task.id, st.id)}>✕</button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="add-sub-row">
            <input className="fi fi-sm" placeholder="添加子任务..." value={newSub} onChange={(e) => setNewSub(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }} />
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>添加</button>
          </div>
        </div>

        {/* 时间 */}
        <div className="detail-sec">
          <h4 className="detail-sec-title">时间</h4>
          <div className="detail-time">
            <div>创建：{new Date(task.createdAt).toLocaleString('zh-CN')}</div>
            <div>更新：{new Date(task.updatedAt).toLocaleString('zh-CN')}</div>
          </div>
        </div>
      </div>

      <div className="detail-foot">
        <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(task.id)}>
          {task.status === 'todo' ? '▶ 开始' : task.status === 'doing' ? '✓ 完成' : '↩ 重新打开'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => { openForm(task); }}>编辑</button>
        <button className="btn btn-ghost btn-sm danger" onClick={() => { if (confirm('删除此任务？')) deleteTask(task.id); }}>删除</button>
      </div>
    </div>
  );
}
