// =============================================
// Types & Interfaces สำหรับระบบร้านรับจำนำ
// =============================================

export enum Role {
  OWNER = 'OWNER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  email?: string;
  phone?: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  customerId: string;
  customerName: string;
  itemId: string;
  itemName: string;
  itemDescription: string;
  amount: number;
  interestRate: number;
  status: 'ACTIVE' | 'REDEEMED' | 'FORFEITED' | 'EXPIRED';
  startDate: string;
  dueDate: string;
  interestDue: number;
  totalRedeemAmount: number;
  createdBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  idCard: string;
  phone: string;
  address: string;
  email?: string;
  hasUser?: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  contractId: string;
  contractNumber: string;
  customerName: string;
  type: 'INTEREST' | 'REDEMPTION';
  amount: number;
  paidAt: string;
  receivedBy: string;
}

export interface ReportSummary {
  totalActiveContracts: number;
  totalInterestEarned: number;
  totalRedeemedContracts: number;
  totalForfeited: number;
  totalAmountLent: number;
  monthlyInterest: { month: string; amount: number; year?: number; monthIndex?: number }[];
  contractsByStatus: { status: string; count: number }[];
}

export interface Settings {
  interestRate: number;
  maxDuration: number;
  minAmount: number;
  maxAmount: number;
}

// สิทธิ์การเข้าถึงแต่ละหน้า
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.OWNER]: [
    '/dashboard',
    '/dashboard/contracts',
    '/dashboard/customers',
    '/dashboard/payments',
    '/dashboard/reports',
    '/dashboard/settings',
  ],
  [Role.STAFF]: [
    '/dashboard',
    '/dashboard/contracts',
    '/dashboard/customers',
    '/dashboard/payments',
  ],
  [Role.CUSTOMER]: [
    '/dashboard',
    '/dashboard/portal',
  ],
};

// Menu items สำหรับ Sidebar
export interface MenuItem {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
}

export const MENU_ITEMS: MenuItem[] = [
  { label: 'แดชบอร์ด', href: '/dashboard', icon: '📊', roles: [Role.OWNER, Role.STAFF] },
  { label: 'สัญญาจำนำ', href: '/dashboard/contracts', icon: '📄', roles: [Role.OWNER, Role.STAFF] },
  { label: 'ลูกค้า', href: '/dashboard/customers', icon: '👥', roles: [Role.OWNER, Role.STAFF] },
  { label: 'ชำระเงิน', href: '/dashboard/payments', icon: '💰', roles: [Role.OWNER, Role.STAFF] },
  { label: 'รายงาน', href: '/dashboard/reports', icon: '📈', roles: [Role.OWNER] },
  { label: 'ตั้งค่า', href: '/dashboard/settings', icon: '⚙️', roles: [Role.OWNER] },
  { label: 'พอร์ทัลลูกค้า', href: '/dashboard/portal', icon: '🏠', roles: [Role.CUSTOMER] },
];
