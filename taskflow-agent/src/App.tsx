// ============================================================
// TaskFlow Agent — 主应用（三栏布局）
// ============================================================

import { Component, ReactNode } from 'react';
import { useTaskStore, filterToday, filterHighPriority } from './store/taskStore';
import { TodayPlanItem } from './types';
import { getTodayPlan } from './lib/taskStats';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import KanbanBoard from './components/KanbanBoard';
import TaskDetail from './components/TaskDetail';
import TaskForm from './components/TaskForm';
import StatsPanel from './components/StatsPanel';
import { AIPanel, AboutPanel } from './components/InterviewMode';
import TaskCard from './components/TaskCard';

// ---- Error Boundary ----

class EB extends Component<{ children: ReactNode; name: string }, { e: Error | null }> {
  state: { e: Error | null } = { e: null };
  static getDerivedStateFromError(e: Error) { return { e }; }
  render() {
    if (this.state.e) {
      return <div style={{padding:20,margin:8,border:'2px solid red',borderRadius:8,background:'#fff'}}>
        <b style={{color:'red'}}>❌ {this.props.name}: {this.state.e.message}</b>
      </div>;
    }
    return <>{this.props.children}</>;
  }
}

// ---- App ----

export default function App() {
  const viewMode = useTaskStore((s) => s.viewMode);
  const selectedId = useTaskStore((s) => s.selectedTaskId);
  const notification = useTaskStore((s) => s.notification);
  const aiPanelOpen = useTaskStore((s) => s.aiPanelOpen);
  const setAiPanelOpen = useTaskStore((s) => s.setAiPanelOpen);
  const aboutPanelOpen = useTaskStore((s) => s.aboutPanelOpen);
  const setAboutPanelOpen = useTaskStore((s) => s.setAboutPanelOpen);
  const tasks = useTaskStore((s) => s.tasks);

  const plan = getTodayPlan(tasks);

  const renderMain = () => {
    switch (viewMode) {
      case 'kanban': return <KanbanBoard />;
      case 'today': return <TodayView />;
      case 'high-priority': return <HighPriorityView />;
      case 'stats': return <StatsPanel />;
      default: return <TaskList />;
    }
  };

  return (
    <EB name="App">
      <div className="app">
        <EB name="Header"><Header /></EB>
        <div className="app-layout">
          <EB name="Sidebar"><Sidebar /></EB>
          <main className="main">
            <EB name="Main">{renderMain()}</EB>
          </main>
          <aside className="right-panel">
            <EB name="RightPanel">
              {selectedId ? <TaskDetail /> : <TodayPlanWidget plan={plan} />}
            </EB>
          </aside>
        </div>
        <EB name="TaskForm"><TaskForm /></EB>
        {/* AI 拆解弹窗 */}
        {aiPanelOpen && (
          <div className="modal-overlay" onClick={() => setAiPanelOpen(false)}>
            <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h2>AI 拆解任务</h2>
                <button className="modal-close-btn" onClick={() => setAiPanelOpen(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <EB name="AIPanel"><AIPanel /></EB>
              </div>
            </div>
          </div>
        )}

        {/* 关于本站弹窗 */}
        {aboutPanelOpen && (
          <div className="modal-overlay" onClick={() => setAboutPanelOpen(false)}>
            <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h2>关于 TaskFlow Agent</h2>
                <button className="modal-close-btn" onClick={() => setAboutPanelOpen(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <EB name="AboutPanel"><AboutPanel /></EB>
              </div>
            </div>
          </div>
        )}
        {notification && <div className="toast">{notification}</div>}
      </div>
    </EB>
  );
}

// ==================== 今日视图 ====================

function TodayView() {
  const tasks = useTaskStore((s) => s.tasks);
  const items = filterToday(tasks);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="task-list">
      <div className="view-header">
        <h2>今日任务</h2>
        <span className="hint">{today}</span>
      </div>
      {!items.length ? (
        <div className="empty">
          <div className="empty-icon">—</div>
          <p className="empty-title">今天没有截止任务</p>
          <p className="empty-desc">享受今天，或者去创建新任务</p>
        </div>
      ) : items.map((t) => <TaskCard key={t.id} task={t} />)}
    </div>
  );
}

// ==================== 高优先级视图 ====================

function HighPriorityView() {
  const tasks = useTaskStore((s) => s.tasks);
  const items = filterHighPriority(tasks);
  return (
    <div className="task-list">
      <div className="view-header"><h2>高优先级任务</h2></div>
      {!items.length ? (
        <div className="empty">
          <div className="empty-icon">—</div>
          <p className="empty-title">没有高优先级任务</p>
          <p className="empty-desc">一切尽在掌控之中</p>
        </div>
      ) : items.map((t) => <TaskCard key={t.id} task={t} />)}
    </div>
  );
}

// ==================== Today Plan ====================

function TodayPlanWidget({ plan }: { plan: TodayPlanItem[] }) {
  return (
    <div className="today-plan-widget">
      <h3 className="tpw-title">今日推荐</h3>
      <p className="tpw-desc">AI 建议今天优先处理：</p>
      {!plan.length ? (
        <p className="tpw-empty">暂无任务，去创建一个吧</p>
      ) : (
        <div className="tpw-list">
          {plan.map((item) => (
            <div key={item.task.id} className="tpw-item">
              <div className="tpw-item-head">
                <span className={`badge ${item.task.priority === 'urgent' ? 'pri-urgent' : item.task.priority === 'high' ? 'pri-high' : ''}`}>
                  {item.score >= 100 ? '紧急' : item.score >= 70 ? '优先' : '建议'}
                </span>
              </div>
              <p className="tpw-item-title">{item.task.title}</p>
              <p className="tpw-item-reason">{item.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
