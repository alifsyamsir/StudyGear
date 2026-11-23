import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import SellerSidebar from './SellerSidebar';

export default async function SellerLayout({ children }) {
  const session = await getSession();

  // If seller is not approved (pending or rejected), render children without sidebar (e.g. /seller/pending)
  if (!session || session.role !== 'seller' || session.seller_status !== 'approved') {
    return <>{children}</>;
  }

  // Fetch store name & store logo
  let store = null;
  try {
    const storeRes = await query('SELECT store_name, store_image FROM stores WHERE seller_id = $1', [session.id]);
    if (storeRes.rows.length > 0) {
      store = storeRes.rows[0];
    }
  } catch (err) {
    console.error('Error fetching store in seller layout:', err);
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col md:flex-row">
      {/* Sticky & Responsive Seller Sidebar */}
      <SellerSidebar session={session} store={store} />

      {/* Main Seller Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
