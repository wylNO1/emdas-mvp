# 设备监测诊断演示系统（EMDAS）MVP 设计

- 日期：2026-11-09（Asia/Shanghai）
- 状态：已批准（Yulong）
- 交付路径：`/Users/wangyulong/上海核电/`
- 依据：`docs/设备监测诊断算法软件报价单.pdf`（核电运行研究（上海）有限公司询价）

## 1. 目标与边界

**目标**：可本地一键演示的前后端系统，覆盖报价单三大能力的演示形态——状态监测、故障诊断、寿命预测。算法为可运行的演示实现，界面与 API 打通，无需真实设备。

**非目标（本 MVP 不做）**
- 真实 OPC/PLC/现场传感器接入
- 登录权限与多租户
- 报价单全量算法数量（≥12 / ≥8 / ≥7）的完备工业实现
- 现场安装、培训包、维保流程系统

**声明**：页脚与 README 须注明「演示算法 / 仿真数据，非现场核电生产系统」。

## 2. 技术选型

| 层 | 选型 |
|---|---|
| 后端 | Python FastAPI |
| 前端 | React + Vite |
| 算法 | Python 演示实现（NumPy/SciPy 即可） |
| 数据 | 内置仿真传感器流 |
| 视觉 | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) 的 Sentry `DESIGN.md`（深色、数据密集仪表盘） |
| 参考开源（思路，不整仓 fork） | OpenPMX、FaultSense、ACM |

## 3. 目录结构

```
上海核电/
  README.md
  DESIGN.md
  docs/
    设备监测诊断算法软件报价单.pdf
    specs/2026-11-09-emdas-mvp-design.md
  backend/
    app/main.py
    app/api/          # devices, monitoring, diagnosis, rul
    app/algorithms/   # monitoring / diagnosis / rul
    app/sim/          # 传感器仿真
    requirements.txt
  frontend/
    src/pages/        # Overview, DeviceDetail
    src/components/
    package.json
```

可选：根目录 `docker-compose.yml`（非必须，本地 `uvicorn` + `vite` 即可）。

## 4. 模块与演示算法

### 4.1 状态监测
- UI：设备列表 → 实时曲线 → 健康分与阈值
- 演示算法（≥6）：RMS、峭度、频谱峰值、包络能量、阈值阈值、统计过程控制（SPC）

### 4.2 故障诊断
- UI：选设备/窗口 → 故障类型与部位建议 + 置信度 + 证据
- 演示算法（≥4）：频率异常、不平衡、轴承外圈特征、过热规则

### 4.3 寿命预测（RUL）
- UI：健康趋势 → RUL（天/小时）与 P10/P50/P90
- 演示算法（≥3）：指数退化、线性外推、简易相似度

所有算法结果须带 `demo: true` 与算法名，便于界面标注。

## 5. API

- `GET /api/health`
- `GET /api/devices` — 仿真设备列表与健康分
- `GET /api/devices/{id}/timeseries?signal=&window=` — 仿真时序
- `POST /api/monitoring/run` — body: `{ "device_id": "..." }`
- `POST /api/diagnosis/run` — body: `{ "device_id": "..." }`
- `POST /api/rul/predict` — body: `{ "device_id": "..." }`

本地：后端 `8000`，前端 `5173`，Vite 代理 `/api` → 后端。

## 6. 界面信息架构（中文）

- 左侧导航：总览 / 设备 / 算法说明
- 总览：健康卡片、告警数、平均 RUL
- 设备详情三 Tab：监测 | 诊断 | 寿命
- 视觉严格遵循根目录 `DESIGN.md`（Sentry）

## 7. 验收标准

1. 在 `/Users/wangyulong/上海核电` 可按 README 启动前后端
2. 打开前端即可看到 ≥3 台仿真设备
3. 任选一台，三 Tab 均能返回非空演示结果
4. 监测/诊断/寿命 API 均可 curl 通
5. UI 深色仪表盘风格，关键文案为中文
6. README 含启动步骤与「演示」声明

## 8. 分工

- 工程主管小金：拆任务、盯进度与卡点
- 软件工程师小墨：实现前后端与演示算法，代码落在交付路径
- 软件架构工程师小紫：骨架与边界快速审一眼（非阻塞）
- 大总管：规格、协调、对 Yulong 汇报节点

## 9. 已拍板决策摘要

- 交付物：可演示 MVP
- 栈：FastAPI + React/Vite + Python 演示算法
- 风格：Sentry DESIGN.md
- 数据：内置仿真流
- 架构：自建单体演示仓（方案 A）

## 10. DESIGN.md 勘误（2026-11-09）

Yulong 选 A：根目录 `DESIGN.md` 已替换为 **Sentry 产品向深色仪表盘 token**（本仓自维护）。原因：VoltAgent `design-md/sentry/DESIGN.md` 上游实为 Sentri-Inspired 营销稿，不适合工控演示台。前端必须跟根目录现文件，不要跟 Sentri。
