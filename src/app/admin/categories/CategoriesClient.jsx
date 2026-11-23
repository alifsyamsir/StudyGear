'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/actions/adminActions';
import { X, Plus, Package } from 'lucide-react';

export default function CategoriesClient({ categories = [] }) {
  const router = useRouter();
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [alert, setAlert] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSubmitting(true);
    setAlert(null);

    try {
      const formData = new FormData();
      formData.append('name', newCatName.trim());

      const res = await createCategory(formData);
      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        setNewCatName('');
        router.refresh();
      }
    } catch (err) {
      console.error('Create category error:', err);
      setAlert({ type: 'error', message: 'Gagal menambahkan kategori.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCat || !editingCat.name.trim()) return;

    setIsSubmitting(true);
    setAlert(null);

    try {
      const formData = new FormData();
      formData.append('name', editingCat.name.trim());

      const res = await updateCategory(editingCat.id, formData);
      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        setEditingCat(null);
        router.refresh();
      }
    } catch (err) {
      console.error('Update category error:', err);
      setAlert({ type: 'error', message: 'Gagal memperbarui kategori.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    const productMsg =
      cat.product_count > 0
        ? ` PERINGATAN: Ada ${cat.product_count} produk yang saat ini menggunakan kategori ini!`
        : '';
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus kategori "${cat.name}"?${productMsg}`
    );
    if (!confirmed) return;

    setIsDeleting(cat.id);
    setAlert(null);

    try {
      const res = await deleteCategory(cat.id);
      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        router.refresh();
      }
    } catch (err) {
      console.error('Delete category error:', err);
      setAlert({ type: 'error', message: 'Gagal menghapus kategori.' });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#171F3F]">Kelola Kategori</h1>
        <p className="text-xs text-[#6D6E70] mt-1">
          Tambah, ubah, dan hapus kategori produk stationery & perlengkapan belajar
        </p>
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

      {/* Quick Add Category Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#CED2E3]/80 shadow-xs">
        <h2 className="text-sm font-bold text-[#171F3F] mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#283776]" />
          <span>Tambah Kategori Baru</span>
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Contoh: Alat Tulis & Pena, Highlighter, Planner..."
            className="flex-1 px-4 py-2.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776] transition-all"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newCatName.trim()}
            className="px-6 py-2.5 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? 'Menambahkan...' : 'Simpan Kategori'}
          </button>
        </form>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-[#CED2E3]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2B2B2B]">
            <thead className="bg-[#F5F6FA] border-b border-[#CED2E3] text-[#6D6E70] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Nama Kategori</th>
                <th className="px-5 py-3.5">Jumlah Produk</th>
                <th className="px-5 py-3.5">Dibuat Pada</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F6FA]">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#6D6E70]">
                    Belum ada kategori yang dibuat.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#F5F6FA]/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium">#{cat.id}</td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-[#171F3F] text-sm">{cat.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-[#F5F6FA] border border-[#CED2E3] rounded-lg text-xs font-semibold text-[#171F3F] inline-flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#6D6E70]" />
                        <span>{cat.product_count} produk</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#6D6E70]">
                      {new Date(cat.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCat(cat)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#171F3F] hover:bg-[#F5F6FA] border border-[#CED2E3] rounded-lg transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting === cat.id}
                          onClick={() => handleDelete(cat)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#DC2626] hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting === cat.id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CED2E3] shadow-xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#CED2E3]/60">
              <h3 className="font-bold text-base text-[#171F3F]">Edit Kategori</h3>
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="text-[#6D6E70] hover:text-[#171F3F] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  value={editingCat.name}
                  onChange={(e) =>
                    setEditingCat((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#CED2E3]/60">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#6D6E70] hover:text-[#171F3F]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
