import { query } from '@/lib/db';
import VerificationsClient from './VerificationsClient';

export default async function AdminVerificationsPage() {
  let pendingSellers = [];
  let processedSellers = [];

  try {
    const pendingRes = await query(
      `SELECT u.id, u.name, u.email, u.seller_status, u.created_at, s.store_name, s.description, s.document_url
       FROM users u
       LEFT JOIN stores s ON u.id = s.seller_id
       WHERE u.role = 'seller' AND u.seller_status = 'pending'
       ORDER BY u.created_at DESC`
    );
    pendingSellers = pendingRes.rows;

    const historyRes = await query(
      `SELECT u.id, u.name, u.email, u.seller_status, u.created_at, s.store_name, s.document_url
       FROM users u
       LEFT JOIN stores s ON u.id = s.seller_id
       WHERE u.role = 'seller' AND u.seller_status IN ('approved', 'rejected')
       ORDER BY u.created_at DESC LIMIT 50`
    );
    processedSellers = historyRes.rows;
  } catch (err) {
    console.error('Error fetching verifications:', err.message);
  }

  return (
    <VerificationsClient
      pendingSellers={pendingSellers}
      processedSellers={processedSellers}
    />
  );
}
