# Pawshop Project

## Run Backend (FastAPI)

<!-- cspell:disable -->
```powershell
cd c:\Users\hp\Documents\pawshop-project
Set-ExecutionPolicy Unrestricted -Scope CurrentUser
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8001

```
<!-- cspell:enable -->

- Backend URL: http://127.0.0.1:8001
- DB health check: http://127.0.0.1:8001/health/db

## Run Frontend (Next.js)

เปิดอีก terminal แล้วรัน:

```cmd
cd c:\Users\hp\Documents\pawshop-project\frontend
npm run dev
```

- Frontend URL: http://localhost:3002
