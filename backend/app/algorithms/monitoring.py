"""状态监测演示算法（≥6）。响应壳对齐任务文件架构补充。"""
from __future__ import annotations

from typing import Any, Dict, List

import numpy as np

from app.sim.sensors import compute_health, get_buffered


def _rms(x: np.ndarray) -> float:
    return float(np.sqrt(np.mean(x ** 2)))


def _kurtosis(x: np.ndarray) -> float:
    x = x - np.mean(x)
    m2 = np.mean(x ** 2)
    if m2 < 1e-12:
        return 0.0
    return float(np.mean(x ** 4) / (m2 ** 2))


def _spectral_peak(x: np.ndarray, fs: float) -> Dict[str, float]:
    n = len(x)
    windowed = x * np.hanning(n)
    spec = np.abs(np.fft.rfft(windowed)) * 2 / n
    freqs = np.fft.rfftfreq(n, 1 / fs)
    idx = int(np.argmax(spec[1:]) + 1) if len(spec) > 1 else 0
    return {"freq_hz": float(freqs[idx]), "amp": float(spec[idx])}


def _envelope_energy(x: np.ndarray) -> float:
    env = np.abs(x)
    k = max(3, len(x) // 50)
    kernel = np.ones(k) / k
    smooth = np.convolve(env, kernel, mode="same")
    return float(np.mean(smooth ** 2))


def _spc(x: np.ndarray) -> Dict[str, Any]:
    block = max(8, len(x) // 20)
    means = [float(np.mean(x[i : i + block])) for i in range(0, len(x) - block + 1, block)]
    if len(means) < 2:
        means = [float(np.mean(x))]
    mu = float(np.mean(means))
    sigma = float(np.std(means)) + 1e-9
    ucl, lcl = mu + 3 * sigma, mu - 3 * sigma
    ooc = [m for m in means if m > ucl or m < lcl]
    return {
        "mean": mu,
        "sigma": sigma,
        "ucl": ucl,
        "lcl": lcl,
        "out_of_control_points": len(ooc),
        "in_control": len(ooc) == 0,
    }


def run_monitoring(device_id: str) -> Dict[str, Any]:
    # 只读服务端仿真缓冲
    vib = get_buffered(device_id, signal="vibration", window=2.0, refresh=True)
    x = np.asarray(vib["values"], dtype=float)
    fs = float(vib["fs"])

    rms = _rms(x)
    kurt = _kurtosis(x)
    peak = _spectral_peak(x, fs)
    env_e = _envelope_energy(x)
    spc = _spc(x)

    warn_rms, alarm_rms = 0.4, 0.7
    warn_kurt, alarm_kurt = 3.5, 5.0

    def status_for(ok: bool, warn: bool = False) -> str:
        if not ok:
            return "alarm"
        if warn:
            return "warn"
        return "ok"

    results: List[Dict[str, Any]] = [
        {
            "algorithm": "rms",
            "name": "RMS",
            "value": round(rms, 4),
            "unit": "g",
            "status": status_for(rms < alarm_rms, rms >= warn_rms),
            "demo": True,
        },
        {
            "algorithm": "kurtosis",
            "name": "峭度",
            "value": round(kurt, 3),
            "unit": "-",
            "status": status_for(kurt < alarm_kurt, kurt >= warn_kurt),
            "demo": True,
        },
        {
            "algorithm": "spectral_peak",
            "name": "频谱峰值",
            "value": round(peak["amp"], 4),
            "unit": "g",
            "freq_hz": round(peak["freq_hz"], 2),
            "status": "ok",
            "demo": True,
        },
        {
            "algorithm": "envelope_energy",
            "name": "包络能量",
            "value": round(env_e, 5),
            "unit": "g²",
            "status": status_for(env_e < 0.05, env_e >= 0.03),
            "demo": True,
        },
        {
            "algorithm": "threshold_alarm",
            "name": "阈值报警",
            "value": 1.0 if (rms >= warn_rms or kurt >= warn_kurt) else 0.0,
            "unit": "-",
            "status": status_for(rms < alarm_rms and kurt < alarm_kurt, rms >= warn_rms or kurt >= warn_kurt),
            "message": (
                f"RMS={rms:.3f}, 峭度={kurt:.2f}"
            ),
            "demo": True,
        },
        {
            "algorithm": "spc",
            "name": "统计过程控制(SPC)",
            "value": round(spc["mean"], 4),
            "unit": "g",
            "ucl": round(spc["ucl"], 4),
            "lcl": round(spc["lcl"], 4),
            "out_of_control_points": spc["out_of_control_points"],
            "status": "ok" if spc["in_control"] else "alarm",
            "demo": True,
        },
    ]

    alarms: List[Dict[str, str]] = []
    if rms >= alarm_rms:
        alarms.append({"code": "RMS_HI", "message": f"RMS={rms:.3f}g 超过告警阈值 {alarm_rms}"})
    elif rms >= warn_rms:
        alarms.append({"code": "RMS_WARN", "message": f"RMS={rms:.3f}g 超过预警阈值 {warn_rms}"})
    if kurt >= alarm_kurt:
        alarms.append({"code": "KURT_HI", "message": f"峭度={kurt:.2f} 超过告警阈值 {alarm_kurt}"})
    elif kurt >= warn_kurt:
        alarms.append({"code": "KURT_WARN", "message": f"峭度={kurt:.2f} 超过预警阈值 {warn_kurt}"})
    if not spc["in_control"]:
        alarms.append({"code": "SPC_HI", "message": f"SPC 失控点 {spc['out_of_control_points']} 个"})

    health = round(float(compute_health(device_id)), 1)
    return {
        "device_id": device_id,
        "demo": True,
        "results": results,
        "health_score": health,
        "alarms": alarms,
    }
