import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import ProductDetailsClient from './ProductDetailsClient';

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id, 10);

  if (isNaN(productId)) {
    notFound();
  }

  const session = await getSession();
  const isBuyer = session?.role === 'buyer';

  let product = null;
  let reviews = [];
  let isWishlisted = false;

  try {
    // 1. Fetch product details
    const prodRes = await query(
      `SELECT p.id, p.store_id, p.category_id, p.name, p.description,
              p.price, p.stock, p.image_url, p.created_at,
              s.store_name, c.name AS category_name,
              COALESCE(AVG(r.rating), 0)::NUMERIC(2,1) AS avg_rating
       FROM products p
       JOIN stores s ON p.store_id = s.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id
       WHERE p.id = $1
       GROUP BY p.id, s.store_name, c.name`,
      [productId]
    );

    if (prodRes.rows.length === 0) {
      notFound();
    }
    product = prodRes.rows[0];

    // 2. Fetch reviews
    const revRes = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS buyer_name
       FROM reviews r
       JOIN users u ON r.buyer_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );
    reviews = revRes.rows;

    // 3. Check wishlist if buyer
    if (isBuyer) {
      const wishRes = await query(
        'SELECT id FROM wishlists WHERE buyer_id = $1 AND product_id = $2',
        [session.id, productId]
      );
      isWishlisted = wishRes.rows.length > 0;
    }
  } catch (err) {
    console.error('Error fetching product detail:', err.message);
    notFound();
  }

  return (
    <ProductDetailsClient
      product={product}
      reviews={reviews}
      isBuyer={isBuyer}
      session={session}
      initialWishlisted={isWishlisted}
    />
  );
}
