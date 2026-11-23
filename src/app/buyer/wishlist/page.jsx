import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import WishlistClient from './WishlistClient';

export default async function BuyerWishlistPage() {
  const session = await getSession();

  if (!session || session.role !== 'buyer') {
    redirect('/login?callbackUrl=/buyer/wishlist');
  }

  let wishlistItems = [];

  try {
    const res = await query(
      `SELECT w.id, w.product_id, p.name, p.price, p.stock, p.image_url, s.store_name
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       JOIN stores s ON p.store_id = s.id
       WHERE w.buyer_id = $1
       ORDER BY w.created_at DESC`,
      [session.id]
    );
    wishlistItems = res.rows;
  } catch (err) {
    console.error('Error fetching wishlist:', err.message);
  }

  return <WishlistClient wishlistItems={wishlistItems} />;
}
