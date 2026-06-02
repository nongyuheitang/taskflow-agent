import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'

// 错误边界
function render() {
  const rootEl = document.getElementById('root')
  if (!rootEl) {
    document.body.innerHTML = '<h1 style="color:red;padding:40px;">❌ #root 不存在</h1>'
    return
  }
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (e) {
    rootEl.innerHTML = `<pre style="color:red;padding:40px;white-space:pre-wrap;">❌ 渲染崩溃:\n${String(e)}\n\n${(e as Error).stack || ''}</pre>`
  }
}

render()
