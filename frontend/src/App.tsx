import { useEffect, useMemo, useState } from 'react'
import { api, type Device } from './api/client'
import { Layout } from './components/Layout'
import { Overview } from './pages/Overview'
import { DeviceDetail } from './pages/DeviceDetail'
import { Algorithms } from './pages/Algorithms'

type NavKey = 'overview' | 'devices' | 'algorithms'

export default function App() {
  const [nav, setNav] = useState<NavKey>('overview')
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [avgRul, setAvgRul] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const { devices: list } = await api.devices()
        if (cancelled) return
        setDevices(list)
        // 采样各设备 RUL P50 做总览平均（演示）
        const samples = await Promise.all(
          list.slice(0, 4).map(async (d) => {
            const r = await api.rul(d.id)
            const p50 = r.results[0]?.p50
            return typeof p50 === 'number' ? p50 : null
          }),
        )
        if (cancelled) return
        const vals = samples.filter((v): v is number => v != null)
        setAvgRul(vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null)
      } catch (e) {
        if (!cancelled) setError(String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    const id = window.setInterval(load, 15000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  const selected = useMemo(
    () => devices.find((d) => d.id === selectedId) || null,
    [devices, selectedId],
  )

  const openDevice = (id: string) => {
    setSelectedId(id)
    setNav('devices')
  }

  return (
    <Layout
      active={nav}
      onNavigate={(k) => {
        setNav(k)
        if (k !== 'devices') setSelectedId(null)
      }}
    >
      {error && (
        <div style={{ marginBottom: 12, color: 'var(--danger)', fontSize: 13 }}>
          后端连接失败：{error}（请确认 uvicorn :8000 已启动）
        </div>
      )}

      {nav === 'overview' && (
        <Overview
          devices={devices}
          avgRulDays={avgRul}
          loading={loading}
          onOpenDevice={openDevice}
        />
      )}

      {nav === 'devices' && !selected && (
        <Overview
          devices={devices}
          avgRulDays={avgRul}
          loading={loading}
          onOpenDevice={openDevice}
        />
      )}

      {nav === 'devices' && selected && (
        <DeviceDetail device={selected} onBack={() => setSelectedId(null)} />
      )}

      {nav === 'algorithms' && <Algorithms />}
    </Layout>
  )
}
