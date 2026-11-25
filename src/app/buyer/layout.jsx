import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BuyerSidebarNav from './BuyerSidebarNav';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default async function BuyerLayout({ children }) {
  const session = await getSession();

  if (!session || session.role !== 'buyer') {
    redirect('/login?callbackUrl=/buyer/cart');
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#F5F6FA] flex flex-col md:flex-row">
      {/* Buyer Sidebar (Sticky on Desktop) */}
      <aside className="w-full md:w-64 bg-white border-r border-[#CED2E3]/80 shrink-0 p-5 shadow-xs flex flex-col justify-between md:sticky md:top-28 md:h-[calc(100vh-7rem)] overflow-y-auto">
        <div>
          {/* User Profile Card */}
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

          {/* Navigation Links */}
          <BuyerSidebarNav />
        </div>

        {/* Bottom Section: Info & Back to Home */}
        <div className="mt-8 pt-6 border-t border-[#CED2E3]/60 space-y-3">
          <div className="p-3 bg-[#F5F6FA] rounded-xl text-xs text-[#6D6E70]">
            <p className="font-semibold text-[#171F3F] mb-0.5">Akun Pembeli</p>
            <p className="text-[11px]">Nikmati kemudahan belanja stationery di StudyGear!</p>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-white hover:bg-[#F5F6FA] text-[#171F3F] hover:text-[#283776] text-xs font-semibold rounded-xl border border-[#CED2E3] transition-colors shadow-2xs group cursor-pointer"
            title="Kembali ke Beranda Utama"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#283776] group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Navigation Bar: Lanjut Belanja (Centralized across all buyer pages) */}
        <div className="mb-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#6D6E70] hover:text-[#171F3F] transition-colors group cursor-pointer"
            title="Jelajahi katalog stationery lainnya"
          >
            <ShoppingBag className="w-4 h-4 text-[#283776] group-hover:scale-110 transition-transform" />
            <span>&larr; Katalog Produk</span>
          </Link>
        </div>

        {children}
      </main>
    </div>
  );
}
