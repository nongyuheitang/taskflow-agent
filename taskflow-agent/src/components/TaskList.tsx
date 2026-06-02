import { useTaskStore, filterAndSort } from '../store/taskStore';
import TaskCard from './TaskCard';

export default function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const filter = useTaskStore((s) => s.filterOptions);
  const items = filterAndSort(tasks, filter);
  const hasFilter = filter.status !== 'all' || filter.priority !== 'all' || filter.tag !== '' || filter.searchQuery !== '';

  if (!items.length) {
    return (
      <div className="empty">
        <div className="empty-icon">📋</div>
        <p className="empty-title">{hasFilter ? '没有匹配的任务' : '还没有任务'}</p>
        <p className="empty-desc">{hasFilter ? '试试调整筛选条件' : '点击「+ 新建任务」开始吧'}</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <div className="view-header">
        <h2>{hasFilter ? `筛选结果（${items.length}）` : `全部任务（${items.length}）`}</h2>
      </div>
      {items.map((t) => <TaskCard key={t.id} task={t} />)}
    </div>
  );
}
