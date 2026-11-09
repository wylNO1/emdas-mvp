"""EMDAS MVP — FastAPI 入口。演示系统，勿对公网暴露。"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import devices, diagnosis, monitoring, rul

app = FastAPI(
    title="EMDAS MVP",
    description="设备监测诊断演示系统（仿真数据 / 演示算法）",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:4173",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(devices.router, prefix="/api")
app.include_router(monitoring.router, prefix="/api")
app.include_router(diagnosis.router, prefix="/api")
app.include_router(rul.router, prefix="/api")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "demo": True,
        "service": "EMDAS MVP",
        "message": "演示算法 / 仿真数据，非现场核电生产系统",
    }
