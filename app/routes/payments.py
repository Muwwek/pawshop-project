from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.db import db
from app.utils.security import get_current_user
from app.models import Role, PaymentCreate
import datetime
from typing import Optional

router = APIRouter()

@router.get("/")
async def get_payments(
    contractId: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    
    # ถ้าเป็น CUSTOMER ให้เห็นแค่การจ่ายของสัญญาตัวเอง
    if user["role"] == Role.CUSTOMER:
        u = db.users.find_one({"_id": ObjectId(user["id"])})
        if u and u.get("customer_id"):
            # ดึงสัญญาของลูกค้าคนนี้
            contracts = list(db.contracts.find({"customer_id": u["customer_id"]}, {"_id": 1}))
            contract_ids = [c["_id"] for c in contracts]
            query["contract_id"] = {"$in": contract_ids}
        else:
            return []

    if contractId:
        query["contract_id"] = ObjectId(contractId)

    payments = list(db.payments.find(query).sort("payment_date", -1))
    
    results = []
    for p in payments:
        contract = db.contracts.find_one({"_id": p.get("contract_id")})
        customer_name = "N/A"
        item_name = "N/A"
        if contract:
            customer = db.customers.find_one({"_id": contract.get("customer_id")})
            if customer:
                customer_name = f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip()
            
            # Get item name
            item = db.items.find_one({"_id": contract.get("item_id")})
            if item:
                item_name = item.get("name", "N/A")

        # Get receiver name instead of ID
        receiver_name = "System"
        recorded_by_id = p.get("recorded_by")
        if recorded_by_id:
            receiver = db.users.find_one({"_id": recorded_by_id})
            if receiver:
                # Try to get the username or map from role
                if receiver.get("username"):
                    receiver_name = receiver.get("username")
                elif receiver.get("role") == "OWNER":
                    receiver_name = "เจ้าของร้าน"
                elif receiver.get("role") == "STAFF":
                    receiver_name = "พนักงาน"
                else:
                    receiver_name = str(recorded_by_id)

        results.append({
            "id": str(p["_id"]),
            "contractId": str(p.get("contract_id")),
            "contractNumber": contract.get("contract_number") if contract else "N/A",
            "customerName": customer_name,
            "itemName": item_name,
            "type": p.get("type"),
            "amount": p.get("amount"),
            "paidAt": p.get("payment_date").isoformat() if p.get("payment_date") else None,
            "paymentDate": p.get("payment_date").isoformat() if p.get("payment_date") else None,
            "receivedBy": receiver_name,
            "recordedBy": str(recorded_by_id) if recorded_by_id else None,
        })
    
    return results

@router.post("/")
async def create_payment(request: PaymentCreate, user: dict = Depends(get_current_user)):
    if user["role"] not in [Role.OWNER, Role.STAFF]:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์บันทึกการชำระเงิน")
    
    # บันทึกการชำระเงิน
    payment_result = db.payments.insert_one({
        "contract_id": ObjectId(request.contractId),
        "type": request.paymentType,
        "amount": request.amount,
        "payment_date": datetime.datetime.utcnow(),
        "recorded_by": ObjectId(user["id"]),
    })

    # ถ้าเป็นการชำระดอกเบี้ย (INTEREST) ให้ขยายวันครบกำหนด (สมมติขยายไปอีก 30 วัน หรือตามรอบเดิม)
    if request.paymentType == "INTEREST":
        contract = db.contracts.find_one({"_id": ObjectId(request.contractId)})
        if contract:
            current_due_date = contract.get("due_date")
            # ขยายไปอีก 60 วันจากวันครบกำหนดเดิม (หรือจากวันนี้ ถ้าเกินกำหนดแล้ว)
            base_date = max(current_due_date, datetime.datetime.utcnow())
            new_due_date = base_date + datetime.timedelta(days=60)
            
            db.contracts.update_one(
                {"_id": ObjectId(request.contractId)},
                {
                    "$set": {
                        "due_date": new_due_date,
                        "status": "ACTIVE", # กรณีเคยหลุดจำนำแล้วกลับมาจ่าย
                        "is_renewed": True # ทำเครื่องหมายว่าเคยต่อดอกแล้ว
                    }
                }
            )

    # ถ้าเป้นการไถ่ถอน (REDEMPTION) ให้ปิดสัญญาด้วย
    if request.paymentType == "REDEMPTION":
        db.contracts.update_one(
            {"_id": ObjectId(request.contractId)},
            {"$set": {"status": "REDEEMED"}}
        )

    return {
        "success": True,
        "id": str(payment_result.inserted_id)
    }
