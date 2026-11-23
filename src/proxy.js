import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'studygear_default_jwt_secret_key_2026_unhas_final';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = 'studygear_session';

async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

function getRoleHome(session) {
  if (!session) return '/';
  if (session.role === 'admin') return '/admin/verifications';
  if (session.role === 'seller') {
    return session.seller_status === 'approved' ? '/seller/products' : '/seller/pending';
  }
  return '/';
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // If user is logged in and visits auth pages (/login or /register)
  if (pathname === '/login' || pathname === '/register') {
    if (session) {
      return NextResponse.redirect(new URL(getRoleHome(session), request.url));
    }
    return NextResponse.next();
  }

  // Homepage: Admin and Seller should be automatically directed to their operational dashboards
  if (pathname === '/') {
    if (session && (session.role === 'admin' || session.role === 'seller')) {
      return NextResponse.redirect(new URL(getRoleHome(session), request.url));
    }
    return NextResponse.next();
  }

  // Product Catalog: Admin and Seller have dedicated management pages
  if (pathname === '/products') {
    if (session) {
      if (session.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/products', request.url));
      }
      if (session.role === 'seller') {
        return NextResponse.redirect(
          new URL(session.seller_status === 'approved' ? '/seller/products' : '/seller/pending', request.url)
        );
      }
    }
    return NextResponse.next();
  }

  // Admin routes protection: /admin/*
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== 'admin') {
      return NextResponse.redirect(new URL(getRoleHome(session), request.url));
    }
    return NextResponse.next();
  }

  // Seller routes protection: /seller/*
  if (pathname.startsWith('/seller')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== 'seller') {
      return NextResponse.redirect(new URL(getRoleHome(session), request.url));
    }

    // Special handling for /seller/pending
    if (pathname === '/seller/pending') {
      // If already approved seller visits /seller/pending, redirect to seller dashboard
      if (session.seller_status === 'approved') {
        return NextResponse.redirect(new URL('/seller/products', request.url));
      }
      // Pending or rejected sellers are allowed on /seller/pending
      return NextResponse.next();
    }

    // For any other /seller/* route (store, products, orders):
    // Only approved seller is allowed. Pending or rejected redirects to /seller/pending
    if (session.seller_status !== 'approved') {
      return NextResponse.redirect(new URL('/seller/pending', request.url));
    }

    return NextResponse.next();
  }

  // Buyer routes protection: /buyer/*
  if (pathname.startsWith('/buyer')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== 'buyer') {
      return NextResponse.redirect(new URL(getRoleHome(session), request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/products',
    '/admin/:path*',
    '/seller/:path*',
    '/buyer/:path*',
    '/login',
    '/register',
  ],
};
