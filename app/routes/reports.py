from fastapi import APIRouter, HTTPException, Depends, Query
from app.db import db
from app.utils.security import get_current_user
from app.models import Role
import datetime
from typing import Optional
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def get_report_summary(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    day: Optional[int] = Query(None),
    user: dict = Depends(get_current_user)
):
    if user["role"] != Role.OWNER:
        raise HTTPException(status_code=403, detail="ไม่มีสิทธิ์ดูรายงาน")

    # กำหนดช่วงเวลา (Date Range)
    date_filter = {}
    if year:
        if month:
            if day:
                start_date = datetime.datetime(year, month, day)
                end_date = start_date + datetime.timedelta(days=1)
            else:
                start_date = datetime.datetime(year, month, 1)
                if month == 12:
                    end_date = datetime.datetime(year + 1, 1, 1)
                else:
                    end_date = datetime.datetime(year, month + 1, 1)
        else:
            start_date = datetime.datetime(year, 1, 1)
            end_date = datetime.datetime(year + 1, 1, 1)
        date_filter = {"$gte": start_date, "$lt": end_date}

    # สรุปสถิติจาก Database
    contract_query = {}
    if date_filter:
        contract_query["created_at"] = date_filter
    
    total_new_contracts = db.contracts.count_documents(contract_query)
    total_customers = db.customers.count_documents({"created_at": date_filter} if date_filter else {})
    
    # ดอกเบี้ยที่ได้รับในช่วงที่เลือก
    interest_query = {"type": "INTEREST"}
    if date_filter:
        interest_query["payment_date"] = date_filter
    interest_payments = list(db.payments.find(interest_query))
    total_interest_earned = sum(p.get("amount", 0) for p in interest_payments)
    
    # ไถ่ถอนในช่วงที่เลือก (นับจาก payment REDEMPTION)
    redemption_query = {"type": "REDEMPTION"}
    if date_filter:
        redemption_query["payment_date"] = date_filter
    redemption_payments = list(db.payments.find(redemption_query))
    total_redemption_earned = sum(p.get("amount", 0) for p in redemption_payments)
    total_redeemed_contracts = len(set(p.get("contract_id") for p in redemption_payments))

    # ยอดเงินรวมที่ได้รับ (ดอกเบี้ย + ไถ่ถอน)
    total_received = total_interest_earned + total_redemption_earned
    total_principal_lent = sum(c.get("principal_amount", 0) for c in db.contracts.find(contract_query))

    # สถานะ ( All time หรือตามช่วง? )
    status_counts = []
    for s in ["ACTIVE", "REDEEMED", "EXPIRED", "FORFEITED"]:
        q = {"status": s}
        if date_filter:
            q["created_at"] = date_filter
        status_counts.append({"status": s, "count": db.contracts.count_documents(q)})

    # ประวัติธุรกรรมล่าสุดสำหรับจัดทำรายงาน รับจำนำ/ไถ่ถอน
    # สัญญาใหม่
    new_contracts = list(db.contracts.find(contract_query).sort("created_at", -1).limit(50))
    transactions = []
    for c in new_contracts:
        item = db.items.find_one({"_id": c.get("item_id")})
        customer = db.customers.find_one({"_id": c.get("customer_id")})
        transactions.append({
            "id": str(c["_id"]),
            "type": "PAWN",
            "contractNumber": c.get("contract_number"),
            "customerName": f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip() if customer else "N/A",
            "itemName": item.get("name", "N/A") if item else "N/A",
            "amount": c.get("principal_amount"),
            "date": c.get("created_at").isoformat()
        })
    
    # การไถ่ถอน
    for p in redemption_payments[:30]:
        contract = db.contracts.find_one({"_id": p.get("contract_id")})
        customer = db.customers.find_one({"_id": contract.get("customer_id")}) if contract else None
        item = db.items.find_one({"_id": contract.get("item_id")}) if contract else None
        transactions.append({
            "id": str(p["_id"]),
            "type": "REDEMPTION",
            "contractNumber": contract.get("contract_number") if contract else "N/A",
            "customerName": f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip() if customer else "N/A",
            "itemName": item.get("name", "N/A") if item else "N/A",
            "amount": p.get("amount"),
            "date": p.get("payment_date").isoformat()
        })
    
    # การต่อดอก (Interest Payments)
    for p in interest_payments[:30]:
        contract = db.contracts.find_one({"_id": p.get("contract_id")})
        customer = db.customers.find_one({"_id": contract.get("customer_id")}) if contract else None
        item = db.items.find_one({"_id": contract.get("item_id")}) if contract else None
        transactions.append({
            "id": str(p["_id"]),
            "type": "RENEWAL",
            "contractNumber": contract.get("contract_number") if contract else "N/A",
            "customerName": f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip() if customer else "N/A",
            "itemName": item.get("name", "N/A") if item else "N/A",
            "amount": p.get("amount"),
            "date": p.get("payment_date").isoformat()
        })
    
    transactions.sort(key=lambda x: x["date"], reverse=True)

    # รายได้รายวัน
    chart_year = year or datetime.datetime.utcnow().year
    chart_month = month or datetime.datetime.utcnow().month
    daily_revenue = []
    if year and month:
        # ดึงรายได้แยกตามวันในเดือนที่เลือก
        start = datetime.datetime(year, month, 1)
        if month == 12:
            end = datetime.datetime(year + 1, 1, 1)
        else:
            end = datetime.datetime(year, month + 1, 1)
        
        interest_daily_agg = db.payments.aggregate([
            {"$match": {"type": "INTEREST", "payment_date": {"$gte": start, "$lt": end}}},
            {"$group": {"_id": {"day": {"$dayOfMonth": "$payment_date"}}, "amount": {"$sum": "$amount"}}}
        ])
        redemption_daily_agg = db.payments.aggregate([
            {"$match": {"type": "REDEMPTION", "payment_date": {"$gte": start, "$lt": end}}},
            {"$group": {"_id": {"day": {"$dayOfMonth": "$payment_date"}}, "amount": {"$sum": "$amount"}}}
        ])
        
        # เก็บข้อมูลใส่ map
        int_map = {item["_id"]["day"]: item["amount"] for item in interest_daily_agg}
        red_map = {item["_id"]["day"]: item["amount"] for item in redemption_daily_agg}
        
        last_day = (end - datetime.timedelta(days=1)).day
        for d in range(1, last_day + 1):
            daily_revenue.append({
                "day": d,
                "interest": int_map.get(d, 0),
                "redemption": red_map.get(d, 0),
                "total": int_map.get(d, 0) + red_map.get(d, 0)
            })

    return {
        "totalNewContracts": total_new_contracts,
        "totalInterestEarned": total_interest_earned,
        "totalRedeemedContracts": total_redeemed_contracts,
        "totalRedeemedAmount": total_redemption_earned,
        "totalReceived": total_received,
        "totalPrincipalLent": total_principal_lent,
        "totalForfeited": db.contracts.count_documents({"status": "FORFEITED", "created_at": date_filter} if date_filter else {"status": "FORFEITED"}),
        "dailyRevenue": daily_revenue,
        "recentTransactions": transactions,
        "selectedPeriod": {"year": year, "month": month, "day": day}
    }
