'use server';

import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { isNonEmptyString, isValidInteger } from '@/lib/validations';

/**
 * 1. Update Order Status (Seller Only)
 * Status sequence: 'Menunggu Pembayaran' -> 'Diproses' -> 'Selesai'
 */
export async function updateOrderStatus(orderId, newStatus) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'seller') {
      return { error: 'Hanya penjual yang dapat mengubah status pesanan.' };
    }

    const validStatuses = ['Menunggu Pembayaran', 'Diproses', 'Selesai'];
    if (!validStatuses.includes(newStatus)) {
      return { error: 'Status pesanan tidak valid.' };
    }

    // Get seller's store ID
    const storeRes = await query('SELECT id FROM stores WHERE seller_id = $1', [session.id]);
    if (storeRes.rows.length === 0) {
      return { error: 'Toko penjual tidak ditemukan.' };
    }
    const storeId = storeRes.rows[0].id;

    // Strict ownership validation: update order WHERE id = $1 AND store_id = $2
    const updateRes = await query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2 AND store_id = $3
       RETURNING id, status`,
      [newStatus, orderId, storeId]
    );

    if (updateRes.rowCount === 0) {
      return { error: 'Pesanan tidak ditemukan atau bukan milik toko Anda.' };
    }

    revalidatePath('/seller/orders');
    revalidatePath('/buyer/orders');
    return {
      success: true,
      message: `Status pesanan berhasil diubah menjadi "${newStatus}".`,
    };
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return { error: error.message || 'Gagal memperbarui status pesanan.' };
  }
}

/**
 * 2. Submit Product Review & Rating (Buyer Only)
 * Must be for an order with status 'Selesai'
 */
export async function submitReview(formData) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'buyer') {
      return { error: 'Hanya pembeli yang dapat memberikan ulasan produk.' };
    }

    const productId = parseInt(formData.get('product_id'), 10);
    const orderId = parseInt(formData.get('order_id'), 10);
    const rating = parseInt(formData.get('rating'), 10);
    const comment = (formData.get('comment') || '').toString().trim();

    if (!isValidInteger(productId, 1) || !isValidInteger(orderId, 1)) {
      return { error: 'Parameter produk atau pesanan tidak valid.' };
    }

    if (!isValidInteger(rating, 1) || rating > 5) {
      return { error: 'Nilai rating harus berupa angka bintang antara 1 sampai 5.' };
    }

    if (!isNonEmptyString(comment)) {
      return { error: 'Komentar ulasan wajib diisi.' };
    }

    // Verify order exists, belongs to this buyer, contains this product, and status is 'Selesai'
    const orderCheck = await query(
      `SELECT o.id, o.status, oi.product_id
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1 AND o.buyer_id = $2 AND oi.product_id = $3`,
      [orderId, session.id, productId]
    );

    if (orderCheck.rows.length === 0) {
      return { error: 'Data pesanan produk ini tidak ditemukan pada riwayat akun Anda.' };
    }

    const order = orderCheck.rows[0];
    if (order.status !== 'Selesai') {
      return {
        error: `Ulasan hanya dapat diberikan setelah pesanan berstatus "Selesai". Status saat ini: "${order.status}".`,
      };
    }

    // Insert or update review (UNIQUE constraint on product_id, buyer_id, order_id)
    await query(
      `INSERT INTO reviews (product_id, buyer_id, order_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (product_id, buyer_id, order_id)
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = CURRENT_TIMESTAMP`,
      [productId, session.id, orderId, rating, comment]
    );

    revalidatePath('/buyer/orders');
    revalidatePath(`/products/${productId}`);
    revalidatePath('/products');
    revalidatePath('/');

    return {
      success: true,
      message: 'Terima kasih! Ulasan dan rating Anda berhasil disimpan.',
    };
  } catch (error) {
    console.error('submitReview error:', error);
    return { error: error.message || 'Gagal mengirimkan ulasan produk.' };
  }
}
