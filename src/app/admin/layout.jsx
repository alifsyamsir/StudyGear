import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

export default async function AdminLayout({ children }) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login?callbackUrl=/admin/verifications');
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col md:flex-row">
      {/* Sticky & Responsive Admin Sidebar */}
      <AdminSidebar session={session} />

      {/* Main Back-office Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
