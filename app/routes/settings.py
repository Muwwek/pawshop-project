from fastapi import APIRouter, HTTPException, Depends
from app.db import db
from app.utils.security import get_current_user
from app.models import Role
from typing import Dict, Any

router = APIRouter()

@router.get("/")
async def get_settings(user: dict = Depends(get_current_user)):
    if user["role"] != Role.OWNER:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์เข้าถึงตั้งค่า")

    settings = db.settings.find_one({}, {"_id": 0})
    if not settings:
        # Default settings if none found
        return {
            "shopName": "PawShop @ Project-DB",
            "interestRate": 2.5,
            "maxDuration": 120,
            "minAmount": 100,
            "maxAmount": 50000,
            "address": "123/45 Bangkok, Thailand",
            "phone": "081-234-5678"
        }

    return {
        "shopName": settings.get("shop_name", "PawShop"),
        "interestRate": settings.get("interest_rate", 2.5),
        "maxDuration": settings.get("max_duration", 120),
        "minAmount": settings.get("min_amount", 100),
        "maxAmount": settings.get("max_amount", 50000),
        "address": settings.get("address", ""),
        "phone": settings.get("phone", ""),
    }

@router.post("/")
async def update_settings(data: Dict[str, Any], user: dict = Depends(get_current_user)):
    if user["role"] != Role.OWNER:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์แก้ไขตั้งค่า")

    db.settings.update_one(
        {},
        {"$set": {
            "shop_name": data.get("shopName"),
            "interest_rate": float(data.get("interestRate", 2.5)),
            "max_duration": int(data.get("maxDuration", 120)),
            "min_amount": float(data.get("minAmount", 100)),
            "max_amount": float(data.get("maxAmount", 50000)),
            "address": data.get("address"),
            "phone": data.get("phone"),
        }},
        upsert=True
    )
    
    return {"success": True}
