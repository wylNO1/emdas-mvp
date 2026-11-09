const GROUPS = [
  {
    title: '状态监测（演示 6）',
    items: ['RMS', '峭度', '频谱峰值', '包络能量', '阈值报警', '统计过程控制 SPC'],
  },
  {
    title: '故障诊断（演示 4）',
    items: ['频率异常', '不平衡', '轴承外圈特征', '过热规则'],
  },
  {
    title: '寿命预测 RUL（演示 3）',
    items: ['指数退化', '线性外推', '简易相似度（P10/P50/P90）'],
  },
]

export function Algorithms() {
  return (
    <div>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>算法说明</h1>
        <p style={{ margin: '6px 0 0', color: 'var(--ink-muted)', fontSize: 13, maxWidth: 720 }}>
          本页列出的是报价单能力的<strong style={{ color: 'var(--ink)' }}>演示子集</strong>
          ，用于本地联调与验收展示；非现场核电生产算法、非全量工业实现。
        </p>
      </header>

      <div
        style={{
          background: 'rgba(225,86,124,0.1)',
          border: '1px solid rgba(225,86,124,0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: 12,
          marginBottom: 16,
          fontSize: 13,
          color: 'var(--ink)',
        }}
      >
        演示算法 / 仿真数据，非现场核电生产系统。算法仅读取服务端 <span className="mono">app/sim</span> 缓冲，
        POST 仅传 <span className="mono">device_id</span>。
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {GROUPS.map((g) => (
          <section
            key={g.title}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 16,
            }}
          >
            <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600 }}>{g.title}</h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-muted)', lineHeight: 1.7 }}>
              {g.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
