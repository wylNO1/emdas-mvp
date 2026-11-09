"""故障诊断演示算法（≥4）。响应壳对齐任务文件架构补充。"""
from __future__ import annotations

from typing import Any, Dict, List

import numpy as np

from app.sim.sensors import _device, get_buffered


def _fft_peak_near(x: np.ndarray, fs: float, target_hz: float, tol: float = 2.0) -> float:
    n = len(x)
    spec = np.abs(np.fft.rfft(x * np.hanning(n))) * 2 / n
    freqs = np.fft.rfftfreq(n, 1 / fs)
    mask = (freqs >= target_hz - tol) & (freqs <= target_hz + tol)
    if not np.any(mask):
        return 0.0
    return float(np.max(spec[mask]))


def run_diagnosis(device_id: str) -> Dict[str, Any]:
    d = _device(device_id)
    vib = get_buffered(device_id, signal="vibration", window=2.0, refresh=True)
    temp = get_buffered(device_id, signal="temperature", window=2.0, refresh=False)
    x = np.asarray(vib["values"], dtype=float)
    fs = float(vib["fs"])
    fr = d["rpm"] / 60.0
    t_mean = float(np.mean(np.asarray(temp["values"], dtype=float)))

    fund = _fft_peak_near(x, fs, fr, tol=1.5)
    h2 = _fft_peak_near(x, fs, 2 * fr, tol=2.0)
    ratio = h2 / (fund + 1e-9)
    freq_conf = float(min(0.95, 0.35 + ratio * 0.4 + (0.15 if d["fault_bias"] != "none" else 0)))

    unbal_score = fund / (np.sqrt(np.mean(x ** 2)) + 1e-9)
    if d["fault_bias"] == "unbalance":
        unbal_conf = min(0.93, 0.55 + unbal_score * 0.15)
    else:
        unbal_conf = min(0.55, 0.2 + unbal_score * 0.1)

    bpfo = fr * 3.2
    bpfo_amp = _fft_peak_near(x, fs, bpfo, tol=3.0)
    if d["fault_bias"] == "bearing":
        brg_conf = min(0.94, 0.6 + bpfo_amp * 2)
    else:
        brg_conf = min(0.4, 0.15 + bpfo_amp)

    if t_mean >= 75:
        heat_conf = 0.9
    elif t_mean >= 60:
        heat_conf = 0.65
    else:
        heat_conf = 0.25
    if d["fault_bias"] == "overheat":
        heat_conf = max(heat_conf, 0.88)

    results: List[Dict[str, Any]] = [
        {
            "algorithm": "frequency_anomaly",
            "name": "频率异常",
            "fault_type": "频谱异常",
            "location": "转子/传动链",
            "confidence": round(freq_conf, 2),
            "evidence": [
                f"1×转频幅值 ≈ {fund:.3f} g",
                f"2×转频幅值 ≈ {h2:.3f} g",
                f"2×/1× 比 ≈ {ratio:.2f}",
            ],
            "demo": True,
        },
        {
            "algorithm": "unbalance",
            "name": "不平衡",
            "fault_type": "转子不平衡",
            "location": "叶轮/转子",
            "confidence": round(float(unbal_conf), 2),
            "evidence": [
                f"1×转频主导，幅值 {fund:.3f} g",
                f"相对 RMS 占比 {unbal_score:.2f}",
            ],
            "demo": True,
        },
        {
            "algorithm": "bearing_outer_race",
            "name": "轴承外圈特征",
            "fault_type": "轴承故障",
            "location": "驱动端外圈",
            "confidence": round(float(brg_conf), 2),
            "evidence": [
                f"估计 BPFO ≈ {bpfo:.1f} Hz",
                f"特征频带幅值 ≈ {bpfo_amp:.3f} g",
                "包络能量升高" if brg_conf > 0.5 else "包络能量正常",
            ],
            "demo": True,
        },
        {
            "algorithm": "overheat_rule",
            "name": "过热规则",
            "fault_type": "温升过高",
            "location": "轴承座/绕组",
            "confidence": round(float(heat_conf), 2),
            "evidence": [
                f"平均温度 ≈ {t_mean:.1f} °C",
                "规则：≥60 预警，≥75 告警（演示阈值）",
            ],
            "demo": True,
        },
    ]

    return {
        "device_id": device_id,
        "demo": True,
        "results": results,
    }
