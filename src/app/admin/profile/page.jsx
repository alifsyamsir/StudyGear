import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import AdminProfileClient from './AdminProfileClient';

export default async function AdminProfilePage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login?callbackUrl=/admin/profile');
  }

  let admin = session;
  try {
    const res = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [session.id]
    );
    if (res.rows.length > 0) {
      admin = res.rows[0];
    }
  } catch (err) {
    console.error('Error fetching admin profile:', err.message);
  }

  return <AdminProfileClient admin={admin} />;
}
