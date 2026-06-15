import { useState } from 'react';
import { decomposeTask, decomposeTaskWithAI } from '../lib/taskParser';
import { DecomposeResult, AIProvider, DecomposeMode } from '../types';
import { useTaskStore } from '../store/taskStore';
import { getProviderDefaults, getFreeAPIHelp } from '../lib/aiService';

// ==================== AI 拆解面板 ====================

export function AIPanel() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DecomposeResult | null>(null);
  const [thinking, setThinking] = useState(false);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const addTask = useTaskStore((s) => s.addTask);
  const decomposeMode = useTaskStore((s) => s.decomposeMode);
  const setDecomposeMode = useTaskStore((s) => s.setDecomposeMode);
  const aiConfig = useTaskStore((s) => s.aiConfig);
  const setAIConfig = useTaskStore((s) => s.setAIConfig);

  const doDecompose = async () => {
    if (!input.trim()) return;
    setError(null);
    setThinking(true);

    if (decomposeMode === 'rule') {
      // 规则引擎（本地，零延迟）
      setTimeout(() => {
        setResult(decomposeTask(input.trim()));
        setAdded(new Set());
        setThinking(false);
      }, 300);
    } else {
      // AI 模式
      try {
        const r = await decomposeTaskWithAI(aiConfig, input.trim());
        setResult(r);
        setAdded(new Set());
      } catch (e) {
        const msg = e instanceof Error ? e.message : '未知错误';
        setError(msg);
        // 自动回退到规则引擎
        const fallback = decomposeTask(input.trim());
        setResult(fallback);
        fallback.reasoning = `⚠️ AI 调用失败（${msg}），已回退规则引擎: ${fallback.reasoning}`;
      } finally {
        setThinking(false);
      }
    }
  };

  const addOne = (title: string, i: number) => {
    addTask({
      title,
      description: `${decomposeMode === 'ai' ? 'AI' : '规则'}拆解自「${result?.original}」`,
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      tags: [decomposeMode === 'ai' ? 'AI拆解' : '规则拆解'],
      subtasks: [],
    });
    setAdded(new Set([...added, i]));
  };

  const handleModeSwitch = (mode: DecomposeMode) => {
    if (mode === 'ai' && !aiConfig.apiKey) {
      setShowConfig(true);
    }
    setDecomposeMode(mode);
    setResult(null);
    setError(null);
  };

  const handleProviderChange = (provider: AIProvider) => {
    const defaults = getProviderDefaults(provider);
    setAIConfig({
      provider,
      model: defaults.defaultModel,
      customEndpoint: defaults.endpoint,
    });
  };

  // 点击快速示例
  const doQuickExample = (ex: string) => {
    setInput(ex);
    setError(null);
    if (decomposeMode === 'rule') {
      setThinking(true);
      setTimeout(() => {
        setResult(decomposeTask(ex));
        setAdded(new Set());
        setThinking(false);
      }, 300);
    } else {
      setThinking(true);
      decomposeTaskWithAI(aiConfig, ex)
        .then((r) => {
          setResult(r);
          setAdded(new Set());
        })
        .catch((e) => {
          const msg = e instanceof Error ? e.message : '未知错误';
          setError(msg);
          const fallback = decomposeTask(ex);
          fallback.reasoning = `⚠️ AI 调用失败（${msg}），已回退规则引擎: ${fallback.reasoning}`;
          setResult(fallback);
        })
        .finally(() => setThinking(false));
    }
  };

  const providerInfo = getProviderDefaults(aiConfig.provider);

  return (
    <div className="ai-panel">
      {/* 模式切换 */}
      <div className="ai-mode-tabs">
        <button
          className={`ai-mode-tab ${decomposeMode === 'rule' ? 'active' : ''}`}
          onClick={() => handleModeSwitch('rule')}
        >
          <span className="ai-mode-icon">⚡</span>
          规则引擎
          <small>离线·零延迟</small>
        </button>
        <button
          className={`ai-mode-tab ${decomposeMode === 'ai' ? 'active' : ''}`}
          onClick={() => handleModeSwitch('ai')}
        >
          <span className="ai-mode-icon">🤖</span>
          AI 分析
          <small>{providerInfo.free ? '免费' : '需 Key'}</small>
        </button>
      </div>

      {/* AI 配置区 */}
      {decomposeMode === 'ai' && (
        <div className="ai-config-area">
          <div className="ai-config-head" onClick={() => setShowConfig(!showConfig)}>
            <span className="ai-config-title">
              ⚙ {providerInfo.name} · {aiConfig.model || '默认模型'}
            </span>
            <span className="ai-config-toggle">{showConfig ? '收起 ▲' : '展开 ▼'}</span>
          </div>

          {showConfig && (
            <div className="ai-config-body">
              {/* Provider 选择 */}
              <div className="fg">
                <label className="fl">AI 提供商</label>
                <div className="ai-provider-row">
                  {(['zhipu', 'gemini', 'anthropic', 'custom'] as AIProvider[]).map((p) => {
                    const d = getProviderDefaults(p);
                    return (
                      <button
                        key={p}
                        className={`ai-provider-chip ${aiConfig.provider === p ? 'active' : ''}`}
                        onClick={() => handleProviderChange(p)}
                      >
                        {d.name}
                        {d.free && <span className="free-tag">免费</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* API Key */}
              <div className="fg">
                <label className="fl">
                  API Key
                  {(aiConfig.provider === 'gemini' || aiConfig.provider === 'zhipu') && (
                    <a
                      className="get-key-link"
                      href={aiConfig.provider === 'zhipu' ? 'https://open.bigmodel.cn/usercenter/apikeys' : 'https://aistudio.google.com/apikey'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      免费获取 →
                    </a>
                  )}
                </label>
                <input
                  className="fi fi-sm"
                  type="password"
                  placeholder={getFreeAPIHelp(aiConfig.provider)}
                  value={aiConfig.apiKey}
                  onChange={(e) => setAIConfig({ apiKey: e.target.value })}
                />
              </div>

              {/* Model 选择 */}
              {providerInfo.models.length > 0 && (
                <div className="fg">
                  <label className="fl">模型</label>
                  <select
                    className="fi fi-sm"
                    value={aiConfig.model || providerInfo.defaultModel}
                    onChange={(e) => setAIConfig({ model: e.target.value })}
                  >
                    {providerInfo.models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 自定义端点 */}
              {aiConfig.provider === 'custom' && (
                <div className="fg">
                  <label className="fl">API 端点 (OpenAI 兼容)</label>
                  <input
                    className="fi fi-sm"
                    placeholder="https://your-api.com/v1/chat/completions"
                    value={aiConfig.customEndpoint}
                    onChange={(e) => setAIConfig({ customEndpoint: e.target.value })}
                  />
                </div>
              )}

              {(aiConfig.provider === 'gemini' || aiConfig.provider === 'zhipu') && !aiConfig.apiKey && (
                <div className="ai-free-notice">
                  {aiConfig.provider === 'zhipu'
                    ? '💡 智谱 GLM-4-Flash 模型完全免费使用。\n点击上方「免费获取 →」注册 API Key 即可。'
                    : '💡 Gemini API 完全免费使用，无需信用卡。\n点击上方「免费获取 →」注册 API Key 即可。'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 描述 */}
      <p className="ai-panel-desc">
        {decomposeMode === 'rule'
          ? '输入一个模糊的大任务，规则引擎自动拆解为可执行的子步骤。'
          : `输入任务描述，由 ${providerInfo.name} 智能拆解为可执行的子步骤。`}
        <br />
        <small>
          {decomposeMode === 'rule'
            ? '基于关键词匹配和领域模板，离线可用，零延迟。'
            : 'AI 理解任务语义，拆解结果更精准灵活。'}
        </small>
      </p>

      {/* 输入框 */}
      <textarea
        className="ai-panel-input"
        rows={3}
        placeholder='例如："做一个后台管理系统"、"准备字节面试"、"搭建组件库"...'
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) doDecompose();
        }}
      />
      <div className="ai-panel-bar">
        <span className="hint">Ctrl+Enter 快速拆解</span>
        <button className="btn btn-primary" disabled={!input.trim() || thinking} onClick={doDecompose}>
          {thinking ? (
            <>
              <span className="spinner" /> {decomposeMode === 'ai' ? 'AI 思考中...' : '拆解中...'}
            </>
          ) : (
            <>{decomposeMode === 'ai' ? '🤖 AI 拆解' : '⚡ 开始拆解'}</>
          )}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="ai-error-banner">
          <span>⚠️ {error}</span>
          <button className="link-btn" onClick={() => setError(null)}>关闭</button>
        </div>
      )}

      {/* 结果 */}
      {result && (
        <div className="interview-result">
          <div className="result-head">
            <h4>{decomposeMode === 'ai' ? '🤖 AI 拆解结果' : '⚡ 拆解结果'}</h4>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => result.subtasks.forEach((s, i) => { if (!added.has(i)) addOne(s, i); })}
            >
              全部添加为任务
            </button>
          </div>
          <div className="result-reason">匹配逻辑：{result.reasoning}</div>
          <div className="result-list">
            {result.subtasks.map((s, i) => (
              <div key={i} className={`result-item ${added.has(i) ? 'added' : ''}`}>
                <span className="result-num">{i + 1}</span>
                <span className="result-title">{s}</span>
                <button
                  className="btn btn-sm btn-outline"
                  disabled={added.has(i)}
                  onClick={() => addOne(s, i)}
                >
                  {added.has(i) ? '已添加' : '添加'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快速示例 */}
      <div className="interview-examples">
        <p className="examples-label">快速尝试：</p>
        <div className="examples-row">
          {['做个人作品集网站', '准备前端实习面试', '优化网站加载速度', '搭建组件库'].map((ex) => (
            <button
              key={ex}
              className="btn btn-ghost btn-sm chip"
              onClick={() => doQuickExample(ex)}
            >
              {ex}
            </button>
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
