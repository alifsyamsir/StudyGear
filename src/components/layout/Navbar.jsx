import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const session = await getSession();

  // Sembunyikan Navbar untuk Admin dan Seller agar workspace bersih dan tidak ada redundansi navigasi
  if (session && (session.role === 'admin' || session.role === 'seller')) {
    return null;
  }

  let cartCount = 0;
  let wishlistCount = 0;

  if (session && session.role === 'buyer') {
    try {
      const cartResult = await query(
        'SELECT COALESCE(SUM(quantity), 0) AS total FROM carts WHERE buyer_id = $1',
        [session.id]
      );
      cartCount = parseInt(cartResult.rows[0]?.total || 0, 10);

      const wishlistResult = await query(
        'SELECT COUNT(*) AS total FROM wishlists WHERE buyer_id = $1',
        [session.id]
      );
      wishlistCount = parseInt(wishlistResult.rows[0]?.total || 0, 10);
    } catch (err) {
      console.error('Navbar counter fetch error:', err.message);
    }
  }

  return (
    <NavbarClient
      session={session}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
    />
  );
}
