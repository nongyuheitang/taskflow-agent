import { useState } from 'react';
import { decomposeTask } from '../lib/taskParser';
import { DecomposeResult } from '../types';
import { useTaskStore } from '../store/taskStore';

// ==================== AI 拆解面板 ====================

export function AIPanel() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DecomposeResult | null>(null);
  const [thinking, setThinking] = useState(false);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const addTask = useTaskStore((s) => s.addTask);

  const doDecompose = () => {
    if (!input.trim()) return;
    setThinking(true);
    setTimeout(() => {
      setResult(decomposeTask(input.trim()));
      setAdded(new Set());
      setThinking(false);
    }, 500);
  };

  const addOne = (title: string, i: number) => {
    addTask({ title, description: `AI 拆解自「${result?.original}」`, status: 'todo', priority: 'medium', dueDate: '', tags: ['AI拆解'], subtasks: [] });
    setAdded(new Set([...added, i]));
  };

  return (
    <div className="ai-panel">
      <p className="ai-panel-desc">
        输入一个模糊的大任务，轻量规则引擎自动拆解为可执行的子步骤。<br/>
        <small>基于关键词匹配和领域模板，离线可用，零延迟。</small>
      </p>
      <textarea
        className="ai-panel-input" rows={3}
        placeholder='例如："做一个后台管理系统"、"准备字节面试"、"搭建组件库"...'
        value={input} onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) doDecompose(); }}
      />
      <div className="ai-panel-bar">
        <span className="hint">Ctrl+Enter 快速拆解</span>
        <button className="btn btn-primary" disabled={!input.trim() || thinking} onClick={doDecompose}>
          {thinking ? <><span className="spinner"/> 思考中...</> : '开始拆解'}
        </button>
      </div>

      {result && (
        <div className="interview-result">
          <div className="result-head">
            <h4>拆解结果</h4>
            <button className="btn btn-sm btn-primary" onClick={() => result.subtasks.forEach((s, i) => { if (!added.has(i)) addOne(s, i); })}>全部添加为任务</button>
          </div>
          <div className="result-reason">匹配逻辑：{result.reasoning}</div>
          <div className="result-list">
            {result.subtasks.map((s, i) => (
              <div key={i} className={`result-item ${added.has(i) ? 'added' : ''}`}>
                <span className="result-num">{i+1}</span>
                <span className="result-title">{s}</span>
                <button className="btn btn-sm btn-outline" disabled={added.has(i)} onClick={() => addOne(s, i)}>
                  {added.has(i) ? '已添加' : '添加'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="interview-examples">
        <p className="examples-label">快速尝试：</p>
        <div className="examples-row">
          {['做个人作品集网站', '准备前端实习面试', '优化网站加载速度', '搭建组件库'].map((ex) => (
            <button key={ex} className="btn btn-ghost btn-sm chip" onClick={() => { setInput(ex); setThinking(true); setTimeout(() => { setResult(decomposeTask(ex)); setAdded(new Set()); setThinking(false); }, 400); }}>{ex}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 关于本站面板 ====================

export function AboutPanel() {
  return (
    <div className="about-page-content">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-logo-row">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="var(--color-accent-orange)" strokeWidth="2.5"/>
            <circle cx="24" cy="24" r="8" fill="var(--color-accent-orange)"/>
            <circle cx="24" cy="12" r="4" fill="var(--color-accent-orange)" opacity="0.7"/>
            <circle cx="36" cy="30" r="4" fill="var(--color-accent-orange)" opacity="0.55"/>
            <circle cx="14" cy="34" r="5" fill="var(--color-accent-orange)" opacity="0.4"/>
          </svg>
          <span className="about-brand"><em>TaskFlow</em> Agent</span>
        </div>
        <p className="about-tagline">把模糊需求变成可执行任务流</p>
        <p className="about-sub">一个融合 AI 拆解能力的任务思维工作台 — 不是又一个 Todo List</p>
      </section>

      <section className="about-section">
        <h3>它能做什么</h3>
        <div className="about-grid">
          {[
            { t: '四维任务管理', d: '状态 × 优先级 × 标签 × 子任务 — 每条任务都有完整上下文。' },
            { t: '多视角切换', d: '列表、看板、今日聚焦、高优先级、统计 — 同一数据不同视角。' },
            { t: 'AI 智能拆解', d: '模糊任务输入 → 3—5 个可执行子步骤。规则引擎，离线可用。' },
            { t: '今日推荐', d: '多维打分推荐今天最重要的 3 件事。' },
          ].map((item) => (
            <div key={item.t} className="about-card"><h4>{item.t}</h4><p>{item.d}</p></div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h3>技术构成</h3>
        <div className="about-tech-row">
          <span className="tech-badge">Vite</span><span className="tech-sep">+</span>
          <span className="tech-badge">React 18</span><span className="tech-sep">+</span>
          <span className="tech-badge">TypeScript</span><span className="tech-sep">+</span>
          <span className="tech-badge">Zustand</span><span className="tech-sep">+</span>
          <span className="tech-badge">localStorage</span>
        </div>
        <p className="about-tech-note">纯前端 · 无后端 · 无登录 · 数据仅存于你的浏览器</p>
      </section>
    </div>
  );
}
