"""寿命预测（RUL）演示算法（≥3）。响应壳对齐任务文件架构补充。"""
from __future__ import annotations

from typing import Any, Dict, List

import numpy as np

from app.sim.sensors import compute_health, get_buffered, _device


def run_rul(device_id: str) -> Dict[str, Any]:
    d = _device(device_id)
    vib = get_buffered(device_id, signal="vibration", window=2.0, refresh=True)
    x = np.asarray(vib["values"], dtype=float)
    health = float(compute_health(device_id))
    rms = float(np.sqrt(np.mean(x ** 2)))

    # 退化速度与故障偏置挂钩（演示）
    bias = d["fault_bias"]
    speed = {"none": 0.35, "unbalance": 0.7, "bearing": 1.1, "overheat": 0.9}.get(bias, 0.5)
    remaining_health = max(5.0, health - 40.0)  # fail near 40

    # 1) 指数退化：H(t)=H0*exp(-k t) → t = ln(H0/Hfail)/k
    k = 0.02 * speed + rms * 0.01
    t50_days = float(np.log(max(health, 41) / 40.0) / max(k, 1e-4))
    t50_days = max(3.0, min(180.0, t50_days))
    exp_p10 = max(1.0, t50_days * 0.45)
    exp_p50 = t50_days
    exp_p90 = t50_days * 1.7

    # 2) 线性外推：按近期“伪趋势”
    slope = -(0.4 + speed * 0.3 + rms)  # health points / day
    lin_p50 = max(2.0, min(160.0, remaining_health / abs(slope)))
    lin_p10 = max(1.0, lin_p50 * 0.5)
    lin_p90 = lin_p50 * 1.6

    # 3) 简易相似度：与健康基线模板的距离映射到寿命
    template_rms = 0.25
    dist = abs(rms - template_rms) + (100 - health) / 100.0
    sim_p50 = max(2.0, min(150.0, 60.0 / (0.5 + dist * (1 + speed))))
    sim_p10 = max(1.0, sim_p50 * 0.4)
    sim_p90 = sim_p50 * 1.8

    results: List[Dict[str, Any]] = [
        {
            "algorithm": "exponential_degradation",
            "name": "指数退化",
            "unit": "day",
            "p10": round(exp_p10, 1),
            "p50": round(exp_p50, 1),
            "p90": round(exp_p90, 1),
            "p10_hours": round(exp_p10 * 24, 0),
            "p50_hours": round(exp_p50 * 24, 0),
            "p90_hours": round(exp_p90 * 24, 0),
            "demo": True,
        },
        {
            "algorithm": "linear_extrapolation",
            "name": "线性外推",
            "unit": "day",
            "p10": round(lin_p10, 1),
            "p50": round(lin_p50, 1),
            "p90": round(lin_p90, 1),
            "p10_hours": round(lin_p10 * 24, 0),
            "p50_hours": round(lin_p50 * 24, 0),
            "p90_hours": round(lin_p90 * 24, 0),
            "demo": True,
        },
        {
            "algorithm": "similarity",
            "name": "简易相似度",
            "unit": "day",
            "p10": round(sim_p10, 1),
            "p50": round(sim_p50, 1),
            "p90": round(sim_p90, 1),
            "p10_hours": round(sim_p10 * 24, 0),
            "p50_hours": round(sim_p50 * 24, 0),
            "p90_hours": round(sim_p90 * 24, 0),
            "demo": True,
        },
    ]

    return {
        "device_id": device_id,
        "demo": True,
        "results": results,
    }
