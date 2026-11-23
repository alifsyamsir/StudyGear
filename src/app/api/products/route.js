import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/products
 * Fetch product catalog with search, category filter, sorting, and random limits
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('category');
    const sort = searchParams.get('sort');
    const isRandom = searchParams.get('random') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(p.name) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`);
    }

    if (categoryId && !isNaN(parseInt(categoryId, 10))) {
      params.push(parseInt(categoryId, 10));
      conditions.push(`p.category_id = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderClause = 'ORDER BY p.created_at DESC';
    if (isRandom) {
      orderClause = 'ORDER BY RANDOM()';
    } else if (sort === 'price_asc') {
      orderClause = 'ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      orderClause = 'ORDER BY p.price DESC';
    } else if (sort === 'oldest') {
      orderClause = 'ORDER BY p.created_at ASC';
    }

    params.push(limit);
    const limitClause = `LIMIT $${params.length}`;

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
      ${limitClause}
    `;

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      products: result.rows,
    });
  } catch (error) {
    console.error('API products error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil katalog produk.' },
      { status: 500 }
    );
  }
}
