'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteUser } from '@/actions/adminActions';
import { X, MapPin } from 'lucide-react';

export default function UsersClient({ users = [], currentAdminId }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState(null);
  const [alert, setAlert] = useState(null);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = async (user) => {
    if (user.id === currentAdminId) {
      setAlert({ type: 'error', message: 'Anda tidak dapat menghapus akun admin Anda sendiri.' });
      return;
    }

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus akun "${user.name}" (${user.email}) secara permanen? Seluruh data terkait akun ini akan dihapus.`
    );
    if (!confirmed) return;

    setIsDeleting(user.id);
    setAlert(null);

    try {
      const res = await deleteUser(user.id);
      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        router.refresh();
      }
    } catch (err) {
      console.error('Delete user error:', err);
      setAlert({ type: 'error', message: 'Gagal menghapus pengguna.' });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171F3F]">Manajemen Pengguna</h1>
          <p className="text-xs text-[#6D6E70] mt-1">
            Kelola seluruh akun pengguna terdaftar (Admin, Seller, Buyer)
          </p>
        </div>
      </div>

      {/* Alert Notification */}
      {alert && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            alert.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{alert.message}</span>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="text-xs font-bold p-1 hover:opacity-75"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#CED2E3]/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau email pengguna..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6D6E70]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'admin', 'seller', 'buyer'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-colors cursor-pointer ${
                roleFilter === r
                  ? 'bg-[#171F3F] text-white shadow-xs'
                  : 'bg-[#F5F6FA] text-[#6D6E70] hover:text-[#171F3F]'
              }`}
            >
              {r === 'all' ? 'Semua Peran' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#CED2E3]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2B2B2B]">
            <thead className="bg-[#F5F6FA] border-b border-[#CED2E3] text-[#6D6E70] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Nama</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status Seller</th>
                <th className="px-5 py-3.5">Terdaftar</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F6FA]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#6D6E70]">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentAdmin = user.id === currentAdminId;
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-[#F5F6FA]/50 transition-colors ${
                        isCurrentAdmin ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-mono font-medium">#{user.id}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#171F3F] flex items-center gap-1.5">
                          {user.name}
                          {isCurrentAdmin && (
                            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                              Anda
                            </span>
                          )}
                        </div>
                        {user.address && (
                          <span className="text-[11px] text-[#6D6E70] truncate max-w-xs mt-0.5 inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0 text-[#6D6E70]" />
                            <span className="truncate">{user.address}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[#6D6E70]">{user.email}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'admin'
                              ? 'bg-[#171F3F] text-white'
                              : user.role === 'seller'
                              ? 'bg-[#283776] text-white'
                              : 'bg-zinc-200 text-zinc-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {user.role === 'seller' ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              user.seller_status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : user.seller_status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {user.seller_status}
                          </span>
                        ) : (
                          <span className="text-[#6D6E70] text-[11px]">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[#6D6E70]">
                        {new Date(user.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end">
                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={isCurrentAdmin || isDeleting === user.id}
                            onClick={() => handleDelete(user)}
                            title={isCurrentAdmin ? 'Admin tidak dapat menghapus akunnya sendiri' : 'Hapus pengguna'}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                              isCurrentAdmin
                                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                                : 'bg-white hover:bg-red-50 text-[#DC2626] border border-red-200'
                            }`}
                          >
                            {isDeleting === user.id ? 'Menghapus...' : 'Hapus'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
