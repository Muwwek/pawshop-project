from fastapi import APIRouter, HTTPException, Depends
from app.db import db
from app.utils.security import get_current_user
from app.models import Role
import datetime

router = APIRouter()

@router.get("/")
async def get_report_summary(user: dict = Depends(get_current_user)):
    if user["role"] != Role.OWNER:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์ดูรายงาน")

    # สรุปสถิติจาก Database
    active_contracts = db.contracts.count_documents({"status": "ACTIVE"})
    total_customers = db.customers.count_documents({})
    redeemed_contracts = db.contracts.count_documents({"status": "REDEEMED"})
    forfeited_contracts = db.contracts.count_documents({"status": "FORFEITED"})
    
    # คำนวณดอกเบี้ยที่ได้รับ (จาก payments type=INTEREST)
    interest_payments = list(db.payments.find({"type": "INTEREST"}))
    interest_earned = sum(p.get("amount", 0) for p in interest_payments)
    
    # คำนวณเงินต้นที่จำนำทั้งหมด
    all_contracts = list(db.contracts.find({}))
    total_amount_lent = sum(c.get("principal_amount", 0) for c in all_contracts)

    # แบ่งตามสถานะ
    status_counts = [
        {"status": "ACTIVE", "count": active_contracts},
        {"status": "REDEEMED", "count": redeemed_contracts},
        {"status": "EXPIRED", "count": db.contracts.count_documents({"status": "EXPIRED"})},
        {"status": "FORFEITED", "count": forfeited_contracts},
    ]

    # คำนวณรายได้ดอกเบี้ยทุกเดือนที่มีข้อมูล
    pipeline = [
        {"$match": {"type": "INTEREST"}},
        {"$group": {
            "_id": {
                "year": {"$year": "$payment_date"},
                "month": {"$month": "$payment_date"}
            },
            "amount": {"$sum": "$amount"}
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1}}
    ]
    
    interest_agg = list(db.payments.aggregate(pipeline))
    monthly_interest = []
    month_names = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
    
    # ถ้าไม่มีข้อมูลเลย ให้ส่ง 12 เดือนล่าสุดกลับไปเป็น 0
    if not interest_agg:
        now = datetime.datetime.utcnow()
        for i in range(11, -1, -1):
            target_month = (now.month - i - 1) % 12 + 1
            target_year = now.year if now.month - i > 0 else now.year - 1
            monthly_interest.append({
                "month": month_names[target_month - 1],
                "year": target_year,
                "monthIndex": target_month,
                "amount": 0
            })
    else:
        # อาจจะเติมเดือนที่แหว่งไปให้เต็มปี (optional) แต่เพื่อความง่าย ส่งกลับเฉพาะเดือนที่มีข้อมูล
        # หรือแค่ส่งทั้งหมดที่มี แล้วให้ Frontend จัดการ
        for item in interest_agg:
            year = item["_id"].get("year")
            month = item["_id"].get("month")
            if not year or not month:
                continue
            amount = item.get("amount", 0)
            monthly_interest.append({
                "month": month_names[month - 1],
                "year": year,
                "monthIndex": month,
                "amount": amount
            })

    return {
        "totalActiveContracts": active_contracts,
        "totalInterestEarned": interest_earned,
        "totalRedeemedContracts": redeemed_contracts,
        "totalForfeited": forfeited_contracts,
        "totalAmountLent": total_amount_lent,
        "monthlyInterest": monthly_interest,
        "contractsByStatus": status_counts
    }
