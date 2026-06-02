import { useTaskStore } from '../store/taskStore';
import { computeStats } from '../lib/taskStats';

export default function StatsPanel() {
  const tasks = useTaskStore((s) => s.tasks);
  const st = computeStats(tasks);

  const cards = [
    { l: '全部', v: st.total, c: '#6366f1' },
    { l: '待办', v: st.todo, c: '#94a3b8' },
    { l: '进行中', v: st.doing, c: '#3b82f6' },
    { l: '已完成', v: st.done, c: '#10b981' },
    { l: '已逾期', v: st.overdue, c: '#ef4444' },
    { l: '今日截止', v: st.dueToday, c: '#f59e0b' },
  ];

  const bars = [
    { l: '待办', v: st.todo, cls: 'bar-todo' },
    { l: '进行中', v: st.doing, cls: 'bar-doing' },
    { l: '已完成', v: st.done, cls: 'bar-done' },
  ];

  const pris = [
    { l: '紧急', v: st.urgent, c: '#ef4444' },
    { l: '高', v: st.high, c: '#f97316' },
    { l: '中', v: st.medium, c: '#eab308' },
    { l: '低', v: st.low, c: '#22c55e' },
  ];

  return (
    <div className="stats">
      <h2 className="view-header-h2">数据统计</h2>

      {/* 卡片 */}
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.l} className="stat-card">
            <div className="stat-card-right">
              <span className="stat-card-val" style={{ color: c.c }}>{c.v}</span>
              <span className="stat-card-lbl">{c.l}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 完成率 */}
      <div className="panel">
        <h3>完成率</h3>
        <div className="ring-wrap">
          <svg viewBox="0 0 120 120" width="130" height="130">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${st.completionRate * 3.14} 314`} transform="rotate(-90 60 60)" style={{transition: '0.5s'}}/>
            <text x="60" y="54" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1e293b">{st.completionRate}%</text>
            <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#64748b">已完成</text>
          </svg>
        </div>
      </div>

      {/* 状态分布 */}
      <div className="panel">
        <h3>状态分布</h3>
        <div className="bar-chart">
          {bars.map((b) => {
            const pct = st.total ? Math.round((b.v / st.total) * 100) : 0;
            return (
              <div key={b.l} className="bar-row">
                <span className="bar-lbl">{b.l}</span>
                <div className="bar-track"><div className={`bar-fill ${b.cls}`} style={{width: `${pct}%`}}/></div>
                <span className="bar-val">{b.v}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 优先级 */}
      <div className="panel">
        <h3>优先级分布</h3>
        {pris.map((p) => {
          const pct = st.total ? Math.round((p.v / st.total) * 100) : 0;
          return (
            <div key={p.l} className="pri-row">
              <div className="pri-head"><span>{p.l}</span><span>{p.v}</span></div>
              <div className="pri-track"><div className="pri-fill" style={{width: `${pct}%`, background: p.c}}/></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
