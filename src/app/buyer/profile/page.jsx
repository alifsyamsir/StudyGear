import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default async function BuyerProfilePage() {
  const session = await getSession();

  if (!session || session.role !== 'buyer') {
    redirect('/login?callbackUrl=/buyer/profile');
  }

  let user = session;
  try {
    const res = await query('SELECT id, name, email, role, address FROM users WHERE id = $1', [session.id]);
    if (res.rows.length > 0) user = res.rows[0];
  } catch (err) {
    console.error('Error fetching buyer profile:', err.message);
  }

  return <ProfileClient user={user} />;
}
