from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.algorithms.monitoring import run_monitoring

router = APIRouter(tags=["monitoring"])


class DeviceBody(BaseModel):
    device_id: str = Field(..., min_length=1)


@router.post("/monitoring/run")
def monitoring_run(body: DeviceBody):
    try:
        return run_monitoring(body.device_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"未知设备: {body.device_id}")
