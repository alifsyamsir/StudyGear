/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProductAdmin } from '@/actions/adminActions';
import { X, Package, Store } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

export default function AdminProductsClient({ products = [] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(null);
  const [alert, setAlert] = useState(null);

  const itemsPerPage = 10;

  // Categories list derived from products
  const categoryNames = Array.from(
    new Set(products.map((p) => p.category_name).filter(Boolean))
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.store_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' || p.category_name === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (prod) => {
    const reason = window.prompt(
      `MODERASI PRODUK:\nApakah Anda yakin ingin menghapus produk "${prod.name}" milik toko "${prod.store_name}"?\nKetik "HAPUS" untuk mengonfirmasi:`
    );
    if (reason !== 'HAPUS') return;

    setIsDeleting(prod.id);
    setAlert(null);

    try {
      const res = await deleteProductAdmin(prod.id);
      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        router.refresh();
      }
    } catch (err) {
      console.error('Delete product moderation error:', err);
      setAlert({ type: 'error', message: 'Gagal memoderasi/menghapus produk.' });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#171F3F]">Moderasi Produk</h1>
        <p className="text-xs text-[#6D6E70] mt-1">
          Pantau seluruh katalog produk dari semua toko penjual dan hapus produk yang melanggar ketentuan
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

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#CED2E3]/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Cari nama produk atau nama toko..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6D6E70]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full sm:w-auto px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
        >
          <option value="all">Semua Kategori</option>
          {categoryNames.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-[#CED2E3]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2B2B2B]">
            <thead className="bg-[#F5F6FA] border-b border-[#CED2E3] text-[#6D6E70] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Produk</th>
                <th className="px-5 py-3.5">Toko Penjual</th>
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Harga</th>
                <th className="px-5 py-3.5">Sisa Stok</th>
                <th className="px-5 py-3.5">Dibuat Pada</th>
                <th className="px-5 py-3.5 text-right">Aksi Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F6FA]">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#6D6E70]">
                    Tidak ada produk yang ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F5F6FA]/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-[#F5F6FA] overflow-hidden border border-[#CED2E3] shrink-0 flex items-center justify-center text-lg">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-[#CED2E3]" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-[#171F3F] text-xs block max-w-xs truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-[#6D6E70] font-mono">
                            ID: #{p.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#283776]">
                      <span className="inline-flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-[#283776]" />
                        <span>{p.store_name}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-[#F5F6FA] border border-[#CED2E3] rounded-md text-[11px] font-medium text-[#171F3F]">
                        {p.category_name || 'Tanpa Kategori'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#171F3F]">
                      Rp {Number(p.price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`font-semibold ${
                          p.stock > 0 ? 'text-[#63A357]' : 'text-red-600'
                        }`}
                      >
                        {p.stock} unit
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#6D6E70]">
                      {new Date(p.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        disabled={isDeleting === p.id}
                        onClick={() => handleDelete(p)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-[#DC2626] text-[#DC2626] hover:text-white border border-red-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting === p.id ? 'Menghapus...' : 'Hapus Pelanggaran'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Reusable Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
