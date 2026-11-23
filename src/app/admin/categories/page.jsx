import { query } from '@/lib/db';
import CategoriesClient from './CategoriesClient';

export default async function AdminCategoriesPage() {
  let categories = [];
  try {
    const res = await query(
      `SELECT c.id, c.name, c.created_at, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id
       ORDER BY c.id ASC`
    );
    categories = res.rows;
  } catch (err) {
    console.error('Error fetching categories:', err.message);
  }

  return <CategoriesClient categories={categories} />;
}
