from fastapi import APIRouter, HTTPException, Depends, Response
from bson import ObjectId
from app.db import db
from app.utils.security import (
    verify_password, 
    hash_password, 
    create_access_token,
    get_current_user
)
from app.models import LoginRequest, RegisterRequest, Role
import datetime

router = APIRouter()

@router.post("/login")
async def login(request: LoginRequest, response: Response):
    print(f"DEBUG: Login attempt for identity: '{request.identity}'")
    # ค้นหาด้วย username หรือ email
    user = db.users.find_one({
        "$or": [
            {"username": request.identity},
            {"email": request.identity}
        ]
    })

    if not user:
        print(f"DEBUG: User not found for identity: '{request.identity}'")
        raise HTTPException(status_code=401, detail="ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง")

    is_correct = verify_password(request.password, user["password"])
    print(f"DEBUG: Password match for '{request.identity}': {is_correct}")
    
    if not is_correct:
        raise HTTPException(status_code=401, detail="ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง")

    # ดึงชื่อลูกค้าถ้าเป็น CUSTOMER
    name = user["username"]
    if user["role"] == Role.CUSTOMER and user.get("customer_id"):
        customer = db.customers.find_one({"_id": user["customer_id"]})
        if customer:
            name = f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip() or user["username"]
    elif user["role"] == Role.OWNER:
        name = "เจ้าของร้าน"
    elif user["role"] == Role.STAFF:
        name = "พนักงาน"

    # สร้าง JWT token
    token_data = {
        "id": str(user["_id"]),
        "username": user["username"],
        "name": name,
        "role": user["role"],
    }
    
    token = create_access_token(data=token_data)

    # ส่งกลับทั้ง JSON และตั้ง Cookie (เพื่อให้ Middleware ของ Next.js ทำงานได้)
    response.set_cookie(
        key="pawshop-token",
        value=token,
        httponly=True,
        max_age=60 * 60 * 8, # 8 hours
        samesite="lax",
        path="/"
    )

    return {
        "success": True,
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": name,
            "role": user["role"],
        }
    }

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@router.post("/register")
async def register(request: RegisterRequest):
    # ตรวจสอบว่ามี username หรือ email นี้หรือยัง
    existing_user = db.users.find_one({
        "$or": [
            {"username": request.username},
            {"email": request.email}
        ]
    })

    if existing_user:
        field = "ชื่อผู้ใช้" if existing_user["username"] == request.username else "อีเมล"
        raise HTTPException(status_code=400, detail=f"{field}นี้ถูกใช้งานแล้ว")

    # บังคับเป็น CUSTOMER สำหรับหน้าลงทะเบียน
    role = Role.CUSTOMER
    hashed_password = hash_password(request.password)

    # 1. ตรวจสอบว่ามีข้อมูลลูกค้าเดิมในระบบหรือไม่ (เน้นเลขบัตรประชาชนเป็นหลัก)
    existing_customer = None
    if request.idCard:
        existing_customer = db.customers.find_one({"id_card": request.idCard})
    
    # ถ้ายังไม่เจอจากเลขบัตร ให้ลองหาจากอีเมล (Fallback)
    if not existing_customer:
        existing_customer = db.customers.find_one({"email": request.email})
    
    if existing_customer:
        customer_id = existing_customer["_id"]
        # อัปเดตข้อมูลด้วยข้อมูลใหม่ที่ลูกค้ากรอกมา (ถือเป็นข้อมูลล่าสุดที่ถูกต้องจากตัวลูกค้าเอง)
        update_data = {}
        if request.email:
            update_data["email"] = request.email
        if request.idCard:
            update_data["id_card"] = request.idCard
        if request.firstName:
            update_data["first_name"] = request.firstName
        if request.lastName:
            update_data["last_name"] = request.lastName
        if request.phone:
            update_data["phone"] = request.phone
        if request.address:
            update_data["address"] = request.address
            
        if update_data:
            db.customers.update_one({"_id": customer_id}, {"$set": update_data})
    else:
        # 2. ถ้าไม่มีข้อมูลลูกค้าเดิมเลย ให้สร้างใหม่
        customer_result = db.customers.insert_one({
            "first_name": request.firstName or "",
            "last_name": request.lastName or "",
            "email": request.email,
            "phone": request.phone or "",
            "id_card": request.idCard or "",
            "address": request.address or "",
            "created_at": datetime.datetime.utcnow(),
        })
        customer_id = customer_result.inserted_id

    # 3. สร้าง User
    user_result = db.users.insert_one({
        "username": request.username,
        "email": request.email,
        "password": hashed_password,
        "role": role.value if hasattr(role, 'value') else role,
        "customer_id": customer_id,
        "is_active": True,
        "created_at": datetime.datetime.utcnow(),
    })

    return {
        "success": True,
        "userId": str(user_result.inserted_id),
        "message": "ลงทะเบียนสำเร็จ"
    }
