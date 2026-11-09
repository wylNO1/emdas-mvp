# EMDAS MVP 任务拆分

- 日期：2026-11-09（Asia/Shanghai）
- 规格：`docs/specs/2026-11-09-emdas-mvp-design.md`（已批准）
- 交付路径：`/Users/wangyulong/上海核电/`
- 执行：软件工程师小墨；卡点/可演示时回报工程主管小金

## 总顺序建议

1. T0 仓骨架 + README 声明 → 2. T1 仿真 + API 壳 → 3. T2 演示算法 → 4. T3 前端仪表盘 → 5. T4 联调验收

---

## T0 — 仓骨架（先做）

- [ ] 按规格第 3 节建 `backend/`、`frontend/`、根 `README.md`
- [ ] README：本地启动（uvicorn:8000 + vite:5173）、Vite 代理 `/api`、**演示算法/仿真数据声明**
- [ ] 页脚同样声明；视觉遵循根目录 `DESIGN.md`
- [ ] （可选）`docker-compose.yml`，非必须

**完成定义**：目录齐全，README 可照着起空服务。

---

## T1 — Backend 基础 + 仿真

- [ ] FastAPI：`GET /api/health`
- [ ] `app/sim/`：≥3 台仿真设备 + 传感器流（振动/温度等）
- [ ] `GET /api/devices`（含健康分）
- [ ] `GET /api/devices/{id}/timeseries?signal=&window=`
- [ ] CORS / Vite 代理可用

**完成定义**：curl 健康、设备列表、时序均通。

---

## T2 — Algorithms（演示，非全量报价）

结果一律带 `demo: true` + 算法名。

### T2a 状态监测（≥6）

RMS、峭度、频谱峰值、包络能量、阈值阈值、SPC → `POST /api/monitoring/run`

### T2b 故障诊断（≥4）

频率异常、不平衡、轴承外圈特征、过热规则 → `POST /api/diagnosis/run`（类型/部位/置信度/证据）

### T2c 寿命预测 RUL（≥3）

指数退化、线性外推、简易相似度 → `POST /api/rul/predict`（天/小时 + P10/P50/P90）

**完成定义**：三个 POST 对任选设备返回非空演示结果；curl 可验收。

---

## T3 — Frontend（中文 + DESIGN.md）

- [ ] React + Vite；代理 `/api` → `localhost:8000`
- [ ] 左导航：总览 / 设备 / 算法说明
- [ ] 总览：健康卡片、告警数、平均 RUL
- [ ] 设备详情三 Tab：监测 | 诊断 | 寿命（实时曲线、诊断结果、RUL 区间）
- [ ] 深色数据密集仪表盘，严格跟根目录 `DESIGN.md` token

**完成定义**：打开前端可见 ≥3 台设备；三 Tab 均有非空演示结果。

---

## T4 — 联调与验收（对照规格第 7 节）

1. README 可启动前后端  
2. ≥3 台仿真设备  
3. 三 Tab 非空  
4. monitoring / diagnosis / rul curl 通  
5. 深色中文 UI  
6. 演示声明齐全  

回报小金：「可演示」或具体卡点。

---

## 非目标（勿做）

OPC/PLC、登录多租户、报价单全量算法数、现场安装培训维保。

## 协作

| 角色 | 动作 |
|---|---|
| 小墨 | 实现 T0–T4，代码落交付路径；有 Git 远程则推 PR |
| 小紫 | 骨架/边界快速一眼（非阻塞，不挡开工） |
| 小金 | 盯进度；仅阻塞 / 可合并 / 整批可演示时汇总上抛 |

---

## 架构一眼补充（2026-11-09 · 小紫 / 小金已采纳）

### 钉死（实现按此，不挡开工）

1. **仿真→算法**：三个 POST **仅** `{"device_id":"..."}`；算法只读服务端 `app/sim` 缓冲，禁止 body 带原始序列、禁止前端另造数。
2. **最小响应壳**（均含 `demo: true`；可多算法时用 `results` 数组）：

```json
// POST /api/monitoring/run
{
  "device_id": "dev-1",
  "demo": true,
  "results": [
    {"algorithm": "rms", "value": 0.42, "unit": "g", "status": "ok"}
  ],
  "health_score": 78,
  "alarms": [{"code": "SPC_HI", "message": "…"}]
}
```

```json
// POST /api/diagnosis/run
{
  "device_id": "dev-1",
  "demo": true,
  "results": [
    {
      "algorithm": "bearing_outer_race",
      "fault_type": "轴承故障",
      "location": "驱动端外圈",
      "confidence": 0.81,
      "evidence": ["特征频率峰值", "包络能量升高"]
    }
  ]
}
```

```json
// POST /api/rul/predict
{
  "device_id": "dev-1",
  "demo": true,
  "results": [
    {
      "algorithm": "exponential_degradation",
      "unit": "day",
      "p10": 12,
      "p50": 28,
      "p90": 45
    }
  ]
}
```

3. README 加一句：**勿对公网暴露**（无鉴权演示）。算法说明页注明为报价能力的**演示子集**。

### 待拍板（前端 T3 前最好定）

根目录 `DESIGN.md` 实为 **Sentri-Inspired**，规格写的是 **Sentry 深色仪表盘**。未对齐前：布局按「深色数据密集监测台」；token 暂用现文件，避免做成营销落地页。拍板后可能换 `DESIGN.md` 或改规格表述。

### DESIGN 已拍板（2026-11-09 · Yulong 选 A）

根目录 `DESIGN.md` 已换成 **Sentry 产品向深色仪表盘** token（非 Sentri）。规格见 §10 勘误。
**前端一律跟现根目录 DESIGN.md；禁止 Sentri 紫底+lime 营销风。**
