from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.db import db
from app.utils.security import get_current_user, hash_password
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

@router.get("/{customer_id}/history")
async def get_customer_history(customer_id: str, user: dict = Depends(get_current_user)):
    if user["role"] not in [Role.OWNER, Role.STAFF]:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์ดูประวัติลูกค้า")
        
    customer = db.customers.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลลูกค้า")
        
    # ดึงสัญญาทั้งหมดของลูกค้า
    contracts_cursor = db.contracts.find({"customer_id": ObjectId(customer_id)}).sort("created_at", -1)
    contracts = list(contracts_cursor)
    
    # ดึง payments ทั้งหมดของสัญญาเหล่านี้
    contract_ids = [c["_id"] for c in contracts]
    payments_cursor = db.payments.find({"contract_id": {"$in": contract_ids}}).sort("payment_date", -1)
    payments = list(payments_cursor)
    
    # Format Response
    now = datetime.datetime.utcnow()
    formatted_contracts = []
    
    # Cache สำหรับ Item และ User (Staff)
    item_ids = [c["item_id"] for c in contracts if c.get("item_id")]
    items = {str(i["_id"]): i for i in db.items.find({"_id": {"$in": item_ids}})}
    users = {str(u["_id"]): u.get("first_name", u.get("username", "System")) for u in db.users.find({}, {"first_name": 1, "username": 1})}

    for c in contracts:
        item = items.get(str(c.get("item_id")), {})
        
        # คำนวณสถานะเหมือนหน้ารวม
        db_status = c.get("status")
        display_status = db_status
        is_renewed = c.get("is_renewed", False)
        if db_status == "ACTIVE":
            due_date_dt = c.get("due_date")
            if due_date_dt:
                if now > due_date_dt:
                    display_status = "EXPIRED"
                elif (due_date_dt - now).days <= 7:
                    display_status = "NEAR_DUE"
                elif is_renewed:
                    display_status = "RENEWED"
                    
        creator_id = str(c.get("created_by_id")) if c.get("created_by_id") else None
        created_by_name = users.get(creator_id, "System")
        
        formatted_contracts.append({
            "id": str(c["_id"]),
            "contractNumber": c.get("contract_number"),
            "itemName": item.get("name", "N/A"),
            "itemDescription": item.get("description", "N/A"),
            "amount": c.get("principal_amount"),
            "interestRate": c.get("interest_rate"),
            "estimatedValue": c.get("estimated_value"),
            "status": display_status,
            "startDate": c.get("start_date").isoformat() if c.get("start_date") else None,
            "dueDate": c.get("due_date").isoformat() if c.get("due_date") else None,
            "createdAt": c.get("created_at").isoformat() if c.get("created_at") else None,
            "createdBy": created_by_name,
        })
        
    formatted_payments = []
    for p in payments:
        formatted_payments.append({
            "id": str(p["_id"]),
            "contractId": str(p.get("contract_id")),
            "type": p.get("type"),
            "amount": p.get("amount"),
            "paymentDate": p.get("payment_date").isoformat() if p.get("payment_date") else None,
            "recordedBy": users.get(str(p.get("recorded_by"))) if p.get("recorded_by") else "System",
        })

    return {
        "customer": {
            "id": str(customer["_id"]),
            "name": f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip(),
            "firstName": customer.get("first_name", ""),
            "lastName": customer.get("last_name", ""),
            "email": customer.get("email", ""),
            "phone": customer.get("phone", ""),
            "idCard": customer.get("id_card", ""),
            "address": customer.get("address", ""),
            "createdAt": customer.get("created_at").isoformat() if customer.get("created_at") else None,
        },
        "contracts": formatted_contracts,
        "payments": formatted_payments
    }
@router.put("/{customer_id}/password")
async def reset_customer_password(customer_id: str, data: Dict[str, Any], user: dict = Depends(get_current_user)):
    if user["role"] != Role.OWNER:
        raise HTTPException(status_code=403, detail="เฉพาะเจ้าของร้านเท่านั้นที่สามารถรีเซ็ตรหัสผ่านได้")
    
    new_password = data.get("password")
    if not new_password or len(new_password) < 6:
        raise HTTPException(status_code=400, detail="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
    
    # ตรวจสอบว่ามี User ที่พ่วงกับลูกค้านี้จริงหรือไม่
    linked_user = db.users.find_one({"customer_id": ObjectId(customer_id)})
    if not linked_user:
        raise HTTPException(status_code=404, detail="ลูกค้านี้ยังไม่ได้สมัครสมาชิกเข้าใช้งานระบบ")
    
    # Hash และ Update
    hashed = hash_password(new_password)
    db.users.update_one(
        {"_id": linked_user["_id"]},
        {"$set": {"password": hashed}}
    )
    
    return {"success": True, "message": "รีเซ็ตรหัสผ่านสำเร็จ"}
