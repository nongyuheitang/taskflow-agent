import { useTaskStore } from '../store/taskStore';
import { TaskStatus } from '../types';
import TaskCard from './TaskCard';

const COLS: { s: TaskStatus; label: string }[] = [
  { s: 'todo', label: '待办' },
  { s: 'doing', label: '进行中' },
  { s: 'done', label: '已完成' },
];

export default function KanbanBoard() {
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) updateTask(id, { status });
  };

  return (
    <div className="kanban">
      <div className="view-header">
        <h2>看板视图</h2>
        <span className="hint">拖拽卡片切换状态</span>
      </div>
      <div className="kanban-board">
        {COLS.map((col) => {
          const list = tasks.filter((t) => t.status === col.s);
          return (
            <div key={col.s} className="kanban-col" onDragOver={onDragOver} onDrop={(e) => onDrop(e, col.s)}>
              <div className={`kanban-head col-${col.s}`}>
                <span>{col.label}</span>
                <span className="kanban-count">{list.length}</span>
              </div>
              <div className="kanban-body">
                {!list.length && <div className="kanban-empty">拖拽任务到此处</div>}
                {list.map((t) => <TaskCard key={t.id} task={t} compact />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
