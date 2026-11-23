'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X } from 'lucide-react';
import AdminSidebarNav from './AdminSidebarNav';
import LogoutButton from '@/components/layout/LogoutButton';

export default function AdminSidebar({ session }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isProfileActive = pathname === '/admin/profile';

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* 1. Mobile Topbar (Sticky on mobile only) */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#CED2E3]/80 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#171F3F] text-white flex items-center justify-center font-bold shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#171F3F] leading-none">Admin Portal</h1>
            <span className="text-[10px] text-[#6D6E70]">StudyGear CMS</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-[#171F3F] hover:bg-[#F5F6FA] border border-[#CED2E3]/80 transition-colors cursor-pointer"
          aria-label="Buka Menu Admin"
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
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#171F3F] text-white flex items-center justify-center font-bold shadow-xs">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#171F3F] leading-tight">Admin Portal</h2>
                    <span className="text-[10px] text-[#6D6E70]">StudyGear CMS</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="p-1.5 rounded-lg text-[#6D6E70] hover:text-[#171F3F] hover:bg-[#F5F6FA] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <AdminSidebarNav onItemClick={closeMobile} />
            </div>

            {/* Bottom Section: Profile & Logout */}
            <div className="mt-8 pt-5 border-t border-[#CED2E3]/60 space-y-3">
              <Link
                href="/admin/profile"
                onClick={closeMobile}
                className={`block p-3 rounded-xl text-xs transition-all ${
                  isProfileActive
                    ? 'bg-[#171F3F] text-white shadow-xs'
                    : 'bg-[#F5F6FA] hover:bg-[#CED2E3]/40 text-[#6D6E70]'
                }`}
              >
                <p className={`font-semibold mb-0.5 truncate ${isProfileActive ? 'text-white' : 'text-[#171F3F]'}`}>
                  {session?.name}
                </p>
                <p className={`truncate text-[11px] ${isProfileActive ? 'text-[#CED2E3]' : 'text-[#6D6E70]'}`}>
                  {session?.email}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                      isProfileActive ? 'bg-white/20 text-white' : 'bg-[#171F3F] text-white'
                    }`}
                  >
                    Administrator
                  </span>
                  <span className={`text-[10px] font-semibold ${isProfileActive ? 'text-[#CED2E3]' : 'text-[#283776]'}`}>
                    Profil &rarr;
                  </span>
                </div>
              </Link>

              <LogoutButton />
            </div>
          </div>
        </div>
      )}

      {/* 3. Desktop Sticky Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:h-screen md:sticky md:top-0 bg-white border-r border-[#CED2E3]/80 shrink-0 p-5 shadow-xs z-30 justify-between overflow-y-auto">
        <div>
          {/* Brand & Portal Badge */}
          <div className="flex items-center gap-3 pb-5 mb-5 border-b border-[#CED2E3]/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#171F3F] to-[#283776] text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#171F3F] leading-tight">Admin Portal</h2>
              <span className="text-[11px] text-[#6D6E70] font-medium">StudyGear CMS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <AdminSidebarNav />
        </div>

        {/* Bottom Section: Profile & Logout */}
        <div className="mt-8 pt-5 border-t border-[#CED2E3]/60 space-y-3">
          <Link
            href="/admin/profile"
            className={`block p-3 rounded-xl text-xs transition-all ${
              isProfileActive
                ? 'bg-[#171F3F] text-white shadow-xs'
                : 'bg-[#F5F6FA] hover:bg-[#CED2E3]/40 text-[#6D6E70]'
            }`}
          >
            <p className={`font-semibold mb-0.5 truncate ${isProfileActive ? 'text-white' : 'text-[#171F3F]'}`}>
              {session?.name}
            </p>
            <p className={`truncate text-[11px] ${isProfileActive ? 'text-[#CED2E3]' : 'text-[#6D6E70]'}`}>
              {session?.email}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                  isProfileActive ? 'bg-white/20 text-white' : 'bg-[#171F3F] text-white'
                }`}
              >
                Administrator
              </span>
              <span className={`text-[10px] font-semibold ${isProfileActive ? 'text-[#CED2E3]' : 'text-[#283776]'}`}>
                Profil &rarr;
              </span>
            </div>
          </Link>

          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
