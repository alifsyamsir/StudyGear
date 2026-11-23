'use server';

import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { isNonEmptyString } from '@/lib/validations';

/**
 * Helper to ensure current session is an approved seller
 */
async function requireApprovedSellerSession() {
  const session = await getSession();
  if (!session || session.role !== 'seller') {
    throw new Error('Akses ditolak. Anda harus login sebagai Penjual.');
  }

  // Re-verify latest status from database
  const userCheck = await query(
    'SELECT id, seller_status FROM users WHERE id = $1 AND role = $2',
    [session.id, 'seller']
  );

  if (userCheck.rows.length === 0 || userCheck.rows[0].seller_status !== 'approved') {
    throw new Error('Akun toko Anda belum disetujui oleh Administrator.');
  }

  return session;
}

/**
 * Update Seller Store Info (Store Name, Description, Store Image)
 */
export async function updateStoreInfo(formData) {
  try {
    const seller = await requireApprovedSellerSession();

    const storeName = (formData.get('store_name') || '').toString().trim();
    const description = (formData.get('description') || '').toString().trim();
    const storeImage = (formData.get('store_image') || '').toString().trim();

    if (!isNonEmptyString(storeName)) {
      return { error: 'Nama toko wajib diisi.' };
    }

    // Check if store exists; if not, create it
    const existing = await query('SELECT id FROM stores WHERE seller_id = $1', [seller.id]);

    if (existing.rows.length === 0) {
      await query(
        `INSERT INTO stores (seller_id, store_name, description, store_image)
         VALUES ($1, $2, $3, $4)`,
        [seller.id, storeName, description || null, storeImage || null]
      );
    } else {
      await query(
        `UPDATE stores
         SET store_name = $1, description = $2, store_image = $3
         WHERE seller_id = $4`,
        [storeName, description || null, storeImage || null, seller.id]
      );
    }

    revalidatePath('/seller/store');
    revalidatePath('/seller/products');
    revalidatePath('/');
    return { success: true, message: 'Informasi toko berhasil diperbarui.' };
  } catch (error) {
    console.error('updateStoreInfo error:', error);
    return { error: error.message || 'Gagal memperbarui informasi toko.' };
  }
}
