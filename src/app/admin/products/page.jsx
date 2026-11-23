import { query } from '@/lib/db';
import AdminProductsClient from './AdminProductsClient';

export default async function AdminProductsPage() {
  let products = [];
  try {
    const res = await query(
      `SELECT p.id, p.name, p.price, p.stock, p.image_url, p.created_at,
              s.store_name, c.name AS category_name
       FROM products p
       JOIN stores s ON p.store_id = s.id
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC`
    );
    products = res.rows;
  } catch (err) {
    console.error('Error fetching admin products:', err.message);
  }

  return <AdminProductsClient products={products} />;
}
