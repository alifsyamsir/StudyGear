'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct, deleteProduct } from '@/actions/productActions';
import { Plus, X, Package, BookOpen, Camera } from 'lucide-react';

export default function SellerProductsClient({ products = [], categories = [], store }) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = create mode
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [alert, setAlert] = useState(null);

  // Form State
  const [formState, setFormState] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    description: '',
    image_url: '',
  });

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormState({
      name: '',
      category_id: categories.length > 0 ? categories[0].id.toString() : '',
      price: '',
      stock: '10',
      description: '',
      image_url: '',
    });
    setAlert(null);
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormState({
      name: prod.name,
      category_id: prod.category_id ? prod.category_id.toString() : '',
      price: prod.price.toString(),
      stock: prod.stock.toString(),
      description: prod.description || '',
      image_url: prod.image_url || '',
    });
    setAlert(null);
    setModalOpen(true);
  };

  // Upload image handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setAlert(null);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setAlert({ type: 'error', message: json.error || 'Gagal mengunggah foto produk.' });
      } else {
        setFormState((prev) => ({ ...prev, image_url: json.url }));
      }
    } catch (err) {
      console.error('Product image upload error:', err);
      setAlert({ type: 'error', message: 'Gagal mengunggah gambar produk.' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    try {
      const data = new FormData();
      data.append('name', formState.name);
      data.append('category_id', formState.category_id);
      data.append('price', formState.price);
      data.append('stock', formState.stock);
      data.append('description', formState.description);
      data.append('image_url', formState.image_url);

      let res;
      if (editingProduct) {
        res = await updateProduct(editingProduct.id, data);
      } else {
        res = await createProduct(data);
      }

      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        setModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error('Submit product error:', err);
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product handler
  const handleDelete = async (prod) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus produk "${prod.name}" dari toko Anda?`);
    if (!confirmed) return;

    setDeletingId(prod.id);
    setAlert(null);

    try {
      const res = await deleteProduct(prod.id);
      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        router.refresh();
      }
    } catch (err) {
      console.error('Delete product error:', err);
      setAlert({ type: 'error', message: 'Gagal menghapus produk.' });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      categoryFilter === 'all' ||
      (p.category_id && p.category_id.toString() === categoryFilter);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171F3F]">Manajemen Produk</h1>
          <p className="text-xs text-[#6D6E70] mt-1">
            Kelola daftar produk, stok perlengkapan belajar, dan harga jual toko{' '}
            <span className="font-semibold text-[#171F3F]">"{store?.store_name}"</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#CED2E3]/80 shadow-xs">
          <span className="text-[11px] font-semibold text-[#6D6E70] uppercase">Total Produk</span>
          <p className="text-2xl font-bold text-[#171F3F] mt-1">{products.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#CED2E3]/80 shadow-xs">
          <span className="text-[11px] font-semibold text-[#6D6E70] uppercase">Tersedia (Ready)</span>
          <p className="text-2xl font-bold text-[#63A357] mt-1">
            {products.filter((p) => p.stock > 0).length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#CED2E3]/80 shadow-xs">
          <span className="text-[11px] font-semibold text-[#6D6E70] uppercase">Stok Habis</span>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {products.filter((p) => p.stock <= 0).length}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#CED2E3]/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama produk di toko Anda..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6D6E70]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id.toString()}>
              {c.name}
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
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Harga</th>
                <th className="px-5 py-3.5">Sisa Stok</th>
                <th className="px-5 py-3.5">Dibuat Pada</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F6FA]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#6D6E70]">
                    <Package className="w-10 h-10 text-[#CED2E3] mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#171F3F]">Belum ada produk di toko Anda</p>
                    <p className="text-xs text-[#6D6E70] mt-0.5">
                      Klik tombol <strong>"Tambah Produk Baru"</strong> di atas untuk mulai berjualan.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F5F6FA]/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#F5F6FA] overflow-hidden border border-[#CED2E3] shrink-0 flex items-center justify-center text-[#CED2E3]">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-[#171F3F] text-xs block max-w-xs truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-[#6D6E70] line-clamp-1 max-w-xs">
                            {p.description}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 bg-[#F5F6FA] border border-[#CED2E3] rounded-md text-[11px] font-medium text-[#171F3F]">
                        {p.category_name || 'Tanpa Kategori'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#171F3F]">
                      Rp {Number(p.price).toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          p.stock > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.stock > 0 ? `${p.stock} unit` : 'Habis'}
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#171F3F] hover:bg-[#F5F6FA] border border-[#CED2E3] rounded-lg transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === p.id}
                          onClick={() => handleDelete(p)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === p.id ? 'Menghapus...' : 'Hapus'}
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

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#CED2E3] shadow-xl max-w-xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#CED2E3]/60">
              <h3 className="font-bold text-base text-[#171F3F]">
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru ke Toko'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#6D6E70] hover:text-[#171F3F] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171F3F] mb-1">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Contoh: Joyko Gel Pen 0.5mm Hitam (Pack isi 12)"
                  className="w-full px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#171F3F] mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formState.category_id}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, category_id: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id.toString()}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171F3F] mb-1">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={formState.price}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="Contoh: 25000"
                    className="w-full px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171F3F] mb-1">
                    Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formState.stock}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, stock: e.target.value }))
                    }
                    placeholder="Contoh: 50"
                    className="w-full px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
                  />
                </div>
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-[#171F3F] mb-1">
                  Foto / Gambar Produk <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#F5F6FA] border-2 border-dashed border-[#CED2E3] flex items-center justify-center overflow-hidden shrink-0">
                    {formState.image_url ? (
                      <img
                        src={formState.image_url}
                        alt="Preview Produk"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-7 h-7 text-[#6D6E70]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-block px-3.5 py-2 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs">
                      {uploadingImage ? 'Mengunggah File...' : 'Pilih Foto dari Komputer'}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-[#6D6E70]">
                      Atau masukkan URL gambar langsung di bawah ini:
                    </p>
                    <input
                      type="text"
                      value={formState.image_url}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, image_url: e.target.value }))
                      }
                      placeholder="https://... atau /uploads/..."
                      className="w-full px-3 py-1.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-lg focus:bg-white focus:outline-none focus:border-[#283776]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171F3F] mb-1">
                  Deskripsi Lengkap Produk <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Jelaskan spesifikasi produk, warna, merk, kelebihan penunjang belajar, dll..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#CED2E3]/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6D6E70] hover:text-[#171F3F]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-6 py-2.5 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {submitting ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <span>{editingProduct ? 'Simpan Perubahan' : 'Terbitkan Produk'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
