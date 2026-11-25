import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  comparePassword,
  signToken,
  setSessionCookie,
  deleteSessionCookie,
  getSession,
} from '@/lib/auth';

/**
 * GET /api/auth
 * Returns the currently authenticated user session
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session });
}

/**
 * POST /api/auth
 * Login user and set HTTP-only session cookie
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT id, name, email, password, role, seller_status, is_active FROM users WHERE LOWER(email) = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email atau password yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email atau password yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    if (user.is_active === false) {
      return NextResponse.json(
        { error: 'Akun Anda telah dinonaktifkan oleh Administrator. Silakan hubungi dukungan pelanggan.' },
        { status: 403 }
      );
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      seller_status: user.seller_status,
    };

    const token = await signToken(tokenPayload);
    await setSessionCookie(token);

    let redirectUrl = '/';
    if (user.role === 'admin') {
      redirectUrl = '/admin/verifications';
    } else if (user.role === 'seller') {
      redirectUrl = user.seller_status === 'approved' ? '/seller/products' : '/seller/pending';
    } else if (user.role === 'buyer') {
      redirectUrl = '/';
    }

    return NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      redirectUrl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        seller_status: user.seller_status,
      },
    });
  } catch (error) {
    console.error('API auth POST error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat autentikasi.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth
 * Logout user by clearing HTTP-only session cookie
 */
export async function DELETE() {
  try {
    await deleteSessionCookie();
    return NextResponse.json({ success: true, message: 'Logout berhasil.' });
  } catch (error) {
    console.error('API auth DELETE error:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan logout.' },
      { status: 500 }
    );
  }
}
