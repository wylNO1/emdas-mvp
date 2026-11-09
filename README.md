# 设备监测诊断演示系统（EMDAS）MVP

> **演示算法 / 仿真数据，非现场核电生产系统。**  
> **勿对公网暴露**（无鉴权演示）。仅供本地演示与验收。

依据：`docs/设备监测诊断算法软件报价单.pdf`（本仓库为报价能力的**演示子集**）。  
规格：`docs/specs/2026-11-09-emdas-mvp-design.md`

## 技术栈

| 层 | 选型 | 端口 |
|---|---|---|
| 后端 | Python FastAPI + uvicorn | `8000` |
| 前端 | React + Vite (TypeScript) | `5173`（代理 `/api` → `http://127.0.0.1:8000`） |
| 算法 | NumPy 演示实现 | — |
| 数据 | 内置仿真传感器流（`backend/app/sim`） | — |
| 视觉 | 根目录 `DESIGN.md`（Sentry-Dashboard-tokens-for-EMDAS，深色监测台） | — |

## 目录

```
上海核电/
  README.md
  DESIGN.md                 # 视觉 token（勿覆盖）
  docs/                     # 规格与报价单（勿删）
  backend/
    app/main.py
    app/api/
    app/algorithms/
    app/sim/
    requirements.txt
  frontend/
    src/pages/
    src/components/
    package.json
```

## 启动

### 1. 后端

```bash
cd backend
/usr/bin/python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. 前端（另开终端）

```bash
cd frontend
npm install
npm run dev
```

浏览器打开：http://127.0.0.1:5173

## 验收自检（curl）

```bash
curl -s http://127.0.0.1:8000/api/health
curl -s http://127.0.0.1:8000/api/devices
curl -s "http://127.0.0.1:8000/api/devices/pump-a1/timeseries?signal=vibration&window=2"
curl -s -X POST http://127.0.0.1:8000/api/monitoring/run \
  -H 'Content-Type: application/json' -d '{"device_id":"motor-c3"}'
curl -s -X POST http://127.0.0.1:8000/api/diagnosis/run \
  -H 'Content-Type: application/json' -d '{"device_id":"motor-c3"}'
curl -s -X POST http://127.0.0.1:8000/api/rul/predict \
  -H 'Content-Type: application/json' -d '{"device_id":"motor-c3"}'
```

三个 POST **仅**接受 `{"device_id":"..."}`；算法只读服务端仿真缓冲，不接受原始序列。

## 演示算法（子集）

- **监测（6）**：RMS、峭度、频谱峰值、包络能量、阈值报警、SPC
- **诊断（4）**：频率异常、不平衡、轴承外圈特征、过热规则
- **RUL（3）**：指数退化、线性外推、简易相似度（天/小时 + P10/P50/P90）

界面「算法说明」页亦标注：本系统为报价单能力的**演示子集**。

## 声明

- 页脚与本 README 均声明：**演示算法 / 仿真数据，非现场核电生产系统**
- **勿对公网暴露**（无鉴权）
- 非目标：OPC/PLC、登录多租户、报价单全量算法、现场安装培训
