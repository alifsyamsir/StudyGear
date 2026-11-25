'use server';

import { query } from '@/lib/db';
import {
  hashPassword,
  comparePassword,
  signToken,
  setSessionCookie,
  deleteSessionCookie,
  getSession,
} from '@/lib/auth';
import { redirect } from 'next/navigation';
import path from 'path';
import fs from 'fs/promises';

/**
 * Server Action for User Login
 */
export async function loginUser(formData) {
  const email = (formData.get('email') || '').toString().trim().toLowerCase();
  const password = (formData.get('password') || '').toString();

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' };
  }

  try {
    const result = await query(
      'SELECT id, name, email, password, role, seller_status, is_active FROM users WHERE LOWER(email) = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return { error: 'Email atau password yang Anda masukkan salah.' };
    }

    const user = result.rows[0];
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return { error: 'Email atau password yang Anda masukkan salah.' };
    }

    if (user.is_active === false) {
      return {
        error: 'Akun Anda telah dinonaktifkan oleh Administrator. Silakan hubungi dukungan pelanggan.',
      };
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      seller_status: user.seller_status,
      is_active: user.is_active,
    };

    const token = await signToken(tokenPayload);
    await setSessionCookie(token);

    // Determine redirect URL
    let redirectUrl = '/';
    if (user.role === 'admin') {
      redirectUrl = '/admin';
    } else if (user.role === 'seller') {
      redirectUrl = user.seller_status === 'approved' ? '/seller/products' : '/seller/pending';
    } else if (user.role === 'buyer') {
      redirectUrl = '/';
    }

    return {
      success: true,
      redirectUrl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        seller_status: user.seller_status,
      },
    };
  } catch (error) {
    console.error('Login action error:', error);
    return { error: 'Terjadi kesalahan sistem saat proses login. Coba lagi nanti.' };
  }
}

/**
 * Server Action for User Registration (Buyer or Seller)
 */
export async function registerUser(formData) {
  const name = (formData.get('name') || '').toString().trim();
  const email = (formData.get('email') || '').toString().trim().toLowerCase();
  const password = (formData.get('password') || '').toString();
  const confirmPassword = (formData.get('confirmPassword') || '').toString();
  const role = (formData.get('role') || 'buyer').toString().trim().toLowerCase();
  const storeName = (formData.get('storeName') || '').toString().trim();

  // Validations
  if (!name || !email || !password) {
    return { error: 'Semua field wajib diisi.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Format email tidak valid.' };
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Konfirmasi password tidak cocok.' };
  }

  if (!['buyer', 'seller'].includes(role)) {
    return { error: 'Pilihan peran tidak valid.' };
  }

  try {
    // Check if email already registered
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
    if (existing.rows.length > 0) {
      return { error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' };
    }

    const hashedPassword = await hashPassword(password);

    if (role === 'seller') {
      const sellerStatus = 'pending';
      const insertUser = await query(
        `INSERT INTO users (name, email, password, role, seller_status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, role, seller_status`,
        [name, email, hashedPassword, role, sellerStatus]
      );
      const newUser = insertUser.rows[0];

      // Handle seller verification document upload (Images or PDF - Wajib)
      const documentFile = formData.get('document');
      if (!documentFile || typeof documentFile === 'string' || documentFile.size === 0) {
        return { error: 'Dokumen bukti verifikasi toko wajib diunggah untuk pendaftaran penjual.' };
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(documentFile.type)) {
        return { error: 'Format dokumen tidak didukung. Harap unggah foto (JPG, PNG) atau file PDF.' };
      }
      if (documentFile.size > 5 * 1024 * 1024) {
        return { error: 'Ukuran file dokumen bukti maksimal 5MB.' };
      }

      const bytes = await documentFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      const cleanFileName = documentFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${cleanFileName}`;
      const filePath = path.join(uploadsDir, uniqueFileName);
      await fs.writeFile(filePath, buffer);
      const documentUrl = `/uploads/${uniqueFileName}`;

      // Insert initial store information if provided
      const finalStoreName = storeName || `Toko ${name}`;
      await query(
        `INSERT INTO stores (seller_id, store_name, description, document_url)
         VALUES ($1, $2, $3, $4)`,
        [newUser.id, finalStoreName, 'Toko resmi stationery & perlengkapan belajar di StudyGear', documentUrl]
      );

      // Sign token & set session cookie
      const token = await signToken({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        seller_status: newUser.seller_status,
      });
      await setSessionCookie(token);

      return {
        success: true,
        redirectUrl: '/seller/pending',
        message: 'Registrasi penjual berhasil. Akun Anda sedang ditinjau oleh Admin.',
      };
    } else {
      // Buyer registration
      const insertUser = await query(
        `INSERT INTO users (name, email, password, role, seller_status)
         VALUES ($1, $2, $3, $4, NULL)
         RETURNING id, name, email, role, seller_status`,
        [name, email, hashedPassword, role]
      );
      const newUser = insertUser.rows[0];

      const token = await signToken({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        seller_status: null,
      });
      await setSessionCookie(token);

      return {
        success: true,
        redirectUrl: '/',
        message: 'Registrasi berhasil! Selamat berbelanja di StudyGear.',
      };
    }
  } catch (error) {
    console.error('Registration action error:', error);
    return { error: 'Gagal melakukan pendaftaran. Silakan coba beberapa saat lagi.' };
  }
}

/**
 * Server Action for Logout
 */
export async function logoutUser() {
  await deleteSessionCookie();
  redirect('/');
}

/**
 * Server Action to Delete Rejected Seller Account
 */
export async function deleteRejectedSeller() {
  const session = await getSession();

  if (!session) {
    return { error: 'Sesi Anda tidak valid atau telah berakhir.' };
  }

  if (session.role !== 'seller') {
    return { error: 'Hanya akun penjual yang dapat melakukan tindakan ini.' };
  }

  try {
    // Re-verify current status in database
    const checkRes = await query(
      'SELECT id, seller_status FROM users WHERE id = $1 AND role = $2',
      [session.id, 'seller']
    );

    if (checkRes.rows.length === 0) {
      await deleteSessionCookie();
      redirect('/login');
    }

    const currentStatus = checkRes.rows[0].seller_status;
    if (currentStatus !== 'rejected') {
      return { error: 'Akun hanya dapat dihapus jika status peninjauan ditolak (rejected).' };
    }

    // Delete user from database (cascades to stores, etc.)
    await query(
      'DELETE FROM users WHERE id = $1 AND role = $2 AND seller_status = $3',
      [session.id, 'seller', 'rejected']
    );

    await deleteSessionCookie();
  } catch (error) {
    console.error('Delete rejected seller error:', error);
    return { error: 'Gagal menghapus akun: ' + error.message };
  }

  redirect('/register');
}
