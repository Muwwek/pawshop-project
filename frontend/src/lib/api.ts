import { Contract, Customer, Payment, ReportSummary, Settings, User, Role } from './types';

const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer ? 'http://localhost:8001' : '';

async function apiFetch<T>(path: string): Promise<T> {
  const options: RequestInit = {
    cache: 'no-store',
    credentials: 'include',
  };

  // ถ้าเรียกจาก Server Component ต้องส่งต่อ Cookie ไปด้วยเพื่อให้ Backend รู้ว่าเป็นใคร
  if (isServer) {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    options.headers = {
      Cookie: cookieStore.toString(),
    };
  }

  const res = await fetch(`${API_BASE_URL}${path}`, options);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path} (${res.status})`);
  }

  return res.json();
}

// =============================================
// API Functions ดึงข้อมูลจาก FastAPI
// =============================================

export async function getContracts(customerId?: string): Promise<Contract[]> {
  const path = customerId ? `/api/contracts/?customerId=${customerId}` : '/api/contracts/';
  return apiFetch<Contract[]>(path);
}

export async function getCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>('/api/customers/');
}

export async function getPayments(contractId?: string): Promise<Payment[]> {
  const path = contractId ? `/api/payments/?contractId=${contractId}` : '/api/payments/';
  return apiFetch<Payment[]>(path);
}

export async function getReportSummary(): Promise<ReportSummary> {
  return apiFetch<ReportSummary>('/api/reports/');
}

export async function getSettings(): Promise<Settings> {
  return apiFetch<Settings>('/api/settings/');
}

// สำหรับ customer portal
export async function getMyContracts(): Promise<Contract[]> {
  return apiFetch<Contract[]>('/api/contracts/');
}

export async function getMyPayments(): Promise<Payment[]> {
  return apiFetch<Payment[]>('/api/payments/');
}

// =============================================
// Mutation Functions บันทึกข้อมูลไปยัง FastAPI
// =============================================

export async function createCustomer(data: Partial<Customer>): Promise<{ success: boolean; id: string }> {
  const res = await fetch(`${API_BASE_URL}/api/customers/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Failed to update customer');
  }
  return res.json();
}

export async function createContract(data: { 
  customerId: string; 
  itemName: string; 
  itemDescription: string; 
  principalAmount: string | number; 
  interestRate: string | number; 
  estimatedValue: string | number; 
  dueDate: string; 
}): Promise<{ success: boolean; id: string; contractNumber: string }> {
  const res = await fetch(`${API_BASE_URL}/api/contracts/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to create contract');
  return res.json();
}

export async function createPayment(data: { contractId: string; paymentType: string; amount: number }): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/payments/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to record payment');
  return res.json();
}

export async function updateSettings(data: Settings): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/settings/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

// สำหรับเรียกจาก Client Component (เพราะ getSession ใช้ cookies() ซึ่งเป็น server-side เท่านั้น)
export async function getClientSession(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      username: data.username,
      name: data.name,
      role: data.role as Role,
    };
  } catch {
    return null;
  }
}

// Mock delay function
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
