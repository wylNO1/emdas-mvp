import type { ReactNode } from 'react'

type NavKey = 'overview' | 'devices' | 'algorithms'

type Props = {
  active: NavKey
  onNavigate: (k: NavKey) => void
  children: ReactNode
}

const NAV: { key: NavKey; label: string }[] = [
  { key: 'overview', label: '总览' },
  { key: 'devices', label: '设备' },
  { key: 'algorithms', label: '算法说明' },
]

export function Layout({ active, onNavigate, children }: Props) {
  return (
    <div style={{ display: 'flex', minHeight: '100%', background: 'var(--canvas)' }}>
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px',
        }}
      >
        <div style={{ padding: '4px 8px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-subtle)', letterSpacing: 0.4 }}>EMDAS MVP</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>设备监测诊断</div>
          <div style={{ fontSize: 11, color: 'var(--accent-pink)', marginTop: 6 }}>演示 · 仿真数据</div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map((item) => {
            const on = item.key === active
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                style={{
                  textAlign: 'left',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  background: on ? 'var(--accent-soft)' : 'transparent',
                  color: on ? 'var(--ink)' : 'var(--ink-muted)',
                  fontWeight: on ? 600 : 500,
                  boxShadow: on ? 'inset 3px 0 0 var(--accent)' : 'none',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
        <div style={{ marginTop: 'auto', padding: 8, fontSize: 11, color: 'var(--ink-subtle)', lineHeight: 1.45 }}>
          报价能力的演示子集
        </div>
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <main style={{ flex: 1, padding: 24 }}>{children}</main>
        <footer
          style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '10px 24px',
            fontSize: 12,
            color: 'var(--ink-subtle)',
            background: 'var(--surface)',
          }}
        >
          演示算法 / 仿真数据，非现场核电生产系统 · 勿对公网暴露（无鉴权）
        </footer>
      </div>
    </div>
  )
}
