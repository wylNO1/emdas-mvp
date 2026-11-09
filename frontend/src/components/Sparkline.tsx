type Props = {
  values: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
}

/** 轻量 SVG 折线，无第三方图表依赖 */
export function Sparkline({
  values,
  width = 560,
  height = 160,
  stroke = 'var(--chart-1)',
  fill = 'rgba(108,95,199,0.12)',
}: Props) {
  if (!values.length) {
    return (
      <div style={{ height, display: 'grid', placeItems: 'center', color: 'var(--ink-subtle)' }}>
        暂无数据
      </div>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pad = 8
  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(1, values.length - 1)) * (width - pad * 2)
    const y = pad + (1 - (v - min) / span) * (height - pad * 2)
    return `${x},${y}`
  })
  const line = pts.join(' ')
  const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="时序曲线">
      <polyline fill={fill} stroke="none" points={area} />
      <polyline fill="none" stroke={stroke} strokeWidth="1.5" points={line} />
    </svg>
  )
}
