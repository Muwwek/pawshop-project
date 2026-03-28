from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.db import db
from app.utils.security import get_current_user
from app.models import Role
import datetime
from typing import Optional, Dict, Any

router = APIRouter()

@router.post("/")
async def create_customer(data: Dict[str, Any], user: dict = Depends(get_current_user)):
    if user["role"] not in [Role.OWNER, Role.STAFF]:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์เพิ่มข้อมูลลูกค้า")
    
    # ตรวจสอบความซ้ำซ้อน (อีเมล หรือ เลขบัตรประชาชน)
    email = data.get("email")
    id_card = data.get("idCard")
    
    if id_card:
        existing_id = db.customers.find_one({"id_card": id_card})
        if existing_id:
            raise HTTPException(status_code=400, detail="เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว")

    if email:
        existing_email = db.customers.find_one({"email": email})
        if existing_email:
            raise HTTPException(status_code=400, detail="อีเมลนี้มีอยู่ในระบบแล้ว")

    new_customer = {
        "first_name": data.get("firstName", ""),
        "last_name": data.get("lastName", ""),
        "email": email or "",
        "phone": data.get("phone", ""),
        "id_card": data.get("idCard", ""),
        "address": data.get("address", ""),
        "created_at": datetime.datetime.utcnow(),
    }
    
    result = db.customers.insert_one(new_customer)
    
    return {
        "success": True,
        "id": str(result.inserted_id)
    }

@router.get("/")
async def get_customers(user: dict = Depends(get_current_user)):
    if user["role"] not in [Role.OWNER, Role.STAFF]:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์ดูข้อมูลลูกค้า")
    
    customers = list(db.customers.find().sort("created_at", -1))
    
    # ดึงรายชื่อลูกค้าที่มี User แล้วเพื่อเช็กสิทธิ์แก้ไขเมล
    users_with_customer = {str(u["customer_id"]): True for u in db.users.find({"customer_id": {"$exists": True}})}
    
    results = []
    for c in customers:
        results.append({
            "id": str(c["_id"]),
            "name": f"{c.get('first_name', '')} {c.get('last_name', '')}".strip(),
            "firstName": c.get("first_name", ""),
            "lastName": c.get("last_name", ""),
            "email": c.get("email", ""),
            "phone": c.get("phone", ""),
            "idCard": c.get("id_card", ""),
            "address": c.get("address", ""),
            "hasUser": users_with_customer.get(str(c["_id"]), False),
            "createdAt": c.get("created_at").isoformat() if c.get("created_at") else None,
        })
    
    return results

@router.put("/{customer_id}")
async def update_customer(customer_id: str, data: Dict[str, Any], user: dict = Depends(get_current_user)):
    if user["role"] not in [Role.OWNER, Role.STAFF]:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์แก้ไขข้อมูลลูกค้า")
    
    existing = db.customers.find_one({"_id": ObjectId(customer_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลลูกค้า")
    
    # เช็กว่าลูกค้าคนนี้สมัครสมาชิก (มี User) หรือยัง
    linked_user = db.users.find_one({"customer_id": ObjectId(customer_id)})
    has_user = linked_user is not None
    
    new_email = data.get("email") or ""
    current_email = existing.get("email") or ""
    new_id_card = data.get("idCard")
    
    # กฎ: ถ้าเป็น STAFF และลูกค้ามี User แล้ว ห้ามแก้เมล (ถ้าเมลเดิมไม่ว่าง)
    if user["role"] == Role.STAFF and has_user and current_email != "" and new_email != current_email:
        raise HTTPException(status_code=400, detail="พนักงานไม่สามารถแก้ไขอีเมลของลูกค้าที่สมัครสมาชิกแล้วได้")

    # ตรวจสอบความซ้ำซ้อนของ Email (ถ้ามีการเปลี่ยนแปลง)
    if new_email and new_email != current_email:
        existing_email = db.customers.find_one({
            "email": new_email,
            "_id": {"$ne": ObjectId(customer_id)}
        })
        if existing_email:
            raise HTTPException(status_code=400, detail="อีเมลนี้ถูกใช้งานโดยลูกค้าคนอื่นแล้ว")

    # ตรวจสอบความซ้ำซ้อนของ ID Card (ถ้ามีการเปลี่ยนแปลง)
    if new_id_card and new_id_card != existing.get("id_card"):
        existing_id = db.customers.find_one({
            "id_card": new_id_card,
            "_id": {"$ne": ObjectId(customer_id)}
        })
        if existing_id:
            raise HTTPException(status_code=400, detail="เลขบัตรประชาชนนี้ถูกใช้งานโดยลูกค้าคนอื่นแล้ว")

    # แยกระหว่างชื่อ-นามสกุล (ถ้าส่งมาเป็นฟิลด์เดียว)
    full_name = data.get("name", "").strip()
    if full_name and " " in full_name:
        parts = full_name.split(None, 1) # split by any whitespace
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""
    else:
        first_name = data.get("firstName", full_name or existing.get("first_name"))
        last_name = data.get("lastName", existing.get("last_name"))

    update_fields = {
        "first_name": first_name,
        "last_name": last_name,
        "email": new_email,
        "phone": data.get("phone") if data.get("phone") is not None else existing.get("phone"),
        "id_card": data.get("idCard") if data.get("idCard") is not None else existing.get("id_card"),
        "address": data.get("address") if data.get("address") is not None else existing.get("address"),
    }
    
    db.customers.update_one({"_id": ObjectId(customer_id)}, {"$set": update_fields})
    
    # ถ้า OWNER แก้เมล และลูกค้ามี User ให้พ่วงแก้เมลในบัญชี Login ด้วย
    if user["role"] == Role.OWNER and has_user and new_email != existing.get("email"):
        db.users.update_one(
            {"customer_id": ObjectId(customer_id)},
            {"$set": {"email": new_email}}
        )
    
    return {"success": True, "message": "อัปเดตข้อมูลสำเร็จ"}
