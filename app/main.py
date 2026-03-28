from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.db import ping_database
from app.routes.auth import router as auth_router
from app.routes.contracts import router as contracts_router
from app.routes.customers import router as customers_router
from app.routes.payments import router as payments_router
from app.routes.reports import router as reports_router
from app.routes.settings import router as settings_router

app = FastAPI(title="Pawshop Backend")

# เพิ่ม CORS Middleware เพื่อให้ Frontend (Next.js) เรียกได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://127.0.0.1:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(contracts_router, prefix="/api/contracts", tags=["contracts"])
app.include_router(customers_router, prefix="/api/customers", tags=["customers"])
app.include_router(payments_router, prefix="/api/payments", tags=["payments"])
app.include_router(reports_router, prefix="/api/reports", tags=["reports"])
app.include_router(settings_router, prefix="/api/settings", tags=["settings"])

@app.on_event("startup")
def startup_check_mongodb() -> None:
    ping_database()

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Pawshop FastAPI Backend"}

@app.get("/health/db")
def health_check_db():
    try:
        ping_database()
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"database connection failed: {exc}")
