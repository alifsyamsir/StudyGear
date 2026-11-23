import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebarNav from './AdminSidebarNav';
import { Shield } from 'lucide-react';

export default async function AdminLayout({ children }) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login?callbackUrl=/admin/verifications');
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#F5F6FA] flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-[#CED2E3]/80 shrink-0 p-5 shadow-xs">
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[#CED2E3]/60">
          <div className="w-10 h-10 rounded-xl bg-[#171F3F] text-white flex items-center justify-center font-bold shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#171F3F] leading-tight">Admin Portal</h2>
            <span className="text-[11px] text-[#6D6E70] font-medium">StudyGear CMS</span>
          </div>
        </div>

        <AdminSidebarNav />

        <div className="mt-8 pt-6 border-t border-[#CED2E3]/60">
          <Link
            href="/admin/profile"
            className="block p-3 bg-[#F5F6FA] hover:bg-[#CED2E3]/40 rounded-xl text-xs text-[#6D6E70] transition-colors group cursor-pointer"
          >
            <p className="font-semibold text-[#171F3F] group-hover:text-[#283776] mb-0.5 truncate transition-colors">
              {session.name}
            </p>
            <p className="truncate text-[11px]">{session.email}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="px-2 py-0.5 bg-[#171F3F] text-white text-[10px] font-bold rounded-md uppercase">
                Administrator
              </span>
              <span className="text-[10px] text-[#283776] font-semibold group-hover:underline">
                Profil &rarr;
              </span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
