from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.algorithms.rul import run_rul

router = APIRouter(tags=["rul"])


class DeviceBody(BaseModel):
    device_id: str = Field(..., min_length=1)


@router.post("/rul/predict")
def rul_predict(body: DeviceBody):
    try:
        return run_rul(body.device_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"未知设备: {body.device_id}")
