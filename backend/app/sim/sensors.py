"""内置仿真传感器流与服务端缓冲 — 演示用，非真实设备。

算法与 timeseries API 只读本模块缓冲，禁止由请求体传入原始序列。
"""
from __future__ import annotations

import math
import threading
import time
from typing import Any, Dict, List, Optional

import numpy as np

FS = 1000.0  # Hz

DEVICES: List[Dict[str, Any]] = [
    {
        "id": "pump-a1",
        "name": "主给水泵 A1",
        "type": "离心泵",
        "location": "汽机房 · 一层",
        "health_base": 92.0,
        "fault_bias": "none",
        "rpm": 2980,
    },
    {
        "id": "fan-b2",
        "name": "循环风机 B2",
        "type": "轴流风机",
        "location": "电气厂房 · 二层",
        "health_base": 78.0,
        "fault_bias": "unbalance",
        "rpm": 1450,
    },
    {
        "id": "motor-c3",
        "name": "冷却水泵电机 C3",
        "type": "异步电机",
        "location": "辅机房 · 地下室",
        "health_base": 65.0,
        "fault_bias": "bearing",
        "rpm": 1480,
    },
    {
        "id": "comp-d4",
        "name": "空压机 D4",
        "type": "螺杆压缩机",
        "location": "压缩空气站",
        "health_base": 85.0,
        "fault_bias": "overheat",
        "rpm": 2950,
    },
]

# 服务端缓冲：device_id -> signal -> last window payload
_BUFFER: Dict[str, Dict[str, Dict[str, Any]]] = {}
_LOCK = threading.Lock()


def _device(device_id: str) -> Dict[str, Any]:
    for d in DEVICES:
        if d["id"] == device_id:
            return d
    raise KeyError(device_id)


def list_devices() -> List[Dict[str, Any]]:
    out = []
    for d in DEVICES:
        health = float(compute_health(d["id"]))
        alerts = 0
        if health < 80:
            alerts += 1
        if health < 70:
            alerts += 1
        out.append(
            {
                "id": d["id"],
                "name": d["name"],
                "type": d["type"],
                "location": d["location"],
                "health": round(health, 1),
                "alerts": alerts,
                "status": "告警" if health < 75 else ("关注" if health < 85 else "正常"),
                "rpm": d["rpm"],
            }
        )
    return out


def compute_health(device_id: str) -> float:
    d = _device(device_id)
    t = time.time()
    wobble = 2.0 * math.sin(t / 17.0 + hash(device_id) % 7)
    health = d["health_base"] + wobble
    if d["fault_bias"] == "bearing":
        health -= 5
    elif d["fault_bias"] == "unbalance":
        health -= 3
    elif d["fault_bias"] == "overheat":
        health -= 2
    return max(40.0, min(99.0, health))


def _synthesize(
    device_id: str,
    signal: str,
    window: float,
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    d = _device(device_id)
    n = max(64, int(FS * window))
    rng = np.random.default_rng(
        seed if seed is not None else (abs(hash((device_id, signal, int(time.time() // 2)))) % 10_000)
    )
    t = np.arange(n) / FS
    fr = d["rpm"] / 60.0

    if signal == "temperature":
        base = 45.0
        if d["fault_bias"] == "overheat":
            base = 78.0
        elif d["fault_bias"] == "bearing":
            base = 62.0
        y = base + 1.5 * np.sin(2 * np.pi * 0.05 * t) + rng.normal(0, 0.4, n)
        unit = "°C"
    elif signal == "current":
        base = 28.0
        y = base + 2.0 * np.sin(2 * np.pi * fr * t) + rng.normal(0, 0.3, n)
        unit = "A"
    else:
        signal = "vibration"
        amp = 0.35
        y = amp * np.sin(2 * np.pi * fr * t)
        y += 0.12 * np.sin(2 * np.pi * 2 * fr * t)
        y += 0.05 * np.sin(2 * np.pi * 3 * fr * t)
        if d["fault_bias"] == "unbalance":
            y += 0.55 * np.sin(2 * np.pi * fr * t + 0.3)
        if d["fault_bias"] == "bearing":
            bpfo = fr * 3.2
            y += 0.25 * np.sin(2 * np.pi * bpfo * t) * (1 + 0.3 * np.sin(2 * np.pi * fr * t))
        noise = 0.04 if d["fault_bias"] == "none" else 0.08
        y += rng.normal(0, noise, n)
        y *= 1.0 + 0.08 * np.sin(2 * np.pi * 0.5 * t)
        unit = "g"

    return {
        "device_id": device_id,
        "signal": signal,
        "fs": FS,
        "window": window,
        "unit": unit,
        "t": t.tolist(),
        "values": y.astype(float).tolist(),
        "meta": {"rpm": d["rpm"], "fault_bias": d["fault_bias"], "fr_hz": fr},
        "updated_at": time.time(),
    }


def refresh_buffer(device_id: str, signals: Optional[List[str]] = None, window: float = 2.0) -> None:
    """刷新服务端缓冲（算法与 timeseries 共用）。"""
    _device(device_id)
    signals = signals or ["vibration", "temperature", "current"]
    with _LOCK:
        bucket = _BUFFER.setdefault(device_id, {})
        for sig in signals:
            bucket[sig] = _synthesize(device_id, sig, window)


def get_buffered(
    device_id: str,
    signal: str = "vibration",
    window: float = 2.0,
    refresh: bool = False,
) -> Dict[str, Any]:
    """读取服务端缓冲；缺失或要求刷新时重新仿真写入。"""
    _device(device_id)
    signal = signal or "vibration"
    with _LOCK:
        bucket = _BUFFER.get(device_id, {})
        payload = bucket.get(signal)
        need = refresh or payload is None or abs(float(payload.get("window", 0)) - window) > 1e-6
    if need:
        refresh_buffer(device_id, signals=[signal], window=window)
        with _LOCK:
            payload = _BUFFER[device_id][signal]
    return payload


def generate_signal(
    device_id: str,
    signal: str = "vibration",
    window: float = 2.0,
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    """兼容旧名：始终走服务端缓冲（seed 忽略，避免客户端控数）。"""
    return get_buffered(device_id, signal=signal, window=window, refresh=True)
