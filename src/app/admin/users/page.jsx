import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import UsersClient from './UsersClient';

export default async function AdminUsersPage() {
  const session = await getSession();

  let users = [];
  try {
    const res = await query(
      `SELECT id, name, email, role, seller_status, address, created_at, is_active
       FROM users
       ORDER BY id ASC`
    );
    users = res.rows;
  } catch (err) {
    console.error('Error fetching users:', err.message);
  }

  return <UsersClient users={users} currentAdminId={session?.id} />;
}
