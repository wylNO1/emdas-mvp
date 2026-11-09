export type Device = {
  id: string
  name: string
  type: string
  location: string
  health: number
  alerts: number
  status: string
  rpm: number
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  health: () => req<{ status: string; demo: boolean }>('/api/health'),
  devices: () => req<{ demo: boolean; devices: Device[] }>('/api/devices'),
  timeseries: (id: string, signal = 'vibration', window = 2) =>
    req<{
      demo: boolean
      device_id: string
      signal: string
      fs: number
      unit: string
      t: number[]
      values: number[]
    }>(`/api/devices/${encodeURIComponent(id)}/timeseries?signal=${signal}&window=${window}`),
  monitoring: (device_id: string) =>
    req<{
      device_id: string
      demo: boolean
      health_score: number
      alarms: { code: string; message: string }[]
      results: { algorithm: string; name?: string; value: number; unit: string; status: string }[]
    }>('/api/monitoring/run', { method: 'POST', body: JSON.stringify({ device_id }) }),
  diagnosis: (device_id: string) =>
    req<{
      device_id: string
      demo: boolean
      results: {
        algorithm: string
        name?: string
        fault_type: string
        location: string
        confidence: number
        evidence: string[]
      }[]
    }>('/api/diagnosis/run', { method: 'POST', body: JSON.stringify({ device_id }) }),
  rul: (device_id: string) =>
    req<{
      device_id: string
      demo: boolean
      results: {
        algorithm: string
        name?: string
        unit: string
        p10: number
        p50: number
        p90: number
        p50_hours?: number
      }[]
    }>('/api/rul/predict', { method: 'POST', body: JSON.stringify({ device_id }) }),
}
