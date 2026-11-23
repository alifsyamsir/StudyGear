import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import StoreClient from './StoreClient';

export default async function SellerStorePage() {
  const session = await getSession();

  if (!session || session.role !== 'seller') {
    redirect('/login?callbackUrl=/seller/store');
  }

  if (session.seller_status !== 'approved') {
    redirect('/seller/pending');
  }

  let store = null;
  let user = session;

  try {
    const userRes = await query('SELECT id, name, email FROM users WHERE id = $1', [session.id]);
    if (userRes.rows.length > 0) user = userRes.rows[0];

    const storeRes = await query(
      'SELECT id, store_name, description, store_image, created_at FROM stores WHERE seller_id = $1',
      [session.id]
    );
    if (storeRes.rows.length > 0) {
      store = storeRes.rows[0];
    } else {
      // Auto create store if not yet existing
      const newStore = await query(
        'INSERT INTO stores (seller_id, store_name, description) VALUES ($1, $2, $3) RETURNING *',
        [session.id, `Toko ${session.name}`, 'Toko resmi di StudyGear']
      );
      store = newStore.rows[0];
    }
  } catch (err) {
    console.error('Error fetching seller store info:', err.message);
  }

  return <StoreClient store={store} user={user} />;
}
