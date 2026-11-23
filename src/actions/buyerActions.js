'use server';

import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { isNonEmptyString } from '@/lib/validations';

/**
 * Update Buyer Profile & Shipping Address
 */
export async function updateBuyerProfile(formData) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'buyer') {
      return { error: 'Akses khusus Pembeli.' };
    }

    const name = (formData.get('name') || '').toString().trim();
    const address = (formData.get('address') || '').toString().trim();

    if (!isNonEmptyString(name)) {
      return { error: 'Nama lengkap tidak boleh kosong.' };
    }

    await query(
      `UPDATE users
       SET name = $1, address = $2
       WHERE id = $3 AND role = 'buyer'`,
      [name, address || null, session.id]
    );

    revalidatePath('/buyer/profile');
    revalidatePath('/buyer/cart');
    return { success: true, message: 'Profil dan alamat pengiriman berhasil diperbarui.' };
  } catch (error) {
    console.error('updateBuyerProfile error:', error);
    return { error: error.message || 'Gagal memperbarui profil pembeli.' };
  }
}
