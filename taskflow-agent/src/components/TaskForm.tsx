import { useState, useEffect, FormEvent } from 'react';
import { useTaskStore } from '../store/taskStore';
import { TaskStatus, TaskPriority } from '../types';

const PRI_LABELS: Record<TaskPriority, string> = { urgent: '● 紧急', high: '◐ 高', medium: '○ 中', low: '◌ 低' };
const ST_LABELS: Record<TaskStatus, string> = { todo: '待办', doing: '进行中', done: '已完成' };

interface Form {
  title: string; description: string; status: TaskStatus; priority: TaskPriority;
  dueDate: string; tags: string[]; subtasks: { id: string; title: string; completed: boolean }[];
  tagInput: string;
}
const blank = (): Form => ({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', tags: [], subtasks: [], tagInput: '' });

export default function TaskForm() {
  const isOpen = useTaskStore((s) => s.isFormOpen);
  const editing = useTaskStore((s) => s.editingTask);
  const close = useTaskStore((s) => s.closeForm);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const [f, setF] = useState<Form>(blank());
  const isEdit = !!editing;

  useEffect(() => {
    if (editing) {
      setF({ ...editing, subtasks: editing.subtasks.map((s) => ({...s})), tagInput: '' });
    } else {
      setF(blank());
    }
  }, [editing, isOpen]);

  if (!isOpen) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!f.title.trim()) return;
    const data = { title: f.title.trim(), description: f.description.trim(), status: f.status, priority: f.priority, dueDate: f.dueDate, tags: f.tags, subtasks: f.subtasks };
    if (isEdit && editing) updateTask(editing.id, data);
    else addTask(data);
  };

  const addTag = () => {
    const t = f.tagInput.trim();
    if (t && !f.tags.includes(t)) setF({ ...f, tags: [...f.tags, t], tagInput: '' });
  };
  const removeTag = (t: string) => setF({ ...f, tags: f.tags.filter((x) => x !== t) });

  const addSub = () => {
    const t = prompt('子任务标题：');
    if (t?.trim()) setF({ ...f, subtasks: [...f.subtasks, { id: `tmp-${Date.now()}`, title: t.trim(), completed: false }] });
  };
  const removeSub = (i: number) => setF({ ...f, subtasks: f.subtasks.filter((_, idx) => idx !== i) });

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{isEdit ? '编辑任务' : '新建任务'}</h2>
          <button className="modal-close-btn" onClick={close}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="fg">
              <label className="fl">标题 <span className="req">*</span></label>
              <input className="fi" value={f.title} onChange={(e) => setF({...f, title: e.target.value})} placeholder="输入任务标题..." autoFocus />
            </div>
            <div className="fg">
              <label className="fl">描述</label>
              <textarea className="fi ta" rows={3} value={f.description} onChange={(e) => setF({...f, description: e.target.value})} placeholder="更多细节（可选）..." />
            </div>
            <div className="fg-row">
              <div className="fg fg-1">
                <label className="fl">状态</label>
                <select className="fi" value={f.status} onChange={(e) => setF({...f, status: e.target.value as TaskStatus})}>
                  {(Object.keys(ST_LABELS) as TaskStatus[]).map((k) => <option key={k} value={k}>{ST_LABELS[k]}</option>)}
                </select>
              </div>
              <div className="fg fg-1">
                <label className="fl">优先级</label>
                <select className="fi" value={f.priority} onChange={(e) => setF({...f, priority: e.target.value as TaskPriority})}>
                  {(Object.keys(PRI_LABELS) as TaskPriority[]).map((k) => <option key={k} value={k}>{PRI_LABELS[k]}</option>)}
                </select>
              </div>
            </div>
            <div className="fg">
              <label className="fl">截止日期</label>
              <input type="date" className="fi" value={f.dueDate} onChange={(e) => setF({...f, dueDate: e.target.value})} />
            </div>
            <div className="fg">
              <label className="fl">标签</label>
              <div className="tag-input-row">
                <input className="fi" placeholder="添加标签..." value={f.tagInput} onChange={(e) => setF({...f, tagInput: e.target.value})} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                <button type="button" className="btn btn-outline btn-sm" onClick={addTag}>添加</button>
              </div>
              {f.tags.length > 0 && <div className="tag-list">{f.tags.map((t) => <span key={t} className="tag tag-removable">{t}<button type="button" className="tag-x" onClick={() => removeTag(t)}>✕</button></span>)}</div>}
            </div>
            <div className="fg">
              <label className="fl">子任务 <button type="button" className="link-btn" onClick={addSub}>+ 添加</button></label>
              {f.subtasks.length > 0 && (
                <ul className="sub-edit-list">
                  {f.subtasks.map((st, i) => (
                    <li key={st.id} className="sub-edit-item"><span>{st.title}</span><button type="button" className="icon-btn" onClick={() => removeSub(i)}>✕</button></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={close}>取消</button>
            <button type="submit" className="btn btn-primary" disabled={!f.title.trim()}>{isEdit ? '保存' : '创建'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
