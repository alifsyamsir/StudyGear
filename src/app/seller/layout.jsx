import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import SellerSidebarNav from './SellerSidebarNav';
import { Store } from 'lucide-react';

export default async function SellerLayout({ children }) {
  const session = await getSession();

  // If seller is not approved (pending or rejected), render children without sidebar (e.g. /seller/pending)
  if (!session || session.role !== 'seller' || session.seller_status !== 'approved') {
    return <>{children}</>;
  }

  // Fetch store name
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
    <div className="min-h-[calc(100vh-140px)] bg-[#F5F6FA] flex flex-col md:flex-row">
      {/* Seller Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-[#CED2E3]/80 shrink-0 p-5 shadow-xs">
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[#CED2E3]/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#171F3F] to-[#283776] text-white flex items-center justify-center font-bold text-lg shadow-xs overflow-hidden">
            {store?.store_image ? (
              <img src={store.store_image} alt="Logo Toko" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-5 h-5" />
            )}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-[#171F3F] leading-tight truncate">
              {store?.store_name || `Toko ${session.name}`}
            </h2>
            <span className="text-[10px] text-[#63A357] font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#63A357]"></span>
              Seller Terverifikasi
            </span>
          </div>
        </div>

        <SellerSidebarNav />

        <div className="mt-8 pt-6 border-t border-[#CED2E3]/60">
          <div className="p-3 bg-[#F5F6FA] rounded-xl text-xs text-[#6D6E70]">
            <p className="font-semibold text-[#171F3F] mb-0.5 truncate">{session.name}</p>
            <p className="truncate text-[11px]">{session.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-[#63A357] text-white text-[10px] font-bold rounded-md uppercase">
              Approved
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
