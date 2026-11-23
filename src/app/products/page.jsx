import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import ProductListClient from './ProductListClient';

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || '';
  const categoryId = resolvedSearchParams?.category || '';
  const sort = resolvedSearchParams?.sort || 'latest';

  const session = await getSession();
  const isBuyer = session?.role === 'buyer';

  let products = [];
  let categories = [];
  let wishlistIds = [];

  try {
    // 1. Fetch categories
    const catRes = await query('SELECT id, name FROM categories ORDER BY name ASC');
    categories = catRes.rows;

    // 2. Fetch buyer wishlist
    if (isBuyer) {
      const wishRes = await query('SELECT product_id FROM wishlists WHERE buyer_id = $1', [session.id]);
      wishlistIds = wishRes.rows.map((r) => r.product_id);
    }

    // 3. Build product query
    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(p.name) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`);
    }

    if (categoryId && categoryId !== 'all' && !isNaN(parseInt(categoryId, 10))) {
      params.push(parseInt(categoryId, 10));
      conditions.push(`p.category_id = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderClause = 'ORDER BY p.created_at DESC';
    if (sort === 'price_asc') {
      orderClause = 'ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      orderClause = 'ORDER BY p.price DESC';
    } else if (sort === 'oldest') {
      orderClause = 'ORDER BY p.created_at ASC';
    }

    const sql = `
      SELECT p.id, p.store_id, p.category_id, p.name, p.description,
             p.price, p.stock, p.image_url, p.created_at,
             s.store_name, c.name AS category_name,
             COALESCE(AVG(r.rating), 0)::NUMERIC(2,1) AS avg_rating,
             COUNT(r.id) AS review_count
      FROM products p
      JOIN stores s ON p.store_id = s.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      ${whereClause}
      GROUP BY p.id, s.store_name, c.name
      ${orderClause}
    `;

    const prodRes = await query(sql, params);
    products = prodRes.rows;
  } catch (err) {
    console.error('Error fetching products catalog:', err.message);
  }

  return (
    <ProductListClient
      products={products}
      categories={categories}
      currentSearch={search}
      currentCategory={categoryId}
      currentSort={sort}
      isBuyer={isBuyer}
      wishlistIds={wishlistIds}
    />
  );
}
