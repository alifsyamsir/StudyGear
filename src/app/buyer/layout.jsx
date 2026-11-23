import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BuyerSidebarNav from './BuyerSidebarNav';

export default async function BuyerLayout({ children }) {
  const session = await getSession();

  if (!session || session.role !== 'buyer') {
    redirect('/login?callbackUrl=/buyer/cart');
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#F5F6FA] flex flex-col md:flex-row">
      {/* Buyer Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#CED2E3]/80 shrink-0 p-5 shadow-xs">
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[#CED2E3]/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#171F3F] to-[#283776] text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {session.name ? session.name.charAt(0).toUpperCase() : 'B'}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-[#171F3F] leading-tight truncate">
              {session.name}
            </h2>
            <span className="text-[10px] text-[#6D6E70] font-medium truncate block">
              {session.email}
            </span>
          </div>
        </div>

        <BuyerSidebarNav />

        <div className="mt-8 pt-6 border-t border-[#CED2E3]/60">
          <div className="p-3 bg-[#F5F6FA] rounded-xl text-xs text-[#6D6E70]">
            <p className="font-semibold text-[#171F3F] mb-0.5">Akun Pembeli</p>
            <p className="text-[11px]">Nikmati kemudahan belanja stationery di StudyGear!</p>
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
