import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import SellerOrdersClient from './SellerOrdersClient';

export default async function SellerOrdersPage() {
  const session = await getSession();

  if (!session || session.role !== 'seller') {
    redirect('/login?callbackUrl=/seller/orders');
  }

  if (session.seller_status !== 'approved') {
    redirect('/seller/pending');
  }

  let orders = [];

  try {
    // 1. Get seller's store ID
    const storeRes = await query('SELECT id FROM stores WHERE seller_id = $1', [session.id]);

    if (storeRes.rows.length > 0) {
      const storeId = storeRes.rows[0].id;

      // 2. Query incoming orders for this store
      const orderRes = await query(
        `SELECT o.id, o.buyer_id, o.total_price, o.shipping_address, o.status, o.created_at,
                u.name AS buyer_name, u.email AS buyer_email
         FROM orders o
         JOIN users u ON o.buyer_id = u.id
         WHERE o.store_id = $1
         ORDER BY o.created_at DESC`,
        [storeId]
      );

      const rawOrders = orderRes.rows;

      if (rawOrders.length > 0) {
        const orderIds = rawOrders.map((o) => o.id);

        // 3. Query items for these orders
        const itemsRes = await query(
          `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase,
                  p.name AS product_name, p.image_url
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ANY($1::int[])
           ORDER BY oi.id ASC`,
          [orderIds]
        );

        const itemsByOrder = new Map();
        for (const it of itemsRes.rows) {
          if (!itemsByOrder.has(it.order_id)) {
            itemsByOrder.set(it.order_id, []);
          }
          itemsByOrder.get(it.order_id).push(it);
        }

        orders = rawOrders.map((o) => ({
          ...o,
          items: itemsByOrder.get(o.id) || [],
        }));
      }
    }
  } catch (err) {
    console.error('Error fetching seller orders:', err.message);
  }

  return <SellerOrdersClient orders={orders} />;
}
