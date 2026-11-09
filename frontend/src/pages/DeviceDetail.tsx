import { useEffect, useState } from 'react'
import { api, type Device } from '../api/client'
import { Sparkline } from '../components/Sparkline'

type Tab = 'monitoring' | 'diagnosis' | 'rul'

type Props = {
  device: Device
  onBack: () => void
}

export function DeviceDetail({ device, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('monitoring')
  const [series, setSeries] = useState<number[]>([])
  const [unit, setUnit] = useState('g')
  const [mon, setMon] = useState<Awaited<ReturnType<typeof api.monitoring>> | null>(null)
  const [diag, setDiag] = useState<Awaited<ReturnType<typeof api.diagnosis>> | null>(null)
  const [rul, setRul] = useState<Awaited<ReturnType<typeof api.rul>> | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loadSeries = async () => {
      try {
        const ts = await api.timeseries(device.id, 'vibration', 2)
        if (!cancelled) {
          setSeries(ts.values)
          setUnit(ts.unit)
        }
      } catch (e) {
        if (!cancelled) setErr(String(e))
      }
    }
    loadSeries()
    const id = window.setInterval(loadSeries, 4000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [device.id])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setBusy(true)
      setErr(null)
      try {
        if (tab === 'monitoring') {
          const r = await api.monitoring(device.id)
          if (!cancelled) setMon(r)
        } else if (tab === 'diagnosis') {
          const r = await api.diagnosis(device.id)
          if (!cancelled) setDiag(r)
        } else {
          const r = await api.rul(device.id)
          if (!cancelled) setRul(r)
        }
      } catch (e) {
        if (!cancelled) setErr(String(e))
      } finally {
        if (!cancelled) setBusy(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [device.id, tab])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'monitoring', label: '监测' },
    { key: 'diagnosis', label: '诊断' },
    { key: 'rul', label: '寿命' },
  ]

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--ink-muted)',
          padding: 0,
          marginBottom: 10,
        }}
      >
        ← 返回设备列表
      </button>
      <header style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{device.name}</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--ink-muted)', fontSize: 13 }}>
            {device.type} · {device.location} · ID <span className="mono">{device.id}</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>健康分</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 600 }}>
            {device.health.toFixed(1)}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        {tabs.map((t) => {
          const on = t.key === tab
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: on ? '2px solid var(--accent)' : '2px solid transparent',
                color: on ? 'var(--ink)' : 'var(--ink-muted)',
                padding: '8px 4px',
                fontWeight: on ? 600 : 500,
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {err && (
        <div style={{ marginBottom: 12, color: 'var(--danger)', fontSize: 13 }}>{err}</div>
      )}
      {busy && <div style={{ marginBottom: 12, color: 'var(--ink-subtle)', fontSize: 12 }}>计算中…</div>}

      {tab === 'monitoring' && (
        <div style={{ display: 'grid', gap: 12 }}>
          <section
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>振动时序（仿真）</strong>
              <span className="mono" style={{ color: 'var(--ink-muted)', fontSize: 12 }}>
                unit={unit}
              </span>
            </div>
            <Sparkline values={series} />
          </section>

          {mon && (
            <>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 16,
                    minWidth: 160,
                  }}
                >
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>监测健康分</div>
                  <div className="mono" style={{ fontSize: 24, fontWeight: 600 }}>
                    {mon.health_score}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>demo: true</div>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 8 }}>告警</div>
                  {mon.alarms.length === 0 ? (
                    <div style={{ color: 'var(--success)' }}>无告警</div>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {mon.alarms.map((a) => (
                        <li key={a.code} style={{ color: 'var(--accent-pink)', marginBottom: 4 }}>
                          <span className="mono">{a.code}</span> — {a.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'var(--canvas-elevated)', textAlign: 'left' }}>
                    <th style={th}>算法</th>
                    <th style={{ ...th, textAlign: 'right' }}>数值</th>
                    <th style={th}>单位</th>
                    <th style={th}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {mon.results.map((r) => (
                    <tr key={r.algorithm} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td style={td}>
                        {r.name || r.algorithm}
                        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-subtle)' }}>
                          {r.algorithm} · demo
                        </div>
                      </td>
                      <td style={{ ...td, textAlign: 'right' }} className="mono">
                        {r.value}
                      </td>
                      <td style={td}>{r.unit}</td>
                      <td style={{ ...td, color: statusColor(r.status) }}>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {tab === 'diagnosis' && diag && (
        <div style={{ display: 'grid', gap: 10 }}>
          {diag.results.map((r) => (
            <article
              key={r.algorithm}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <strong>{r.name || r.algorithm}</strong>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>
                    {r.fault_type} · {r.location}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-subtle)' }}>置信度</div>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent-pink)' }}>
                    {(r.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--ink-muted)', fontSize: 13 }}>
                {r.evidence.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <div className="mono" style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-subtle)' }}>
                {r.algorithm} · demo: true
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'rul' && rul && (
        <div style={{ display: 'grid', gap: 10 }}>
          {rul.results.map((r) => (
            <article
              key={r.algorithm}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <strong>{r.name || r.algorithm}</strong>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-subtle)' }}>
                  unit={r.unit}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { k: 'P10', v: r.p10 },
                  { k: 'P50', v: r.p50 },
                  { k: 'P90', v: r.p90 },
                ].map((p) => (
                  <div
                    key={p.k}
                    style={{
                      background: 'var(--canvas-elevated)',
                      borderRadius: 'var(--radius-md)',
                      padding: 12,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{p.k}</div>
                    <div className="mono" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>
                      {p.v}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-subtle)' }}>天</div>
                  </div>
                ))}
              </div>
              {r.p50_hours != null && (
                <div className="mono" style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-muted)' }}>
                  P50 ≈ {r.p50_hours} 小时
                </div>
              )}
              <div className="mono" style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-subtle)' }}>
                {r.algorithm} · demo: true
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

const th: Record<string, string | number> = {
  padding: '10px 12px',
  fontSize: 12,
  color: 'var(--ink-muted)',
  fontWeight: 500,
}
const td: Record<string, string | number> = { padding: '10px 12px', fontSize: 13 }

function statusColor(s: string) {
  if (s === 'alarm') return 'var(--danger)'
  if (s === 'warn') return 'var(--warning)'
  return 'var(--success)'
}
