'use server';

import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { isNonEmptyString, isValidNumber, isValidInteger } from '@/lib/validations';

/**
 * Helper to ensure current session is an approved seller and fetch their store ID
 */
async function requireSellerStore() {
  const session = await getSession();
  if (!session || session.role !== 'seller') {
    throw new Error('Akses ditolak. Anda harus login sebagai Penjual.');
  }

  const userCheck = await query(
    'SELECT id, seller_status FROM users WHERE id = $1 AND role = $2',
    [session.id, 'seller']
  );

  if (userCheck.rows.length === 0 || userCheck.rows[0].seller_status !== 'approved') {
    throw new Error('Akun toko Anda belum disetujui atau tidak aktif.');
  }

  // Get store_id
  let storeRes = await query('SELECT id, store_name FROM stores WHERE seller_id = $1', [session.id]);
  if (storeRes.rows.length === 0) {
    // If not found, auto-create one
    const createRes = await query(
      'INSERT INTO stores (seller_id, store_name, description) VALUES ($1, $2, $3) RETURNING id, store_name',
      [session.id, `Toko ${session.name}`, 'Toko resmi di StudyGear']
    );
    return createRes.rows[0];
  }

  return storeRes.rows[0];
}

/**
 * Create Product (Seller)
 */
export async function createProduct(formData) {
  try {
    const store = await requireSellerStore();

    const name = (formData.get('name') || '').toString().trim();
    const description = (formData.get('description') || '').toString().trim();
    const priceStr = formData.get('price');
    const stockStr = formData.get('stock');
    const categoryIdStr = formData.get('category_id');
    const imageUrl = (formData.get('image_url') || '').toString().trim();

    if (!isNonEmptyString(name)) {
      return { error: 'Nama produk wajib diisi.' };
    }

    if (!isNonEmptyString(description)) {
      return { error: 'Deskripsi produk wajib diisi.' };
    }

    if (!isValidNumber(priceStr, 0)) {
      return { error: 'Harga produk harus berupa angka valid dan minimal 0.' };
    }

    if (!isValidInteger(stockStr, 0)) {
      return { error: 'Jumlah stok harus berupa bilangan bulat minimal 0.' };
    }

    if (!isNonEmptyString(imageUrl)) {
      return { error: 'Foto/Gambar produk wajib diunggah.' };
    }

    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr, 10);
    const categoryId = categoryIdStr && categoryIdStr !== '' ? parseInt(categoryIdStr, 10) : null;

    const insertRes = await query(
      `INSERT INTO products (store_id, category_id, name, description, price, stock, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [store.id, categoryId, name, description, price, stock, imageUrl]
    );

    revalidatePath('/seller/products');
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, message: 'Produk berhasil ditambahkan ke katalog toko Anda.', productId: insertRes.rows[0].id };
  } catch (error) {
    console.error('createProduct error:', error);
    return { error: error.message || 'Gagal menambahkan produk.' };
  }
}

/**
 * Update Product (Seller with Ownership Check)
 */
export async function updateProduct(productId, formData) {
  try {
    const store = await requireSellerStore();

    const name = (formData.get('name') || '').toString().trim();
    const description = (formData.get('description') || '').toString().trim();
    const priceStr = formData.get('price');
    const stockStr = formData.get('stock');
    const categoryIdStr = formData.get('category_id');
    const imageUrl = (formData.get('image_url') || '').toString().trim();

    if (!isNonEmptyString(name)) {
      return { error: 'Nama produk wajib diisi.' };
    }

    if (!isNonEmptyString(description)) {
      return { error: 'Deskripsi produk wajib diisi.' };
    }

    if (!isValidNumber(priceStr, 0)) {
      return { error: 'Harga produk harus berupa angka valid dan minimal 0.' };
    }

    if (!isValidInteger(stockStr, 0)) {
      return { error: 'Jumlah stok harus berupa bilangan bulat minimal 0.' };
    }

    if (!isNonEmptyString(imageUrl)) {
      return { error: 'Foto/Gambar produk wajib diunggah.' };
    }

    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr, 10);
    const categoryId = categoryIdStr && categoryIdStr !== '' ? parseInt(categoryIdStr, 10) : null;

    // Strict ownership validation: WHERE id = $1 AND store_id = $2
    const updateRes = await query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, stock = $4, category_id = $5, image_url = $6
       WHERE id = $7 AND store_id = $8
       RETURNING id`,
      [name, description, price, stock, categoryId, imageUrl, productId, store.id]
    );

    if (updateRes.rowCount === 0) {
      return { error: 'Akses ditolak atau produk tidak ditemukan di toko Anda.' };
    }

    revalidatePath('/seller/products');
    revalidatePath(`/products/${productId}`);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, message: 'Produk berhasil diperbarui.' };
  } catch (error) {
    console.error('updateProduct error:', error);
    return { error: error.message || 'Gagal memperbarui produk.' };
  }
}

/**
 * Delete Product (Seller with Ownership Check)
 */
export async function deleteProduct(productId) {
  try {
    const store = await requireSellerStore();

    // Strict ownership validation: WHERE id = $1 AND store_id = $2
    const deleteRes = await query(
      'DELETE FROM products WHERE id = $1 AND store_id = $2',
      [productId, store.id]
    );

    if (deleteRes.rowCount === 0) {
      return { error: 'Akses ditolak atau produk tidak ditemukan di toko Anda.' };
    }

    revalidatePath('/seller/products');
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true, message: 'Produk berhasil dihapus dari toko Anda.' };
  } catch (error) {
    console.error('deleteProduct error:', error);
    return { error: error.message || 'Gagal menghapus produk.' };
  }
}
