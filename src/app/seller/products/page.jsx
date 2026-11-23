import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import SellerProductsClient from './SellerProductsClient';

export default async function SellerProductsPage() {
  const session = await getSession();

  if (!session || session.role !== 'seller') {
    redirect('/login?callbackUrl=/seller/products');
  }

  if (session.seller_status !== 'approved') {
    redirect('/seller/pending');
  }

  let products = [];
  let categories = [];
  let store = null;

  try {
    // 1. Fetch seller's store
    const storeRes = await query(
      'SELECT id, store_name, description, store_image FROM stores WHERE seller_id = $1',
      [session.id]
    );

    if (storeRes.rows.length === 0) {
      // Auto-create store if not found
      const createStore = await query(
        'INSERT INTO stores (seller_id, store_name, description) VALUES ($1, $2, $3) RETURNING *',
        [session.id, `Toko ${session.name}`, 'Toko resmi di StudyGear']
      );
      store = createStore.rows[0];
    } else {
      store = storeRes.rows[0];
    }

    // 2. Fetch products owned by this store only
    const prodRes = await query(
      `SELECT p.id, p.store_id, p.category_id, p.name, p.description,
              p.price, p.stock, p.image_url, p.created_at, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.store_id = $1
       ORDER BY p.created_at DESC`,
      [store.id]
    );
    products = prodRes.rows;

    // 3. Fetch categories for product form
    const catRes = await query('SELECT id, name FROM categories ORDER BY name ASC');
    categories = catRes.rows;
  } catch (err) {
    console.error('Error fetching seller products:', err.message);
  }

  return (
    <SellerProductsClient
      products={products}
      categories={categories}
      store={store}
    />
  );
}
