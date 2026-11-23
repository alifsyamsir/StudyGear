'use server';

import pool, { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { isNonEmptyString, isValidInteger } from '@/lib/validations';

/**
 * Require logged in Buyer session
 */
async function requireBuyerSession() {
  const session = await getSession();
  if (!session || session.role !== 'buyer') {
    throw new Error('Akses khusus Pembeli. Silakan masuk terlebih dahulu.');
  }
  return session;
}

/**
 * Add product to cart (or increment quantity if already in cart)
 */
export async function addToCart(productId, qty = 1) {
  try {
    const session = await getSession();
    if (!session) {
      return {
        error: 'Harap masuk ke akun pembeli untuk menambahkan produk ke keranjang.',
        requireLogin: true,
      };
    }

    if (session.role !== 'buyer') {
      return {
        error: 'Hanya akun Pembeli (Buyer) yang dapat menambahkan barang ke keranjang.',
      };
    }

    const quantityToAdd = parseInt(qty, 10);
    if (!isValidInteger(quantityToAdd, 1)) {
      return { error: 'Jumlah produk harus berupa bilangan bulat minimal 1.' };
    }

    // Check product existence & stock
    const prodCheck = await query('SELECT id, name, stock FROM products WHERE id = $1', [productId]);
    if (prodCheck.rows.length === 0) {
      return { error: 'Produk tidak ditemukan.' };
    }

    const product = prodCheck.rows[0];
    if (product.stock <= 0) {
      return { error: `Maaf, stok produk "${product.name}" saat ini sedang habis.` };
    }

    // Check existing item in cart
    const existingCart = await query(
      'SELECT id, quantity FROM carts WHERE buyer_id = $1 AND product_id = $2',
      [session.id, productId]
    );

    const currentQtyInCart = existingCart.rows.length > 0 ? existingCart.rows[0].quantity : 0;
    const finalQty = currentQtyInCart + quantityToAdd;

    if (finalQty > product.stock) {
      return {
        error: `Jumlah melebihi stok yang tersedia. Anda sudah memiliki ${currentQtyInCart} di keranjang, dan sisa stok adalah ${product.stock}.`,
      };
    }

    // Insert or update cart
    await query(
      `INSERT INTO carts (buyer_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (buyer_id, product_id)
       DO UPDATE SET quantity = carts.quantity + EXCLUDED.quantity`,
      [session.id, productId, quantityToAdd]
    );

    revalidatePath('/buyer/cart');
    revalidatePath('/');
    revalidatePath('/products');
    return {
      success: true,
      message: `"${product.name}" berhasil ditambahkan ke keranjang belanja!`,
    };
  } catch (error) {
    console.error('addToCart error:', error);
    return { error: error.message || 'Gagal menambahkan produk ke keranjang.' };
  }
}

/**
 * Update quantity of a cart item
 */
export async function updateCartQty(cartId, newQty) {
  try {
    const session = await requireBuyerSession();
    const qty = parseInt(newQty, 10);

    if (qty <= 0) {
      return await removeFromCart(cartId);
    }

    // Check item ownership and current stock
    const itemRes = await query(
      `SELECT c.id, c.quantity, p.stock, p.name
       FROM carts c
       JOIN products p ON c.product_id = p.id
       WHERE c.id = $1 AND c.buyer_id = $2`,
      [cartId, session.id]
    );

    if (itemRes.rows.length === 0) {
      return { error: 'Item keranjang tidak ditemukan.' };
    }

    const item = itemRes.rows[0];
    if (qty > item.stock) {
      return { error: `Maksimal pembelian untuk "${item.name}" adalah ${item.stock} item.` };
    }

    await query('UPDATE carts SET quantity = $1 WHERE id = $2 AND buyer_id = $3', [
      qty,
      cartId,
      session.id,
    ]);

    revalidatePath('/buyer/cart');
    return { success: true };
  } catch (error) {
    console.error('updateCartQty error:', error);
    return { error: error.message || 'Gagal memperbarui kuantitas.' };
  }
}

/**
 * Remove an item from cart
 */
export async function removeFromCart(cartId) {
  try {
    const session = await requireBuyerSession();

    await query('DELETE FROM carts WHERE id = $1 AND buyer_id = $2', [cartId, session.id]);

    revalidatePath('/buyer/cart');
    return { success: true, message: 'Item berhasil dihapus dari keranjang.' };
  } catch (error) {
    console.error('removeFromCart error:', error);
    return { error: error.message || 'Gagal menghapus item dari keranjang.' };
  }
}

/**
 * Checkout Cart: Atomically creates orders per store, reduces stock, and clears cart
 */
export async function checkoutCart(shippingAddress) {
  let client;
  try {
    const session = await requireBuyerSession();

    if (!isNonEmptyString(shippingAddress)) {
      return { error: 'Alamat pengiriman wajib diisi dengan lengkap.' };
    }

    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Fetch all cart items for buyer with row locks on products
    const cartRes = await client.query(
      `SELECT c.id AS cart_id, c.quantity, p.id AS product_id, p.name AS product_name,
              p.price, p.stock, p.store_id
       FROM carts c
       JOIN products p ON c.product_id = p.id
       WHERE c.buyer_id = $1
       FOR UPDATE OF p`,
      [session.id]
    );

    if (cartRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return { error: 'Keranjang belanja Anda masih kosong.' };
    }

    const cartItems = cartRes.rows;

    // 2. Validate stock for each item
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return {
          error: `Stok produk "${item.product_name}" tidak mencukupi (Tersisa: ${item.stock}, diminta: ${item.quantity}). Silakan kurangi jumlah di keranjang.`,
        };
      }
    }

    // 3. Multi-Store Grouping: Group items by store_id
    const storeGroups = new Map();
    for (const item of cartItems) {
      if (!storeGroups.has(item.store_id)) {
        storeGroups.set(item.store_id, []);
      }
      storeGroups.get(item.store_id).push(item);
    }

    // 4. Create Order & Order Items per store
    const createdOrderIds = [];
    for (const [storeId, items] of storeGroups.entries()) {
      const storeTotal = items.reduce(
        (sum, it) => sum + Number(it.price) * it.quantity,
        0
      );

      // Insert Order Header
      const orderInsert = await client.query(
        `INSERT INTO orders (buyer_id, store_id, total_price, shipping_address, status)
         VALUES ($1, $2, $3, $4, 'Menunggu Pembayaran')
         RETURNING id`,
        [session.id, storeId, storeTotal, shippingAddress]
      );
      const orderId = orderInsert.rows[0].id;
      createdOrderIds.push(orderId);

      // Insert Order Items and reduce product stock
      for (const it of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
           VALUES ($1, $2, $3, $4)`,
          [orderId, it.product_id, it.quantity, it.price]
        );

        await client.query(
          `UPDATE products SET stock = stock - $1 WHERE id = $2`,
          [it.quantity, it.product_id]
        );
      }
    }

    // 5. Clear buyer's cart
    await client.query('DELETE FROM carts WHERE buyer_id = $1', [session.id]);

    // 6. Save address to buyer profile if not already set
    await client.query(
      `UPDATE users
       SET address = $1
       WHERE id = $2 AND (address IS NULL OR address = '')`,
      [shippingAddress, session.id]
    );

    // Commit Transaction
    await client.query('COMMIT');

    revalidatePath('/buyer/cart');
    revalidatePath('/buyer/orders');
    revalidatePath('/seller/orders');
    revalidatePath('/products');
    revalidatePath('/');

    return {
      success: true,
      message: `Pesanan berhasil dibuat (${createdOrderIds.length} transaksi toko)! Segera selesaikan pembayaran.`,
      orderIds: createdOrderIds,
    };
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rbErr) {
        console.error('Rollback error:', rbErr);
      }
    }
    console.error('checkoutCart error:', error);
    return { error: error.message || 'Terjadi kesalahan sistem saat proses checkout.' };
  } finally {
    if (client) client.release();
  }
}

/**
 * Toggle Wishlist (Add or Remove)
 */
export async function toggleWishlist(productId) {
  try {
    const session = await getSession();
    if (!session) {
      return {
        error: 'Harap masuk ke akun pembeli untuk menyimpan ke Wishlist.',
        requireLogin: true,
      };
    }

    if (session.role !== 'buyer') {
      return { error: 'Hanya akun Pembeli yang dapat menggunakan fitur Wishlist.' };
    }

    const check = await query(
      'SELECT id FROM wishlists WHERE buyer_id = $1 AND product_id = $2',
      [session.id, productId]
    );

    if (check.rows.length > 0) {
      await query('DELETE FROM wishlists WHERE buyer_id = $1 AND product_id = $2', [
        session.id,
        productId,
      ]);
      revalidatePath('/buyer/wishlist');
      revalidatePath(`/products/${productId}`);
      revalidatePath('/products');
      revalidatePath('/');
      return {
        success: true,
        action: 'removed',
        message: 'Produk berhasil dihapus dari Wishlist.',
      };
    } else {
      await query('INSERT INTO wishlists (buyer_id, product_id) VALUES ($1, $2)', [
        session.id,
        productId,
      ]);
      revalidatePath('/buyer/wishlist');
      revalidatePath(`/products/${productId}`);
      revalidatePath('/products');
      revalidatePath('/');
      return {
        success: true,
        action: 'added',
        message: 'Produk berhasil ditambahkan ke Wishlist!',
      };
    }
  } catch (error) {
    console.error('toggleWishlist error:', error);
    return { error: error.message || 'Gagal mengubah status Wishlist.' };
  }
}

/**
 * Move item from Wishlist to Cart
 */
export async function moveToCart(productId) {
  try {
    const session = await requireBuyerSession();

    // 1. Add to cart
    const addRes = await addToCart(productId, 1);
    if (addRes?.error) {
      return addRes;
    }

    // 2. Remove from wishlist
    await query('DELETE FROM wishlists WHERE buyer_id = $1 AND product_id = $2', [
      session.id,
      productId,
    ]);

    revalidatePath('/buyer/wishlist');
    revalidatePath('/buyer/cart');
    return { success: true, message: 'Produk berhasil dipindahkan ke keranjang belanja!' };
  } catch (error) {
    console.error('moveToCart error:', error);
    return { error: error.message || 'Gagal memindahkan ke keranjang.' };
  }
}

/**
 * Remove an item from Wishlist
 */
export async function removeFromWishlist(productId) {
  try {
    const session = await requireBuyerSession();

    await query('DELETE FROM wishlists WHERE buyer_id = $1 AND product_id = $2', [
      session.id,
      productId,
    ]);

    revalidatePath('/buyer/wishlist');
    return { success: true, message: 'Produk berhasil dihapus dari Wishlist.' };
  } catch (error) {
    console.error('removeFromWishlist error:', error);
    return { error: error.message || 'Gagal menghapus dari wishlist.' };
  }
}
