/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { Store, Menu, X } from 'lucide-react';
import SellerSidebarNav from './SellerSidebarNav';
import LogoutButton from '@/components/layout/LogoutButton';

export default function SellerSidebar({ session, store }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* 1. Mobile Topbar (Sticky on mobile only) */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#CED2E3]/80 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#171F3F] to-[#283776] text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden shrink-0">
            {store?.store_image ? (
              <img src={store.store_image} alt="Logo Toko" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-4 h-4" />
            )}
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-[#171F3F] leading-none truncate">
              {store?.store_name || `Toko ${session?.name}`}
            </h1>
            <span className="text-[10px] text-[#63A357] font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#63A357]"></span>
              Seller Terverifikasi
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-[#171F3F] hover:bg-[#F5F6FA] border border-[#CED2E3]/80 transition-colors cursor-pointer shrink-0"
          aria-label="Buka Menu Seller"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* 2. Mobile Drawer & Backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-[#171F3F]/60 backdrop-blur-xs transition-opacity"
            onClick={closeMobile}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#CED2E3]/60">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#171F3F] to-[#283776] text-white flex items-center justify-center font-bold shadow-xs overflow-hidden shrink-0">
                    {store?.store_image ? (
                      <img src={store.store_image} alt="Logo Toko" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-4 h-4" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="text-sm font-bold text-[#171F3F] leading-tight truncate">
                      {store?.store_name || `Toko ${session?.name}`}
                    </h2>
                    <span className="text-[10px] text-[#63A357] font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#63A357]"></span>
                      Seller Terverifikasi
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="p-1.5 rounded-lg text-[#6D6E70] hover:text-[#171F3F] hover:bg-[#F5F6FA] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <SellerSidebarNav onItemClick={closeMobile} />
            </div>

            {/* Bottom Section: Profile & Logout */}
            <div className="mt-8 pt-5 border-t border-[#CED2E3]/60 space-y-3">
              <div className="p-3 bg-[#F5F6FA] rounded-xl text-xs text-[#6D6E70]">
                <p className="font-semibold text-[#171F3F] mb-0.5 truncate">{session?.name}</p>
                <p className="truncate text-[11px]">{session?.email}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="inline-block px-2 py-0.5 bg-[#63A357] text-white text-[10px] font-bold rounded-md uppercase">
                    Approved
                  </span>
                  <span className="text-[10px] text-[#6D6E70]">Seller #{session?.id}</span>
                </div>
              </div>

              <LogoutButton />
            </div>
          </div>
        </div>
      )}

      {/* 3. Desktop Sticky Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:h-screen md:sticky md:top-0 bg-white border-r border-[#CED2E3]/80 shrink-0 p-5 shadow-xs z-30 justify-between overflow-y-auto">
        <div>
          {/* Store Info Header */}
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-[#CED2E3]/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#171F3F] to-[#283776] text-white flex items-center justify-center font-bold text-lg shadow-xs overflow-hidden shrink-0">
              {store?.store_image ? (
                <img src={store.store_image} alt="Logo Toko" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-5 h-5" />
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-[#171F3F] leading-tight truncate">
                {store?.store_name || `Toko ${session?.name}`}
              </h2>
              <span className="text-[10px] text-[#63A357] font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#63A357]"></span>
                Seller Terverifikasi
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <SellerSidebarNav />
        </div>

        {/* Bottom Section: Profile & Logout */}
        <div className="mt-8 pt-5 border-t border-[#CED2E3]/60 space-y-3">
          <div className="p-3 bg-[#F5F6FA] rounded-xl text-xs text-[#6D6E70]">
            <p className="font-semibold text-[#171F3F] mb-0.5 truncate">{session?.name}</p>
            <p className="truncate text-[11px]">{session?.email}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="inline-block px-2 py-0.5 bg-[#63A357] text-white text-[10px] font-bold rounded-md uppercase">
                Approved
              </span>
              <span className="text-[10px] text-[#6D6E70]">Seller #{session?.id}</span>
            </div>
          </div>

          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
