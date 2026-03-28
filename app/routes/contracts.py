from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from app.db import db
from app.utils.security import get_current_user
from app.models import ContractCreate, Role
import datetime
from typing import Optional

router = APIRouter()

@router.get("/")
async def get_contracts(
    status: Optional[str] = None,
    customerId: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    
    # ถ้าเป็น CUSTOMER ให้เห็นแค่สัญญาของตัวเอง
    if user["role"] == Role.CUSTOMER:
        # หา customer_id ของ user นี้
        u = db.users.find_one({"_id": ObjectId(user["id"])})
        if u and u.get("customer_id"):
            query["customer_id"] = u["customer_id"]
        else:
            return [] # ไม่พบข้อมูลลูกค้า

    if status:
        query["status"] = status
    if customerId:
        query["customer_id"] = ObjectId(customerId)

    contracts = list(db.contracts.find(query).sort("created_at", -1))
    
    results = []
    for c in contracts:
        # Join customer and item data
        customer = db.customers.find_one({"_id": c.get("customer_id")})
        item = db.items.find_one({"_id": c.get("item_id")})
        
        # คำนวณดอกเบี้ยค้างชำระ (แบบพื้นฐาน: (เงินต้น * อัตราดอกเบี้ย * จำนวนเดือน) / 100)
        interest_due = 0
        db_status = c.get("status")
        now = datetime.datetime.utcnow()
        if db_status in ["ACTIVE", "EXPIRED", "FORFEITED"]:
            start_date = c.get("start_date")
            if start_date:
                # คำนวณจำนวนเดือนที่ผ่านไป (ขั้นต่ำ 1 เดือน)
                months_passed = max(1, (now.year - start_date.year) * 12 + now.month - start_date.month)
                # เช็กวันในเดือนปัจจุบันด้วย ถ้ายังไม่ครบเดือนแต่เลยวันเริ่มต้นมาแล้วให้นับเป็นอีกเดือน (หรือตามนโยบายร้าน)
                if now.day > start_date.day:
                    months_passed += 1
                
                principal = c.get("principal_amount", 0)
                rate = c.get("interest_rate", 2.5) # default if not set
                interest_due = (principal * rate * months_passed) / 100

        results.append({
            "id": str(c["_id"]),
            "contractNumber": c.get("contract_number"),
            "customerId": str(c.get("customer_id")),
            "customerName": f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip() if customer else "N/A",
            "itemId": str(c.get("item_id")),
            "itemName": item.get("name", "N/A") if item else "N/A",
            "itemDescription": item.get("description", "N/A") if item else "N/A",
            "amount": c.get("principal_amount"),
            "principalAmount": c.get("principal_amount"),
            "interestRate": c.get("interest_rate"),
            "interestDue": interest_due, # ดอกเบี้ยค้างชำระ
            "totalRedeemAmount": c.get("principal_amount") + interest_due, # ยอดไถ่คืนรวม
            "estimatedValue": c.get("estimated_value"),
            "status": db_status,
            "startDate": c.get("start_date").isoformat() if c.get("start_date") else None,
            "dueDate": c.get("due_date").isoformat() if c.get("due_date") else None,
            "createdAt": c.get("created_at").isoformat() if c.get("created_at") else None,
            "createdBy": "System",
        })
    
    return results

@router.post("/")
async def create_contract(request: ContractCreate, user: dict = Depends(get_current_user)):
    if user["role"] not in [Role.OWNER, Role.STAFF]:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์สร้างสัญญา")

    # 1. สร้าง Item ก่อน
    item_result = db.items.insert_one({
        "name": request.itemName,
        "description": request.itemDescription,
        "category": "ทั่วไป",
        "created_at": datetime.datetime.utcnow(),
    })
    item_id = item_result.inserted_id

    # 2. รันเลขสัญญาอัตโนมัติ (CNV-YYYYMM-XXXX)
    now = datetime.datetime.utcnow()
    prefix = f"CNV-{now.strftime('%Y%m')}"
    count = db.contracts.count_documents({"contract_number": {"$regex": f"^{prefix}"}})
    contract_number = f"{prefix}-{(count + 1):04d}"

    # 3. สร้าง สัญญา
    contract_result = db.contracts.insert_one({
        "contract_number": contract_number,
        "customer_id": ObjectId(request.customerId),
        "item_id": item_id,
        "principal_amount": request.principalAmount,
        "interest_rate": request.interestRate,
        "estimated_value": request.estimatedValue,
        "status": "ACTIVE",
        "start_date": datetime.datetime.utcnow(),
        "due_date": datetime.datetime.fromisoformat(request.dueDate.replace("Z", "+00:00")),
        "created_at": datetime.datetime.utcnow(),
    })

    return {
        "success": True,
        "id": str(contract_result.inserted_id),
        "contractNumber": contract_number
    }
