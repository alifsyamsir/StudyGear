'use server';

import { query } from '@/lib/db';
import { getSession, signToken, setSessionCookie, comparePassword, hashPassword } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { isNonEmptyString, isValidEmail } from '@/lib/validations';

/**
 * Helper to ensure current session is an admin
 */
async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Akses ditolak. Anda harus login sebagai Admin.');
  }
  return session;
}

/**
 * 1. Verify Seller (Approve or Reject)
 */
export async function verifySeller(sellerId, decision) {
  try {
    await requireAdminSession();

    if (!['approved', 'rejected'].includes(decision)) {
      return { error: 'Keputusan verifikasi tidak valid.' };
    }

    const sellerCheck = await query(
      'SELECT id, name, role, seller_status FROM users WHERE id = $1 AND role = $2',
      [sellerId, 'seller']
    );

    if (sellerCheck.rows.length === 0) {
      return { error: 'Penjual tidak ditemukan.' };
    }

    const seller = sellerCheck.rows[0];

    // Update seller status
    await query(
      'UPDATE users SET seller_status = $1 WHERE id = $2 AND role = $3',
      [decision, sellerId, 'seller']
    );

    // If approved, ensure a store record exists for this seller
    if (decision === 'approved') {
      const storeCheck = await query('SELECT id FROM stores WHERE seller_id = $1', [sellerId]);
      if (storeCheck.rows.length === 0) {
        await query(
          'INSERT INTO stores (seller_id, store_name, description) VALUES ($1, $2, $3)',
          [sellerId, `Toko ${seller.name}`, 'Toko resmi stationery di StudyGear']
        );
      }
    }

    revalidatePath('/admin/verifications');
    revalidatePath('/admin/users');
    return {
      success: true,
      message: `Penjual berhasil di-${decision === 'approved' ? 'setujui' : 'tolak'}.`,
    };
  } catch (error) {
    console.error('verifySeller error:', error);
    return { error: error.message || 'Gagal memproses verifikasi penjual.' };
  }
}

/**
 * 2. Update Admin Profile (Name & Email)
 */
export async function updateAdminProfile(formData) {
  try {
    const admin = await requireAdminSession();

    const name = (formData.get('name') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim().toLowerCase();

    if (!isNonEmptyString(name)) {
      return { error: 'Nama pengguna tidak boleh kosong.' };
    }

    if (!isValidEmail(email)) {
      return { error: 'Format email tidak valid.' };
    }

    // Check duplicate email for another user
    const duplicate = await query(
      'SELECT id FROM users WHERE LOWER(email) = $1 AND id <> $2',
      [email, admin.id]
    );
    if (duplicate.rows.length > 0) {
      return { error: 'Email tersebut sudah digunakan oleh akun lain.' };
    }

    await query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3',
      [name, email, admin.id]
    );

    // Refresh JWT session cookie with updated payload
    const updatedPayload = {
      id: admin.id,
      name,
      email,
      role: admin.role,
      seller_status: admin.seller_status || null,
    };
    const newToken = await signToken(updatedPayload);
    await setSessionCookie(newToken);

    revalidatePath('/admin');
    revalidatePath('/admin/profile');
    revalidatePath('/admin/users');
    return { success: true, message: 'Profil Admin berhasil diperbarui.' };
  } catch (error) {
    console.error('updateAdminProfile error:', error);
    return { error: error.message || 'Gagal memperbarui profil admin.' };
  }
}

/**
 * 3. Update Admin Password
 */
export async function updateAdminPassword(formData) {
  try {
    const admin = await requireAdminSession();

    const currentPassword = (formData.get('currentPassword') || '').toString();
    const newPassword = (formData.get('newPassword') || '').toString();
    const confirmPassword = (formData.get('confirmPassword') || '').toString();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: 'Semua kolom kata sandi wajib diisi.' };
    }

    if (newPassword.length < 6) {
      return { error: 'Kata sandi baru minimal 6 karakter.' };
    }

    if (newPassword !== confirmPassword) {
      return { error: 'Konfirmasi kata sandi baru tidak cocok.' };
    }

    const userRes = await query('SELECT password FROM users WHERE id = $1', [admin.id]);
    if (userRes.rows.length === 0) {
      return { error: 'Akun admin tidak ditemukan.' };
    }

    const isValid = await comparePassword(currentPassword, userRes.rows[0].password);
    if (!isValid) {
      return { error: 'Kata sandi saat ini tidak tepat.' };
    }

    const hashedPassword = await hashPassword(newPassword);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, admin.id]);

    revalidatePath('/admin/profile');
    return { success: true, message: 'Kata sandi Admin berhasil diperbarui.' };
  } catch (error) {
    console.error('updateAdminPassword error:', error);
    return { error: error.message || 'Gagal mengubah kata sandi admin.' };
  }
}

/**
 * 4. Toggle User Active Status (Admin)
 * Rule: Admin cannot deactivate their own account
 */
export async function toggleUserStatus(targetUserId) {
  try {
    const admin = await requireAdminSession();

    if (Number(targetUserId) === Number(admin.id)) {
      return { error: 'Dilarang keras: Anda tidak dapat menonaktifkan akun admin Anda sendiri!' };
    }

    const res = await query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 AND id <> $2 RETURNING id, name, is_active',
      [targetUserId, admin.id]
    );

    if (res.rowCount === 0) {
      return { error: 'Pengguna tidak ditemukan atau status tidak dapat diubah.' };
    }

    const updatedUser = res.rows[0];
    const statusText = updatedUser.is_active ? 'diaktifkan kembali' : 'dinonaktifkan';

    revalidatePath('/admin/users');
    return {
      success: true,
      message: `Akun "${updatedUser.name}" berhasil ${statusText}.`,
      isActive: updatedUser.is_active,
    };
  } catch (error) {
    console.error('toggleUserStatus error:', error);
    return { error: error.message || 'Gagal mengubah status pengguna.' };
  }
}

/**
 * 4. Create Category (Admin)
 */
export async function createCategory(formData) {
  try {
    await requireAdminSession();

    const name = (formData.get('name') || '').toString().trim();
    if (!isNonEmptyString(name)) {
      return { error: 'Nama kategori wajib diisi.' };
    }

    const dupCheck = await query(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    if (dupCheck.rows.length > 0) {
      return { error: 'Kategori dengan nama tersebut sudah ada.' };
    }

    await query('INSERT INTO categories (name) VALUES ($1)', [name]);

    revalidatePath('/admin/categories');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, message: 'Kategori baru berhasil ditambahkan.' };
  } catch (error) {
    console.error('createCategory error:', error);
    return { error: error.message || 'Gagal menambahkan kategori.' };
  }
}

/**
 * 5. Update Category (Admin)
 */
export async function updateCategory(categoryId, formData) {
  try {
    await requireAdminSession();

    const name = (formData.get('name') || '').toString().trim();
    if (!isNonEmptyString(name)) {
      return { error: 'Nama kategori wajib diisi.' };
    }

    const dupCheck = await query(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id <> $2',
      [name, categoryId]
    );
    if (dupCheck.rows.length > 0) {
      return { error: 'Kategori dengan nama tersebut sudah ada.' };
    }

    await query('UPDATE categories SET name = $1 WHERE id = $2', [name, categoryId]);

    revalidatePath('/admin/categories');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, message: 'Kategori berhasil diperbarui.' };
  } catch (error) {
    console.error('updateCategory error:', error);
    return { error: error.message || 'Gagal memperbarui kategori.' };
  }
}

/**
 * 6. Delete Category (Admin)
 */
export async function deleteCategory(categoryId) {
  try {
    await requireAdminSession();

    await query('DELETE FROM categories WHERE id = $1', [categoryId]);

    revalidatePath('/admin/categories');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, message: 'Kategori berhasil dihapus.' };
  } catch (error) {
    console.error('deleteCategory error:', error);
    return { error: error.message || 'Gagal menghapus kategori.' };
  }
}

/**
 * 7. Delete Product (Admin Moderation)
 */
export async function deleteProductAdmin(productId) {
  try {
    await requireAdminSession();

    const res = await query('DELETE FROM products WHERE id = $1', [productId]);
    if (res.rowCount === 0) {
      return { error: 'Produk tidak ditemukan.' };
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, message: 'Produk berhasil dihapus oleh Admin.' };
  } catch (error) {
    console.error('deleteProductAdmin error:', error);
    return { error: error.message || 'Gagal menghapus produk.' };
  }
}
