import { useTaskStore } from '../store/taskStore';

export default function Header() {
  const searchQuery = useTaskStore((s) => s.filterOptions.searchQuery);
  const setFilterOptions = useTaskStore((s) => s.setFilterOptions);
  const openForm = useTaskStore((s) => s.openForm);
  const setAiPanelOpen = useTaskStore((s) => s.setAiPanelOpen);
  const setAboutPanelOpen = useTaskStore((s) => s.setAboutPanelOpen);

  return (
    <header className="header">
      <div className="header-brand">
        <svg className="brand-mark" width="20" height="20" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" stroke="var(--color-accent-orange)" strokeWidth="2.5"/>
          <circle cx="24" cy="24" r="8" fill="var(--color-accent-orange)"/>
          <circle cx="24" cy="12" r="4" fill="var(--color-accent-orange)" opacity="0.7"/>
          <circle cx="36" cy="30" r="4" fill="var(--color-accent-orange)" opacity="0.55"/>
          <circle cx="14" cy="34" r="5" fill="var(--color-accent-orange)" opacity="0.4"/>
        </svg>
        <span className="brand-name"><em>TaskFlow</em> Agent</span>
      </div>

      <div className="header-center-action">
        <button className="ai-hero-btn" onClick={() => setAiPanelOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z"/>
            <path d="M19 19l1 1" opacity="0.6"/>
            <path d="M9 2l0.5 1" opacity="0.4"/>
          </svg>
          AI 拆解任务
        </button>
      </div>

      <div className="header-right-group">
        <div className="header-search">
          <svg className="search-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input type="text" placeholder="搜索..." value={searchQuery} onChange={(e) => setFilterOptions({ searchQuery: e.target.value })} />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setFilterOptions({ searchQuery: '' })}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => openForm()}>新建任务</button>
        <button className="btn btn-ghost btn-sm about-btn" onClick={() => setAboutPanelOpen(true)}>关于</button>
      </div>
    </header>
  );
}
