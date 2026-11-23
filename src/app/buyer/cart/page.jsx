import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import CartClient from './CartClient';

export default async function BuyerCartPage() {
  const session = await getSession();

  if (!session || session.role !== 'buyer') {
    redirect('/login?callbackUrl=/buyer/cart');
  }

  let cartItems = [];
  let userAddress = '';

  try {
    // 1. Fetch user address
    const userRes = await query('SELECT address FROM users WHERE id = $1', [session.id]);
    if (userRes.rows.length > 0) {
      userAddress = userRes.rows[0].address || '';
    }

    // 2. Fetch cart items
    const cartRes = await query(
      `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.stock,
              p.image_url, p.store_id, s.store_name
       FROM carts c
       JOIN products p ON c.product_id = p.id
       JOIN stores s ON p.store_id = s.id
       WHERE c.buyer_id = $1
       ORDER BY c.created_at DESC`,
      [session.id]
    );
    cartItems = cartRes.rows;
  } catch (err) {
    console.error('Error fetching cart:', err.message);
  }

  return <CartClient cartItems={cartItems} userAddress={userAddress} />;
}
