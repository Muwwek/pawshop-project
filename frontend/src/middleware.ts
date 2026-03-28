import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pawshop-secret-key-2024-very-secure'
);

const COOKIE_NAME = 'pawshop-token';

// Route permissions mapping
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/dashboard/reports': ['OWNER'],
  '/dashboard/settings': ['OWNER'],
  '/dashboard/customers': ['OWNER', 'STAFF'],
  '/dashboard/payments': ['OWNER', 'STAFF'],
  '/dashboard/contracts': ['OWNER', 'STAFF'],
  '/dashboard/portal': ['CUSTOMER'],
  '/dashboard': ['OWNER', 'STAFF'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ข้ามหน้า login และ API routes
  if (pathname === '/login' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // ตรวจสอบ token
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    // ถ้าไม่มี token และไม่ใช่หน้าแรก ให้ไปหน้า login
    if (pathname !== '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // ถ้าไม่มี token และเป็นหน้าแรก ให้แสดงหน้าแรก (Landing Page)
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // ถ้าเข้าหน้าแรก ให้โชว์หน้าแรกเสมอ (Landing Page)
    if (pathname === '/') {
      return NextResponse.next();
    }

    // ตรวจสอบสิทธิ์
    if (pathname.startsWith('/dashboard')) {
      // CUSTOMER ต้องไปที่ portal เท่านั้น
      if (role === 'CUSTOMER' && !pathname.startsWith('/dashboard/portal')) {
        return NextResponse.redirect(new URL('/dashboard/portal', request.url));
      }

      // ตรวจสอบ route permissions
      const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
        .sort((a, b) => b.length - a.length) // เรียงจากยาวไปสั้น
        .find((route) => pathname.startsWith(route));

      if (matchedRoute) {
        const allowedRoles = ROUTE_PERMISSIONS[matchedRoute];
        if (!allowedRoles.includes(role)) {
          if (role === 'CUSTOMER') {
            return NextResponse.redirect(new URL('/dashboard/portal', request.url));
          }
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }

    return NextResponse.next();
  } catch {
    // Token ไม่ถูกต้อง
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
