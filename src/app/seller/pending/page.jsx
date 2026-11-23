import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import PendingClient from './PendingClient';

export default async function PendingSellerPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login?callbackUrl=/seller/pending');
  }

  if (session.role !== 'seller') {
    redirect('/');
  }

  // Fetch real-time status from database
  let currentUser = session;
  try {
    const res = await query(
      'SELECT id, name, email, role, seller_status FROM users WHERE id = $1',
      [session.id]
    );
    if (res.rows.length > 0) {
      currentUser = res.rows[0];
    }
  } catch (err) {
    console.error('Error fetching seller status:', err.message);
  }

  // If approved, redirect to seller dashboard
  if (currentUser.seller_status === 'approved') {
    redirect('/seller/products');
  }

  return <PendingClient user={currentUser} />;
}
