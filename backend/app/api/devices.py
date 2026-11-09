from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.sim.sensors import get_buffered, list_devices

router = APIRouter(tags=["devices"])


@router.get("/devices")
def get_devices():
    return {"demo": True, "devices": list_devices()}


@router.get("/devices/{device_id}/timeseries")
def get_timeseries(
    device_id: str,
    signal: str = Query("vibration"),
    window: float = Query(2.0, ge=0.5, le=30.0),
):
    try:
        payload = get_buffered(device_id, signal=signal, window=window, refresh=True)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"未知设备: {device_id}")
    return {
        "demo": True,
        "device_id": payload["device_id"],
        "signal": payload["signal"],
        "fs": payload["fs"],
        "window": payload["window"],
        "unit": payload["unit"],
        "t": payload["t"],
        "values": payload["values"],
    }
