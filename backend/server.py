from dotenv import load_dotenv
load_dotenv()

import os
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import bcrypt
import jwt

# ============== Configuration ==============
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "lorkerp")
JWT_SECRET = os.environ.get("JWT_SECRET", "default-secret-change-in-production")
JWT_ALGORITHM = "HS256"
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# ============== Database ==============
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ============== Password Hashing ==============
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# ============== JWT Token Management ==============
def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# ============== Auth Helper ==============
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="غير مصرح")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="نوع الرمز غير صالح")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="المستخدم غير موجود")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="انتهت صلاحية الرمز")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="رمز غير صالح")

# ============== Brute Force Protection ==============
async def check_brute_force(identifier: str):
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        lockout_until = attempt.get("lockout_until")
        if lockout_until and datetime.now(timezone.utc) < lockout_until:
            raise HTTPException(status_code=429, detail="تم قفل الحساب مؤقتاً. حاول مرة أخرى بعد 15 دقيقة")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})

async def record_failed_attempt(identifier: str):
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt:
        new_count = attempt.get("count", 0) + 1
        update = {"$set": {"count": new_count}}
        if new_count >= 5:
            update["$set"]["lockout_until"] = datetime.now(timezone.utc) + timedelta(minutes=15)
        await db.login_attempts.update_one({"identifier": identifier}, update)
    else:
        await db.login_attempts.insert_one({"identifier": identifier, "count": 1})

async def clear_failed_attempts(identifier: str):
    await db.login_attempts.delete_one({"identifier": identifier})

# ============== Pydantic Models ==============
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str = Field(min_length=6)

# Financial Models
class CycleCreate(BaseModel):
    name: str
    start_date: Optional[str] = None
    notes: Optional[str] = None

class FundCreate(BaseModel):
    name: str
    is_main: bool = False
    initial_balance: float = 0

class FundTransaction(BaseModel):
    amount: float
    transaction_type: str  # deposit, withdraw, transfer
    notes: Optional[str] = None
    source: Optional[str] = None
    destination: Optional[str] = None

class ClientCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class SubAgencyCreate(BaseModel):
    name: str
    code: Optional[str] = None
    initial_balance: float = 0
    company_percent: float = 100

class TransferCompanyCreate(BaseModel):
    name: str
    code: Optional[str] = None
    initial_balance: float = 0

class ShippingTransaction(BaseModel):
    transaction_type: str  # buy, sell
    quantity: float
    price: float
    notes: Optional[str] = None
    swap_salary: bool = False
    employee_id: Optional[str] = None

class DebtCreate(BaseModel):
    entity_type: str  # company, fund, agency
    entity_id: str
    amount: float
    debt_type: str  # payable, receivable
    notes: Optional[str] = None

class ExpenseCreate(BaseModel):
    amount: float
    description: str
    category: Optional[str] = None
    deduct_from_main: bool = True

class ApprovalCreate(BaseModel):
    name: str
    code: str
    initial_balance: float = 0

class ApprovalTransaction(BaseModel):
    amount: float
    direction: str  # incoming, outgoing
    commission_percent: float = 0
    notes: Optional[str] = None

class MemberCreate(BaseModel):
    name: str
    user_id: str
    role: str = "employee"
    base_salary: float = 0

class AdjustmentCreate(BaseModel):
    member_id: str
    adjustment_type: str  # bonus, deduction
    amount: float
    reason: str
    notes: Optional[str] = None

class FxSpreadCreate(BaseModel):
    currency: str
    amount_foreign: float
    exchange_rate: float
    add_to_main: bool = True
    notes: Optional[str] = None

class PaymentDueCreate(BaseModel):
    entity_name: str
    amount: float
    due_date: str
    notes: Optional[str] = None

class MessageCreate(BaseModel):
    content: str
    order: int = 0

# ============== Startup ==============
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.financial_cycles.create_index([("user_id", 1), ("is_active", 1)])
    await db.funds.create_index([("user_id", 1), ("cycle_id", 1)])
    await db.clients.create_index([("user_id", 1)])
    await db.sub_agencies.create_index([("user_id", 1)])
    await db.transfer_companies.create_index([("user_id", 1)])
    await db.shipping_transactions.create_index([("user_id", 1), ("cycle_id", 1)])
    await db.debts.create_index([("user_id", 1), ("cycle_id", 1)])
    await db.expenses.create_index([("user_id", 1), ("cycle_id", 1)])
    await db.approvals.create_index([("user_id", 1)])
    await db.members.create_index([("user_id", 1)])
    await db.adjustments.create_index([("user_id", 1), ("cycle_id", 1)])
    
    # Seed admin
    await seed_admin()
    
    yield

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@lorkerp.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123456")
    
    existing = await db.users.find_one({"email": admin_email.lower()})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email.lower(),
            "password_hash": hashed,
            "name": "مدير النظام",
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        })
        print(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email.lower()},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        print(f"Admin password updated: {admin_email}")
    
    # Write credentials to file
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## Admin Account\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write("- Role: admin\n\n")
        f.write("## Auth Endpoints\n")
        f.write("- POST /api/auth/login\n")
        f.write("- POST /api/auth/register\n")
        f.write("- POST /api/auth/logout\n")
        f.write("- GET /api/auth/me\n")
        f.write("- POST /api/auth/refresh\n")

# ============== FastAPI App ==============
app = FastAPI(title="LorkERP API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== Helper Functions ==============
def serialize_doc(doc):
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

async def get_active_cycle(user_id: str):
    cycle = await db.financial_cycles.find_one({
        "user_id": user_id,
        "is_active": True
    })
    return serialize_doc(cycle) if cycle else None

# ============== Auth Routes ==============
@app.post("/api/auth/register")
async def register(user: UserRegister, response: Response):
    email = user.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    hashed = hash_password(user.password)
    result = await db.users.insert_one({
        "email": email,
        "password_hash": hashed,
        "name": user.name,
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    })
    
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    return {
        "_id": user_id, 
        "email": email, 
        "name": user.name, 
        "role": "user",
        "access_token": access_token,
        "refresh_token": refresh_token
    }

@app.post("/api/auth/login")
async def login(user: UserLogin, request: Request, response: Response):
    email = user.email.lower()
    client_ip = request.client.host if request.client else "unknown"
    identifier = f"{client_ip}:{email}"
    
    await check_brute_force(identifier)
    
    db_user = await db.users.find_one({"email": email})
    if not db_user:
        await record_failed_attempt(identifier)
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    if not verify_password(user.password, db_user.get("password_hash", "")):
        await record_failed_attempt(identifier)
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    await clear_failed_attempts(identifier)
    
    user_id = str(db_user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    return {
        "_id": user_id, 
        "email": email, 
        "name": db_user.get("name", ""), 
        "role": db_user.get("role", "user"),
        "access_token": access_token,
        "refresh_token": refresh_token
    }

@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "تم تسجيل الخروج بنجاح"}

@app.get("/api/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@app.post("/api/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="لا يوجد رمز تحديث")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="نوع الرمز غير صالح")
        
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="المستخدم غير موجود")
        
        user_id = str(user["_id"])
        access_token = create_access_token(user_id, user["email"])
        
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        
        return {"message": "تم تحديث الرمز بنجاح"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="انتهت صلاحية رمز التحديث")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="رمز غير صالح")

# ============== Financial Cycles Routes ==============
@app.get("/api/cycles")
async def get_cycles(user: dict = Depends(get_current_user)):
    cycles = await db.financial_cycles.find({"user_id": user["_id"]}).sort("created_at", -1).to_list(100)
    return [serialize_doc(c) for c in cycles]

@app.post("/api/cycles")
async def create_cycle(cycle: CycleCreate, user: dict = Depends(get_current_user)):
    # Deactivate all other cycles
    await db.financial_cycles.update_many(
        {"user_id": user["_id"]},
        {"$set": {"is_active": False}}
    )
    
    result = await db.financial_cycles.insert_one({
        "user_id": user["_id"],
        "name": cycle.name,
        "start_date": cycle.start_date or datetime.now(timezone.utc).isoformat(),
        "notes": cycle.notes,
        "is_active": True,
        "is_closed": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    new_cycle = await db.financial_cycles.find_one({"_id": result.inserted_id})
    return serialize_doc(new_cycle)

@app.put("/api/cycles/{cycle_id}/activate")
async def activate_cycle(cycle_id: str, user: dict = Depends(get_current_user)):
    # Deactivate all cycles
    await db.financial_cycles.update_many(
        {"user_id": user["_id"]},
        {"$set": {"is_active": False}}
    )
    
    # Activate selected cycle
    result = await db.financial_cycles.update_one(
        {"_id": ObjectId(cycle_id), "user_id": user["_id"]},
        {"$set": {"is_active": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="الدورة غير موجودة")
    
    return {"message": "تم تفعيل الدورة بنجاح"}

@app.put("/api/cycles/{cycle_id}/close")
async def close_cycle(cycle_id: str, user: dict = Depends(get_current_user)):
    result = await db.financial_cycles.update_one(
        {"_id": ObjectId(cycle_id), "user_id": user["_id"]},
        {"$set": {"is_closed": True, "is_active": False, "closed_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="الدورة غير موجودة")
    
    return {"message": "تم إغلاق الدورة بنجاح"}

# ============== Funds Routes ==============
@app.get("/api/funds")
async def get_funds(user: dict = Depends(get_current_user)):
    funds = await db.funds.find({"user_id": user["_id"]}).sort("is_main", -1).to_list(100)
    return [serialize_doc(f) for f in funds]

@app.post("/api/funds")
async def create_fund(fund: FundCreate, user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        raise HTTPException(status_code=400, detail="لا توجد دورة مالية نشطة")
    
    # If this is main fund, unset other main funds
    if fund.is_main:
        await db.funds.update_many(
            {"user_id": user["_id"]},
            {"$set": {"is_main": False}}
        )
    
    result = await db.funds.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"],
        "name": fund.name,
        "is_main": fund.is_main,
        "balance": fund.initial_balance,
        "created_at": datetime.now(timezone.utc)
    })
    
    new_fund = await db.funds.find_one({"_id": result.inserted_id})
    return serialize_doc(new_fund)

@app.post("/api/funds/{fund_id}/transaction")
async def fund_transaction(fund_id: str, transaction: FundTransaction, user: dict = Depends(get_current_user)):
    fund = await db.funds.find_one({"_id": ObjectId(fund_id), "user_id": user["_id"]})
    if not fund:
        raise HTTPException(status_code=404, detail="الصندوق غير موجود")
    
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        raise HTTPException(status_code=400, detail="لا توجد دورة مالية نشطة")
    
    new_balance = fund["balance"]
    if transaction.transaction_type == "deposit":
        new_balance += transaction.amount
    elif transaction.transaction_type == "withdraw":
        new_balance -= transaction.amount
    
    await db.funds.update_one(
        {"_id": ObjectId(fund_id)},
        {"$set": {"balance": new_balance}}
    )
    
    await db.fund_transactions.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"],
        "fund_id": fund_id,
        "transaction_type": transaction.transaction_type,
        "amount": transaction.amount,
        "notes": transaction.notes,
        "balance_after": new_balance,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "تمت العملية بنجاح", "new_balance": new_balance}

@app.get("/api/funds/{fund_id}/transactions")
async def get_fund_transactions(fund_id: str, user: dict = Depends(get_current_user)):
    transactions = await db.fund_transactions.find({
        "fund_id": fund_id,
        "user_id": user["_id"]
    }).sort("created_at", -1).to_list(500)
    return [serialize_doc(t) for t in transactions]

# ============== Clients Routes ==============
@app.get("/api/clients")
async def get_clients(user: dict = Depends(get_current_user)):
    clients = await db.clients.find({"user_id": user["_id"]}).sort("name", 1).to_list(1000)
    return [serialize_doc(c) for c in clients]

@app.post("/api/clients")
async def create_client(client: ClientCreate, user: dict = Depends(get_current_user)):
    result = await db.clients.insert_one({
        "user_id": user["_id"],
        "name": client.name,
        "phone": client.phone,
        "email": client.email,
        "address": client.address,
        "notes": client.notes,
        "balance": 0,
        "created_at": datetime.now(timezone.utc)
    })
    
    new_client = await db.clients.find_one({"_id": result.inserted_id})
    return serialize_doc(new_client)

@app.put("/api/clients/{client_id}")
async def update_client(client_id: str, client: ClientCreate, user: dict = Depends(get_current_user)):
    result = await db.clients.update_one(
        {"_id": ObjectId(client_id), "user_id": user["_id"]},
        {"$set": {
            "name": client.name,
            "phone": client.phone,
            "email": client.email,
            "address": client.address,
            "notes": client.notes
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="العميل غير موجود")
    
    updated = await db.clients.find_one({"_id": ObjectId(client_id)})
    return serialize_doc(updated)

@app.delete("/api/clients/{client_id}")
async def delete_client(client_id: str, user: dict = Depends(get_current_user)):
    result = await db.clients.delete_one({"_id": ObjectId(client_id), "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="العميل غير موجود")
    return {"message": "تم حذف العميل بنجاح"}

# ============== Sub Agencies Routes ==============
@app.get("/api/sub-agencies")
async def get_sub_agencies(user: dict = Depends(get_current_user)):
    agencies = await db.sub_agencies.find({"user_id": user["_id"]}).sort("name", 1).to_list(100)
    return [serialize_doc(a) for a in agencies]

@app.post("/api/sub-agencies")
async def create_sub_agency(agency: SubAgencyCreate, user: dict = Depends(get_current_user)):
    result = await db.sub_agencies.insert_one({
        "user_id": user["_id"],
        "name": agency.name,
        "code": agency.code,
        "balance": agency.initial_balance,
        "company_percent": agency.company_percent,
        "created_at": datetime.now(timezone.utc)
    })
    
    new_agency = await db.sub_agencies.find_one({"_id": result.inserted_id})
    return serialize_doc(new_agency)

@app.post("/api/sub-agencies/{agency_id}/bonus")
async def agency_bonus(agency_id: str, amount: float, notes: Optional[str] = None, user: dict = Depends(get_current_user)):
    agency = await db.sub_agencies.find_one({"_id": ObjectId(agency_id), "user_id": user["_id"]})
    if not agency:
        raise HTTPException(status_code=404, detail="الوكالة غير موجودة")
    
    cycle = await get_active_cycle(user["_id"])
    
    new_balance = agency["balance"] - amount
    await db.sub_agencies.update_one(
        {"_id": ObjectId(agency_id)},
        {"$set": {"balance": new_balance}}
    )
    
    await db.agency_transactions.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"] if cycle else None,
        "agency_id": agency_id,
        "transaction_type": "bonus",
        "amount": amount,
        "notes": notes,
        "balance_after": new_balance,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "تم تسجيل المكافأة", "new_balance": new_balance}

@app.post("/api/sub-agencies/{agency_id}/deduct-shipping")
async def agency_deduct_shipping(agency_id: str, amount: float, notes: Optional[str] = None, user: dict = Depends(get_current_user)):
    agency = await db.sub_agencies.find_one({"_id": ObjectId(agency_id), "user_id": user["_id"]})
    if not agency:
        raise HTTPException(status_code=404, detail="الوكالة غير موجودة")
    
    cycle = await get_active_cycle(user["_id"])
    
    new_balance = agency["balance"] + amount
    await db.sub_agencies.update_one(
        {"_id": ObjectId(agency_id)},
        {"$set": {"balance": new_balance}}
    )
    
    await db.agency_transactions.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"] if cycle else None,
        "agency_id": agency_id,
        "transaction_type": "deduct_shipping",
        "amount": amount,
        "notes": notes,
        "balance_after": new_balance,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "تم خصم الشحن", "new_balance": new_balance}

# ============== Transfer Companies Routes ==============
@app.get("/api/transfer-companies")
async def get_transfer_companies(user: dict = Depends(get_current_user)):
    companies = await db.transfer_companies.find({"user_id": user["_id"]}).sort("name", 1).to_list(100)
    return [serialize_doc(c) for c in companies]

@app.post("/api/transfer-companies")
async def create_transfer_company(company: TransferCompanyCreate, user: dict = Depends(get_current_user)):
    result = await db.transfer_companies.insert_one({
        "user_id": user["_id"],
        "name": company.name,
        "code": company.code,
        "balance": company.initial_balance,
        "created_at": datetime.now(timezone.utc)
    })
    
    new_company = await db.transfer_companies.find_one({"_id": result.inserted_id})
    return serialize_doc(new_company)

@app.post("/api/transfer-companies/{company_id}/disburse")
async def company_disburse(company_id: str, amount: float, record_as_debt: bool = False, notes: Optional[str] = None, user: dict = Depends(get_current_user)):
    company = await db.transfer_companies.find_one({"_id": ObjectId(company_id), "user_id": user["_id"]})
    if not company:
        raise HTTPException(status_code=404, detail="الشركة غير موجودة")
    
    cycle = await get_active_cycle(user["_id"])
    
    new_balance = company["balance"] - amount
    await db.transfer_companies.update_one(
        {"_id": ObjectId(company_id)},
        {"$set": {"balance": new_balance}}
    )
    
    await db.company_transactions.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"] if cycle else None,
        "company_id": company_id,
        "transaction_type": "disburse",
        "amount": amount,
        "record_as_debt": record_as_debt,
        "notes": notes,
        "balance_after": new_balance,
        "created_at": datetime.now(timezone.utc)
    })
    
    if record_as_debt:
        await db.debts.insert_one({
            "user_id": user["_id"],
            "cycle_id": cycle["_id"] if cycle else None,
            "entity_type": "company",
            "entity_id": company_id,
            "entity_name": company["name"],
            "amount": amount,
            "remaining": amount,
            "debt_type": "payable",
            "notes": notes,
            "created_at": datetime.now(timezone.utc)
        })
    
    return {"message": "تم الصرف بنجاح", "new_balance": new_balance}

# ============== Shipping Routes ==============
@app.get("/api/shipping")
async def get_shipping_transactions(user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        return []
    
    transactions = await db.shipping_transactions.find({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"]
    }).sort("created_at", -1).to_list(500)
    return [serialize_doc(t) for t in transactions]

@app.get("/api/shipping/summary")
async def get_shipping_summary(user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        return {"total_quantity": 0, "total_cost": 0, "average_price": 0, "total_profit": 0}
    
    pipeline = [
        {"$match": {"user_id": user["_id"], "cycle_id": cycle["_id"]}},
        {"$group": {
            "_id": "$transaction_type",
            "total_quantity": {"$sum": "$quantity"},
            "total_amount": {"$sum": {"$multiply": ["$quantity", "$price"]}}
        }}
    ]
    
    results = await db.shipping_transactions.aggregate(pipeline).to_list(10)
    
    buy_data = next((r for r in results if r["_id"] == "buy"), {"total_quantity": 0, "total_amount": 0})
    sell_data = next((r for r in results if r["_id"] == "sell"), {"total_quantity": 0, "total_amount": 0})
    
    current_quantity = buy_data["total_quantity"] - sell_data["total_quantity"]
    average_price = buy_data["total_amount"] / buy_data["total_quantity"] if buy_data["total_quantity"] > 0 else 0
    
    # Calculate profit from sales
    profit = sell_data["total_amount"] - (sell_data["total_quantity"] * average_price) if sell_data["total_quantity"] > 0 else 0
    
    return {
        "total_quantity": current_quantity,
        "total_cost": buy_data["total_amount"],
        "average_price": average_price,
        "total_profit": profit
    }

@app.post("/api/shipping")
async def create_shipping_transaction(transaction: ShippingTransaction, user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        raise HTTPException(status_code=400, detail="لا توجد دورة مالية نشطة")
    
    result = await db.shipping_transactions.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"],
        "transaction_type": transaction.transaction_type,
        "quantity": transaction.quantity,
        "price": transaction.price,
        "total": transaction.quantity * transaction.price,
        "notes": transaction.notes,
        "swap_salary": transaction.swap_salary,
        "employee_id": transaction.employee_id,
        "created_at": datetime.now(timezone.utc)
    })
    
    new_transaction = await db.shipping_transactions.find_one({"_id": result.inserted_id})
    return serialize_doc(new_transaction)

# ============== Debts Routes ==============
@app.get("/api/debts")
async def get_debts(user: dict = Depends(get_current_user)):
    debts = await db.debts.find({"user_id": user["_id"], "remaining": {"$gt": 0}}).sort("created_at", -1).to_list(500)
    return [serialize_doc(d) for d in debts]

@app.get("/api/debts/summary")
async def get_debts_summary(user: dict = Depends(get_current_user)):
    pipeline = [
        {"$match": {"user_id": user["_id"], "remaining": {"$gt": 0}}},
        {"$group": {
            "_id": "$debt_type",
            "total": {"$sum": "$remaining"}
        }}
    ]
    
    results = await db.debts.aggregate(pipeline).to_list(10)
    
    payable = next((r["total"] for r in results if r["_id"] == "payable"), 0)
    receivable = next((r["total"] for r in results if r["_id"] == "receivable"), 0)
    
    return {"payable": payable, "receivable": receivable}

@app.post("/api/debts")
async def create_debt(debt: DebtCreate, user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    
    # Get entity name
    entity_name = ""
    if debt.entity_type == "company":
        entity = await db.transfer_companies.find_one({"_id": ObjectId(debt.entity_id)})
        entity_name = entity["name"] if entity else ""
    elif debt.entity_type == "fund":
        entity = await db.funds.find_one({"_id": ObjectId(debt.entity_id)})
        entity_name = entity["name"] if entity else ""
    elif debt.entity_type == "agency":
        entity = await db.sub_agencies.find_one({"_id": ObjectId(debt.entity_id)})
        entity_name = entity["name"] if entity else ""
    
    result = await db.debts.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"] if cycle else None,
        "entity_type": debt.entity_type,
        "entity_id": debt.entity_id,
        "entity_name": entity_name,
        "amount": debt.amount,
        "remaining": debt.amount,
        "debt_type": debt.debt_type,
        "notes": debt.notes,
        "created_at": datetime.now(timezone.utc)
    })
    
    new_debt = await db.debts.find_one({"_id": result.inserted_id})
    return serialize_doc(new_debt)

@app.post("/api/debts/{debt_id}/pay")
async def pay_debt(debt_id: str, amount: float, notes: Optional[str] = None, user: dict = Depends(get_current_user)):
    debt = await db.debts.find_one({"_id": ObjectId(debt_id), "user_id": user["_id"]})
    if not debt:
        raise HTTPException(status_code=404, detail="الدين غير موجود")
    
    new_remaining = debt["remaining"] - amount
    if new_remaining < 0:
        new_remaining = 0
    
    await db.debts.update_one(
        {"_id": ObjectId(debt_id)},
        {"$set": {"remaining": new_remaining}}
    )
    
    await db.debt_payments.insert_one({
        "user_id": user["_id"],
        "debt_id": debt_id,
        "amount": amount,
        "notes": notes,
        "remaining_after": new_remaining,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "تم تسديد الدفعة بنجاح", "new_remaining": new_remaining}

# ============== Expenses Routes ==============
@app.get("/api/expenses")
async def get_expenses(user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        return []
    
    expenses = await db.expenses.find({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"]
    }).sort("created_at", -1).to_list(500)
    return [serialize_doc(e) for e in expenses]

@app.get("/api/expenses/summary")
async def get_expenses_summary(user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        return {"total": 0}
    
    pipeline = [
        {"$match": {"user_id": user["_id"], "cycle_id": cycle["_id"]}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    
    results = await db.expenses.aggregate(pipeline).to_list(1)
    return {"total": results[0]["total"] if results else 0}

@app.post("/api/expenses")
async def create_expense(expense: ExpenseCreate, user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        raise HTTPException(status_code=400, detail="لا توجد دورة مالية نشطة")
    
    result = await db.expenses.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"],
        "amount": expense.amount,
        "description": expense.description,
        "category": expense.category,
        "deduct_from_main": expense.deduct_from_main,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Deduct from main fund if specified
    if expense.deduct_from_main:
        main_fund = await db.funds.find_one({"user_id": user["_id"], "is_main": True})
        if main_fund:
            await db.funds.update_one(
                {"_id": main_fund["_id"]},
                {"$inc": {"balance": -expense.amount}}
            )
    
    new_expense = await db.expenses.find_one({"_id": result.inserted_id})
    return serialize_doc(new_expense)

# ============== Approvals Routes ==============
@app.get("/api/approvals")
async def get_approvals(user: dict = Depends(get_current_user)):
    approvals = await db.approvals.find({"user_id": user["_id"]}).sort("name", 1).to_list(100)
    return [serialize_doc(a) for a in approvals]

@app.post("/api/approvals")
async def create_approval(approval: ApprovalCreate, user: dict = Depends(get_current_user)):
    result = await db.approvals.insert_one({
        "user_id": user["_id"],
        "name": approval.name,
        "code": approval.code,
        "balance": approval.initial_balance,
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    })
    
    new_approval = await db.approvals.find_one({"_id": result.inserted_id})
    return serialize_doc(new_approval)

@app.post("/api/approvals/{approval_id}/transaction")
async def approval_transaction(approval_id: str, transaction: ApprovalTransaction, user: dict = Depends(get_current_user)):
    approval = await db.approvals.find_one({"_id": ObjectId(approval_id), "user_id": user["_id"]})
    if not approval:
        raise HTTPException(status_code=404, detail="المعتمد غير موجود")
    
    cycle = await get_active_cycle(user["_id"])
    
    commission = transaction.amount * (transaction.commission_percent / 100)
    
    new_balance = approval["balance"]
    if transaction.direction == "incoming":
        new_balance += transaction.amount
    else:
        new_balance -= transaction.amount
    
    await db.approvals.update_one(
        {"_id": ObjectId(approval_id)},
        {"$set": {"balance": new_balance}}
    )
    
    await db.approval_transactions.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"] if cycle else None,
        "approval_id": approval_id,
        "direction": transaction.direction,
        "amount": transaction.amount,
        "commission_percent": transaction.commission_percent,
        "commission_amount": commission,
        "notes": transaction.notes,
        "balance_after": new_balance,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Record commission as profit
    if commission > 0:
        await db.profit_sources.insert_one({
            "user_id": user["_id"],
            "cycle_id": cycle["_id"] if cycle else None,
            "source_type": "approval_commission",
            "amount": commission,
            "reference_id": approval_id,
            "notes": f"عمولة اعتماد: {approval['name']}",
            "created_at": datetime.now(timezone.utc)
        })
    
    return {"message": "تم تسجيل العملية", "new_balance": new_balance, "commission": commission}

@app.get("/api/approvals/{approval_id}/transactions")
async def get_approval_transactions(approval_id: str, user: dict = Depends(get_current_user)):
    transactions = await db.approval_transactions.find({
        "approval_id": approval_id,
        "user_id": user["_id"]
    }).sort("created_at", -1).to_list(500)
    return [serialize_doc(t) for t in transactions]

# ============== Members Routes ==============
@app.get("/api/members")
async def get_members(user: dict = Depends(get_current_user)):
    members = await db.members.find({"user_id": user["_id"]}).sort("name", 1).to_list(500)
    return [serialize_doc(m) for m in members]

@app.post("/api/members")
async def create_member(member: MemberCreate, user: dict = Depends(get_current_user)):
    result = await db.members.insert_one({
        "user_id": user["_id"],
        "name": member.name,
        "member_user_id": member.user_id,
        "role": member.role,
        "base_salary": member.base_salary,
        "created_at": datetime.now(timezone.utc)
    })
    
    new_member = await db.members.find_one({"_id": result.inserted_id})
    return serialize_doc(new_member)

# ============== Adjustments Routes ==============
@app.get("/api/adjustments")
async def get_adjustments(user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        return []
    
    adjustments = await db.adjustments.find({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"]
    }).sort("created_at", -1).to_list(500)
    return [serialize_doc(a) for a in adjustments]

@app.post("/api/adjustments")
async def create_adjustment(adjustment: AdjustmentCreate, user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        raise HTTPException(status_code=400, detail="لا توجد دورة مالية نشطة")
    
    member = await db.members.find_one({"_id": ObjectId(adjustment.member_id)})
    if not member:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    result = await db.adjustments.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"],
        "member_id": adjustment.member_id,
        "member_name": member["name"],
        "adjustment_type": adjustment.adjustment_type,
        "amount": adjustment.amount,
        "reason": adjustment.reason,
        "notes": adjustment.notes,
        "created_at": datetime.now(timezone.utc)
    })
    
    new_adjustment = await db.adjustments.find_one({"_id": result.inserted_id})
    return serialize_doc(new_adjustment)

# ============== FX Spread Routes ==============
@app.get("/api/fx-spread")
async def get_fx_spreads(user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        return []
    
    spreads = await db.fx_spreads.find({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"]
    }).sort("created_at", -1).to_list(500)
    return [serialize_doc(s) for s in spreads]

@app.post("/api/fx-spread")
async def create_fx_spread(spread: FxSpreadCreate, user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        raise HTTPException(status_code=400, detail="لا توجد دورة مالية نشطة")
    
    amount_usd = spread.amount_foreign * spread.exchange_rate
    
    result = await db.fx_spreads.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"],
        "currency": spread.currency,
        "amount_foreign": spread.amount_foreign,
        "exchange_rate": spread.exchange_rate,
        "amount_usd": amount_usd,
        "add_to_main": spread.add_to_main,
        "notes": spread.notes,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Add to main fund if specified
    if spread.add_to_main:
        main_fund = await db.funds.find_one({"user_id": user["_id"], "is_main": True})
        if main_fund:
            await db.funds.update_one(
                {"_id": main_fund["_id"]},
                {"$inc": {"balance": amount_usd}}
            )
    
    # Record as profit
    await db.profit_sources.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"],
        "source_type": "fx_spread",
        "amount": amount_usd,
        "notes": f"فرق تصريف: {spread.amount_foreign} {spread.currency}",
        "created_at": datetime.now(timezone.utc)
    })
    
    new_spread = await db.fx_spreads.find_one({"_id": result.inserted_id})
    return serialize_doc(new_spread)

# ============== Payment Due Routes ==============
@app.get("/api/payment-due")
async def get_payment_dues(user: dict = Depends(get_current_user)):
    dues = await db.payment_dues.find({
        "user_id": user["_id"],
        "is_paid": False
    }).sort("due_date", 1).to_list(500)
    return [serialize_doc(d) for d in dues]

@app.post("/api/payment-due")
async def create_payment_due(payment: PaymentDueCreate, user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    
    result = await db.payment_dues.insert_one({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"] if cycle else None,
        "entity_name": payment.entity_name,
        "amount": payment.amount,
        "due_date": payment.due_date,
        "notes": payment.notes,
        "is_paid": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    new_payment = await db.payment_dues.find_one({"_id": result.inserted_id})
    return serialize_doc(new_payment)

@app.post("/api/payment-due/{payment_id}/pay")
async def pay_payment_due(payment_id: str, user: dict = Depends(get_current_user)):
    result = await db.payment_dues.update_one(
        {"_id": ObjectId(payment_id), "user_id": user["_id"]},
        {"$set": {"is_paid": True, "paid_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="الدفعة غير موجودة")
    
    return {"message": "تم تسجيل الدفع بنجاح"}

@app.post("/api/payment-due/{payment_id}/postpone")
async def postpone_payment_due(payment_id: str, new_due_date: str, reason: Optional[str] = None, user: dict = Depends(get_current_user)):
    result = await db.payment_dues.update_one(
        {"_id": ObjectId(payment_id), "user_id": user["_id"]},
        {"$set": {"due_date": new_due_date, "postpone_reason": reason}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="الدفعة غير موجودة")
    
    return {"message": "تم تأجيل الدفعة بنجاح"}

# ============== Messages Routes ==============
@app.get("/api/messages")
async def get_messages(user: dict = Depends(get_current_user)):
    messages = await db.messages.find({"user_id": user["_id"]}).sort("order", 1).to_list(100)
    return [serialize_doc(m) for m in messages]

@app.post("/api/messages")
async def create_message(message: MessageCreate, user: dict = Depends(get_current_user)):
    result = await db.messages.insert_one({
        "user_id": user["_id"],
        "content": message.content,
        "order": message.order,
        "created_at": datetime.now(timezone.utc)
    })
    
    new_message = await db.messages.find_one({"_id": result.inserted_id})
    return serialize_doc(new_message)

@app.put("/api/messages/{message_id}")
async def update_message(message_id: str, message: MessageCreate, user: dict = Depends(get_current_user)):
    result = await db.messages.update_one(
        {"_id": ObjectId(message_id), "user_id": user["_id"]},
        {"$set": {"content": message.content, "order": message.order}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="الرسالة غير موجودة")
    
    updated = await db.messages.find_one({"_id": ObjectId(message_id)})
    return serialize_doc(updated)

@app.delete("/api/messages/{message_id}")
async def delete_message(message_id: str, user: dict = Depends(get_current_user)):
    result = await db.messages.delete_one({"_id": ObjectId(message_id), "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="الرسالة غير موجودة")
    return {"message": "تم حذف الرسالة بنجاح"}

@app.put("/api/messages/reorder")
async def reorder_messages(message_ids: list[str], user: dict = Depends(get_current_user)):
    for i, msg_id in enumerate(message_ids):
        await db.messages.update_one(
            {"_id": ObjectId(msg_id), "user_id": user["_id"]},
            {"$set": {"order": i}}
        )
    return {"message": "تم إعادة ترتيب الرسائل"}

# ============== Profit Sources Routes ==============
@app.get("/api/profit-sources")
async def get_profit_sources(user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        return []
    
    profits = await db.profit_sources.find({
        "user_id": user["_id"],
        "cycle_id": cycle["_id"]
    }).sort("created_at", -1).to_list(500)
    return [serialize_doc(p) for p in profits]

@app.get("/api/profit-sources/summary")
async def get_profit_summary(user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        return {"total": 0, "by_type": {}}
    
    pipeline = [
        {"$match": {"user_id": user["_id"], "cycle_id": cycle["_id"]}},
        {"$group": {
            "_id": "$source_type",
            "total": {"$sum": "$amount"}
        }}
    ]
    
    results = await db.profit_sources.aggregate(pipeline).to_list(20)
    
    by_type = {r["_id"]: r["total"] for r in results}
    total = sum(r["total"] for r in results)
    
    return {"total": total, "by_type": by_type}

# ============== Dashboard Routes ==============
@app.get("/api/dashboard/summary")
async def get_dashboard_summary(user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    
    # Get main fund balance
    main_fund = await db.funds.find_one({"user_id": user["_id"], "is_main": True})
    main_fund_balance = main_fund["balance"] if main_fund else 0
    
    # Get expenses total
    expenses_total = 0
    if cycle:
        expenses_pipeline = [
            {"$match": {"user_id": user["_id"], "cycle_id": cycle["_id"]}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        expenses_result = await db.expenses.aggregate(expenses_pipeline).to_list(1)
        expenses_total = expenses_result[0]["total"] if expenses_result else 0
    
    # Get profits total
    profits_total = 0
    if cycle:
        profits_pipeline = [
            {"$match": {"user_id": user["_id"], "cycle_id": cycle["_id"]}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        profits_result = await db.profit_sources.aggregate(profits_pipeline).to_list(1)
        profits_total = profits_result[0]["total"] if profits_result else 0
    
    # Get debts summary
    debts_pipeline = [
        {"$match": {"user_id": user["_id"], "remaining": {"$gt": 0}}},
        {"$group": {
            "_id": "$debt_type",
            "total": {"$sum": "$remaining"}
        }}
    ]
    debts_result = await db.debts.aggregate(debts_pipeline).to_list(10)
    payable = next((r["total"] for r in debts_result if r["_id"] == "payable"), 0)
    receivable = next((r["total"] for r in debts_result if r["_id"] == "receivable"), 0)
    
    # Get shipping summary
    shipping_quantity = 0
    if cycle:
        shipping_pipeline = [
            {"$match": {"user_id": user["_id"], "cycle_id": cycle["_id"]}},
            {"$group": {
                "_id": "$transaction_type",
                "total_quantity": {"$sum": "$quantity"}
            }}
        ]
        shipping_result = await db.shipping_transactions.aggregate(shipping_pipeline).to_list(10)
        buy_qty = next((r["total_quantity"] for r in shipping_result if r["_id"] == "buy"), 0)
        sell_qty = next((r["total_quantity"] for r in shipping_result if r["_id"] == "sell"), 0)
        shipping_quantity = buy_qty - sell_qty
    
    # Get payment dues
    payment_dues_pipeline = [
        {"$match": {"user_id": user["_id"], "is_paid": False}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    payment_dues_result = await db.payment_dues.aggregate(payment_dues_pipeline).to_list(1)
    payment_dues_total = payment_dues_result[0]["total"] if payment_dues_result else 0
    
    net_profit = profits_total - expenses_total
    
    return {
        "cycle": cycle,
        "main_fund_balance": main_fund_balance,
        "net_profit": net_profit,
        "total_expenses": expenses_total,
        "total_profits": profits_total,
        "payable_debts": payable,
        "receivable_debts": receivable,
        "shipping_quantity": shipping_quantity,
        "payment_dues": payment_dues_total
    }

# ============== Search Routes ==============
@app.get("/api/search")
async def search(q: str, user: dict = Depends(get_current_user)):
    results = []
    
    # Search clients
    clients = await db.clients.find({
        "user_id": user["_id"],
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"phone": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}}
        ]
    }).to_list(20)
    results.extend([{**serialize_doc(c), "type": "client"} for c in clients])
    
    # Search members
    members = await db.members.find({
        "user_id": user["_id"],
        "name": {"$regex": q, "$options": "i"}
    }).to_list(20)
    results.extend([{**serialize_doc(m), "type": "member"} for m in members])
    
    # Search agencies
    agencies = await db.sub_agencies.find({
        "user_id": user["_id"],
        "name": {"$regex": q, "$options": "i"}
    }).to_list(20)
    results.extend([{**serialize_doc(a), "type": "agency"} for a in agencies])
    
    # Search companies
    companies = await db.transfer_companies.find({
        "user_id": user["_id"],
        "name": {"$regex": q, "$options": "i"}
    }).to_list(20)
    results.extend([{**serialize_doc(c), "type": "company"} for c in companies])
    
    return results

# ============== Analytics Routes ==============
@app.get("/api/analytics/overview")
async def get_analytics_overview(user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    
    # Get all funds total
    funds_pipeline = [
        {"$match": {"user_id": user["_id"]}},
        {"$group": {"_id": None, "total": {"$sum": "$balance"}}}
    ]
    funds_result = await db.funds.aggregate(funds_pipeline).to_list(1)
    total_funds = funds_result[0]["total"] if funds_result else 0
    
    # Get counts
    clients_count = await db.clients.count_documents({"user_id": user["_id"]})
    members_count = await db.members.count_documents({"user_id": user["_id"]})
    agencies_count = await db.sub_agencies.count_documents({"user_id": user["_id"]})
    companies_count = await db.transfer_companies.count_documents({"user_id": user["_id"]})
    
    # Active debts count
    active_debts = await db.debts.count_documents({"user_id": user["_id"], "remaining": {"$gt": 0}})
    
    # Pending payments count
    pending_payments = await db.payment_dues.count_documents({"user_id": user["_id"], "is_paid": False})
    
    return {
        "total_funds": total_funds,
        "clients_count": clients_count,
        "members_count": members_count,
        "agencies_count": agencies_count,
        "companies_count": companies_count,
        "active_debts": active_debts,
        "pending_payments": pending_payments,
        "active_cycle": cycle["name"] if cycle else None
    }

@app.get("/api/analytics/profit-expense-trend")
async def get_profit_expense_trend(days: int = 30, user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        return {"data": []}
    
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Get expenses by date
    expenses_pipeline = [
        {"$match": {
            "user_id": user["_id"],
            "cycle_id": cycle["_id"],
            "created_at": {"$gte": start_date}
        }},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "total": {"$sum": "$amount"}
        }},
        {"$sort": {"_id": 1}}
    ]
    expenses_data = await db.expenses.aggregate(expenses_pipeline).to_list(100)
    
    # Get profits by date
    profits_pipeline = [
        {"$match": {
            "user_id": user["_id"],
            "cycle_id": cycle["_id"],
            "created_at": {"$gte": start_date}
        }},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "total": {"$sum": "$amount"}
        }},
        {"$sort": {"_id": 1}}
    ]
    profits_data = await db.profit_sources.aggregate(profits_pipeline).to_list(100)
    
    # Merge data
    dates = set()
    expense_map = {}
    profit_map = {}
    
    for e in expenses_data:
        dates.add(e["_id"])
        expense_map[e["_id"]] = e["total"]
    
    for p in profits_data:
        dates.add(p["_id"])
        profit_map[p["_id"]] = p["total"]
    
    result = []
    for date in sorted(dates):
        result.append({
            "date": date,
            "expenses": expense_map.get(date, 0),
            "profits": profit_map.get(date, 0)
        })
    
    return {"data": result}

@app.get("/api/analytics/profit-by-source")
async def get_profit_by_source(user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        return {"data": []}
    
    pipeline = [
        {"$match": {"user_id": user["_id"], "cycle_id": cycle["_id"]}},
        {"$group": {
            "_id": "$source_type",
            "total": {"$sum": "$amount"}
        }},
        {"$sort": {"total": -1}}
    ]
    
    results = await db.profit_sources.aggregate(pipeline).to_list(20)
    
    source_labels = {
        "shipping": "أرباح الشحن",
        "fx_spread": "فرق التصريف",
        "approval_commission": "عمولة الاعتمادات",
        "brokerage": "وساطة إدارية"
    }
    
    data = [{"name": source_labels.get(r["_id"], r["_id"]), "value": r["total"], "type": r["_id"]} for r in results]
    
    return {"data": data}

@app.get("/api/analytics/expense-by-category")
async def get_expense_by_category(user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        return {"data": []}
    
    pipeline = [
        {"$match": {"user_id": user["_id"], "cycle_id": cycle["_id"]}},
        {"$group": {
            "_id": {"$ifNull": ["$category", "أخرى"]},
            "total": {"$sum": "$amount"}
        }},
        {"$sort": {"total": -1}}
    ]
    
    results = await db.expenses.aggregate(pipeline).to_list(20)
    
    data = [{"name": r["_id"], "value": r["total"]} for r in results]
    
    return {"data": data}

@app.get("/api/analytics/shipping-trend")
async def get_shipping_trend(days: int = 30, user: dict = Depends(get_current_user)):
    cycle = await get_active_cycle(user["_id"])
    if not cycle:
        return {"data": []}
    
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    pipeline = [
        {"$match": {
            "user_id": user["_id"],
            "cycle_id": cycle["_id"],
            "created_at": {"$gte": start_date}
        }},
        {"$group": {
            "_id": {
                "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "type": "$transaction_type"
            },
            "quantity": {"$sum": "$quantity"},
            "total": {"$sum": "$total"}
        }},
        {"$sort": {"_id.date": 1}}
    ]
    
    results = await db.shipping_transactions.aggregate(pipeline).to_list(200)
    
    # Organize by date
    date_map = {}
    for r in results:
        date = r["_id"]["date"]
        if date not in date_map:
            date_map[date] = {"date": date, "buy": 0, "sell": 0, "buy_total": 0, "sell_total": 0}
        
        if r["_id"]["type"] == "buy":
            date_map[date]["buy"] = r["quantity"]
            date_map[date]["buy_total"] = r["total"]
        else:
            date_map[date]["sell"] = r["quantity"]
            date_map[date]["sell_total"] = r["total"]
    
    data = [date_map[d] for d in sorted(date_map.keys())]
    
    return {"data": data}

@app.get("/api/analytics/debt-summary")
async def get_debt_summary(user: dict = Depends(get_current_user)):
    # By entity type
    pipeline = [
        {"$match": {"user_id": user["_id"], "remaining": {"$gt": 0}}},
        {"$group": {
            "_id": {"type": "$debt_type", "entity": "$entity_type"},
            "total": {"$sum": "$remaining"},
            "count": {"$sum": 1}
        }}
    ]
    
    results = await db.debts.aggregate(pipeline).to_list(20)
    
    entity_labels = {"company": "شركات", "fund": "صناديق", "agency": "وكالات"}
    
    payable_data = []
    receivable_data = []
    
    for r in results:
        item = {
            "name": entity_labels.get(r["_id"]["entity"], r["_id"]["entity"]),
            "value": r["total"],
            "count": r["count"]
        }
        if r["_id"]["type"] == "payable":
            payable_data.append(item)
        else:
            receivable_data.append(item)
    
    return {"payable": payable_data, "receivable": receivable_data}

@app.get("/api/analytics/recent-transactions")
async def get_recent_transactions(limit: int = 10, user: dict = Depends(get_current_user)):
    transactions = []
    
    # Recent expenses
    expenses = await db.expenses.find({"user_id": user["_id"]}).sort("created_at", -1).limit(limit).to_list(limit)
    for e in expenses:
        transactions.append({
            "type": "expense",
            "amount": -e["amount"],
            "description": e["description"],
            "category": e.get("category"),
            "date": e["created_at"].isoformat() if isinstance(e["created_at"], datetime) else e["created_at"]
        })
    
    # Recent profits
    profits = await db.profit_sources.find({"user_id": user["_id"]}).sort("created_at", -1).limit(limit).to_list(limit)
    for p in profits:
        transactions.append({
            "type": "profit",
            "amount": p["amount"],
            "description": p.get("notes", "ربح"),
            "category": p.get("source_type"),
            "date": p["created_at"].isoformat() if isinstance(p["created_at"], datetime) else p["created_at"]
        })
    
    # Sort by date
    transactions.sort(key=lambda x: x["date"], reverse=True)
    
    return {"data": transactions[:limit]}

# ============== Health Check ==============
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
