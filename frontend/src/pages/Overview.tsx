import type { Device } from '../api/client'

type Props = {
  devices: Device[]
  avgRulDays: number | null
  loading: boolean
  onOpenDevice: (id: string) => void
}

function healthColor(h: number) {
  if (h < 70) return 'var(--danger)'
  if (h < 85) return 'var(--warning)'
  return 'var(--success)'
}

export function Overview({ devices, avgRulDays, loading, onOpenDevice }: Props) {
  const alerts = devices.reduce((s, d) => s + d.alerts, 0)
  const avgHealth = devices.length
    ? devices.reduce((s, d) => s + d.health, 0) / devices.length
    : 0

  const kpi = [
    { label: '设备数', value: String(devices.length), tone: 'var(--ink)' },
    { label: '平均健康分', value: avgHealth.toFixed(1), tone: healthColor(avgHealth) },
    { label: '告警数', value: String(alerts), tone: alerts ? 'var(--accent-pink)' : 'var(--success)' },
    {
      label: '平均 RUL (天)',
      value: avgRulDays == null ? '—' : avgRulDays.toFixed(1),
      tone: 'var(--chart-5)',
    },
  ]

  return (
    <div>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>总览</h1>
        <p style={{ margin: '6px 0 0', color: 'var(--ink-muted)', fontSize: 13 }}>
          仿真设备健康与告警汇总（演示）
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 20 }}>
        {kpi.map((k) => (
          <div
            key={k.label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 16,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{k.label}</div>
            <div className="mono" style={{ fontSize: 28, fontWeight: 600, marginTop: 8, color: k.tone }}>
              {loading ? '…' : k.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {devices.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onOpenDevice(d.id)}
            style={{
              textAlign: 'left',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 16,
              color: 'var(--ink)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong style={{ fontSize: 15 }}>{d.name}</strong>
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background:
                    d.status === '告警'
                      ? 'rgba(245,84,89,0.15)'
                      : d.status === '关注'
                        ? 'rgba(240,180,41,0.15)'
                        : 'rgba(51,176,116,0.15)',
                  color: healthColor(d.health),
                }}
              >
                {d.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 6 }}>
              {d.type} · {d.location}
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 12, color: 'var(--ink-subtle)' }}>健康分</span>
              <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: healthColor(d.health) }}>
                {d.health.toFixed(1)}
              </span>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-muted)' }}>
              告警 {d.alerts} · RPM <span className="mono">{d.rpm}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
