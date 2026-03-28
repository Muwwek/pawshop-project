from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class Role(str, Enum):
    OWNER = "OWNER"
    STAFF = "STAFF"
    CUSTOMER = "CUSTOMER"

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    identity: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[Role] = Role.CUSTOMER
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phone: Optional[str] = None
    idCard: Optional[str] = None
    address: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    role: str
    name: str

class ContractCreate(BaseModel):
    customerId: str
    itemName: str
    itemDescription: str
    principalAmount: float
    interestRate: float
    estimatedValue: float
    dueDate: str

class PaymentCreate(BaseModel):
    contractId: str
    paymentType: str # INTEREST or REDEMPTION
    amount: float
