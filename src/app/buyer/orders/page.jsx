import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import OrdersClient from './OrdersClient';

export default async function BuyerOrdersPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const isCheckoutSuccess = resolvedParams?.checkout === 'success';
  const session = await getSession();

  if (!session || session.role !== 'buyer') {
    redirect('/login?callbackUrl=/buyer/orders');
  }

  let orders = [];

  try {
    // 1. Fetch orders header
    const ordersRes = await query(
      `SELECT o.id, o.store_id, o.total_price, o.shipping_address, o.status, o.created_at,
              s.store_name
       FROM orders o
       JOIN stores s ON o.store_id = s.id
       WHERE o.buyer_id = $1
       ORDER BY o.created_at DESC`,
      [session.id]
    );

    const rawOrders = ordersRes.rows;

    if (rawOrders.length > 0) {
      const orderIds = rawOrders.map((o) => o.id);

      // 2. Fetch items for all these orders + join with reviews
      const itemsRes = await query(
        `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase,
                p.name AS product_name, p.image_url,
                r.rating AS review_rating, r.comment AS review_comment
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN reviews r ON oi.order_id = r.order_id AND oi.product_id = r.product_id AND r.buyer_id = $1
         WHERE oi.order_id = ANY($2::int[])
         ORDER BY oi.id ASC`,
        [session.id, orderIds]
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
  } catch (err) {
    console.error('Error fetching buyer orders:', err.message);
  }

  return <OrdersClient orders={orders} isCheckoutSuccess={isCheckoutSuccess} />;
}
