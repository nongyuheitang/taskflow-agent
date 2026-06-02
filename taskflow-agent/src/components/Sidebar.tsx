import { useTaskStore, getAllTags } from '../store/taskStore';
import { ViewMode, TaskStatus, TaskPriority } from '../types';
import { computeStats } from '../lib/taskStats';
import { exportToJson, downloadJson } from '../lib/exportData';

const NAV: { mode: ViewMode; label: string; mark: string }[] = [
  { mode: 'list', label: '全部任务', mark: '○' },
  { mode: 'kanban', label: '看板视图', mark: '◇' },
  { mode: 'today', label: '今日任务', mark: '◷' },
  { mode: 'high-priority', label: '高优先级', mark: '◆' },
  { mode: 'stats', label: '数据统计', mark: '◫' },
];

const STATUS_OPTS: { v: TaskStatus | 'all'; l: string }[] = [
  { v: 'all', l: '全部状态' }, { v: 'todo', l: '待办' }, { v: 'doing', l: '进行中' }, { v: 'done', l: '已完成' },
];
const PRI_OPTS: { v: TaskPriority | 'all'; l: string }[] = [
  { v: 'all', l: '全部优先级' }, { v: 'urgent', l: '● 紧急' }, { v: 'high', l: '◐ 高' }, { v: 'medium', l: '○ 中' }, { v: 'low', l: '◌ 低' },
];

export default function Sidebar() {
  const viewMode = useTaskStore((s) => s.viewMode);
  const setViewMode = useTaskStore((s) => s.setViewMode);
  const filter = useTaskStore((s) => s.filterOptions);
  const setFilter = useTaskStore((s) => s.setFilterOptions);
  const resetFilters = useTaskStore((s) => s.resetFilters);
  const tasks = useTaskStore((s) => s.tasks);
  const loadDemo = useTaskStore((s) => s.loadDemoData);
  const clearAll = useTaskStore((s) => s.clearAll);
  const importTasks = useTaskStore((s) => s.importTasks);

  const tags = getAllTags(tasks);
  const stats = computeStats(tasks);
  const hasFilter = filter.status !== 'all' || filter.priority !== 'all' || filter.tag !== '';

  const doExport = () => downloadJson(exportToJson(tasks));
  const doImport = () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json';
    inp.onchange = async () => {
      const f = inp.files?.[0]; if (!f) return;
      try {
        const raw = await f.text();
        const data = JSON.parse(raw);
        const arr: unknown[] = Array.isArray(data) ? data : data.tasks;
        if (arr?.length) importTasks(arr as never);
        else alert('文件中无有效任务');
      } catch { alert('文件解析失败'); }
    };
    inp.click();
  };

  return (
    <aside className="sidebar">
      <nav className="side-nav">
        {NAV.map((n) => (
          <button key={n.mode} className={`side-nav-item ${viewMode === n.mode ? 'active' : ''}`} onClick={() => setViewMode(n.mode)}>
            <span className="nav-mark">{n.mark}</span>{n.label}
          </button>
        ))}
      </nav>

      <div className="side-sep" />

      <div className="side-section">
        <div className="side-section-head">
          <span className="side-section-title">筛选</span>
          {hasFilter && <button className="link-btn" onClick={resetFilters}>重置</button>}
        </div>
        <label className="side-label">状态</label>
        <select className="side-select" value={filter.status} onChange={(e) => setFilter({ status: e.target.value as TaskStatus | 'all' })}>
          {STATUS_OPTS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <label className="side-label">优先级</label>
        <select className="side-select" value={filter.priority} onChange={(e) => setFilter({ priority: e.target.value as TaskPriority | 'all' })}>
          {PRI_OPTS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        {tags.length > 0 && (
          <>
            <label className="side-label">标签</label>
            <select className="side-select" value={filter.tag} onChange={(e) => setFilter({ tag: e.target.value })}>
              <option value="">全部标签</option>
              {tags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </>
        )}
      </div>

      <div className="side-sep" />

      <div className="side-section">
        <span className="side-section-title">概览</span>
        <div className="side-stats">
          <div className="stat-row"><span>全部</span><span className="stat-num">{stats.total}</span></div>
          <div className="stat-row"><span>进行中</span><span className="stat-num c-blue">{stats.doing}</span></div>
          <div className="stat-row"><span>已完成</span><span className="stat-num c-green">{stats.done}</span></div>
          <div className="stat-row"><span>已逾期</span><span className="stat-num c-red">{stats.overdue}</span></div>
        </div>
      </div>

      <div className="side-spacer" />

      <div className="side-actions">
        <button className="btn btn-ghost btn-sm btn-block" onClick={doExport}>导出 JSON</button>
        <button className="btn btn-ghost btn-sm btn-block" onClick={doImport}>导入 JSON</button>
        <button className="btn btn-ghost btn-sm btn-block" onClick={loadDemo}>加载示例</button>
        <button className="btn btn-ghost btn-sm btn-block btn-danger-text" onClick={() => { if (confirm('清除所有任务？不可恢复。')) clearAll(); }}>清除全部</button>
      </div>
    </aside>
  );
}
