import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User, Role, ROLE_PERMISSIONS } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pawshop-secret-key-2024-very-secure'
);

const COOKIE_NAME = 'pawshop-token';

// Mock users สำหรับทดสอบ
export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'u1',
    username: 'owner1',
    password: 'password',
    name: 'สมชาย เจ้าของร้าน',
    role: Role.OWNER,
    email: 'owner@pawshop.com',
  },
  {
    id: 'u2',
    username: 'staff1',
    password: 'password',
    name: 'สมหญิง พนักงาน',
    role: Role.STAFF,
    email: 'staff@pawshop.com',
  },
  {
    id: 'u3',
    username: 'customer1',
    password: 'password',
    name: 'สมศรี ลูกค้า',
    role: Role.CUSTOMER,
    email: 'customer@pawshop.com',
    phone: '081-234-5678',
  },
];

// สร้าง JWT Token
export async function signJWT(payload: {
  id: string;
  username: string;
  name: string;
  role: Role;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);
}

// ตรวจสอบ JWT Token
export async function verifyJWT(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      username: payload.username as string,
      name: payload.name as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

// อ่าน session จาก cookie (server-side)
export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}

// ตรวจสอบสิทธิ์ตาม role
export function hasPermission(role: Role, path: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.some((p) => path === p || path.startsWith(p + '/'));
}

// ได้หน้าแรกหลัง login ตาม role
export function getDefaultPage(role: Role): string {
  switch (role) {
    case Role.CUSTOMER:
      return '/dashboard/portal';
    default:
      return '/dashboard';
  }
}
