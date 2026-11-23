'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateStoreInfo } from '@/actions/storeActions';
import { X, Store, Eye, CheckCircle } from 'lucide-react';

export default function StoreClient({ store, user }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    store_name: store?.store_name || '',
    description: store?.description || '',
    store_image: store?.store_image || '',
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
        setAlert({ type: 'error', message: json.error || 'Gagal mengunggah foto toko.' });
      } else {
        setFormData((prev) => ({ ...prev, store_image: json.url }));
        setAlert({ type: 'success', message: 'Foto toko berhasil diunggah! Jangan lupa simpan perubahan.' });
      }
    } catch (err) {
      console.error('Store image upload error:', err);
      setAlert({ type: 'error', message: 'Gagal mengunggah gambar ke server.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const data = new FormData();
      data.append('store_name', formData.store_name);
      data.append('description', formData.description);
      data.append('store_image', formData.store_image);

      const res = await updateStoreInfo(data);
      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        router.refresh();
      }
    } catch (err) {
      console.error('Store update submit error:', err);
      setAlert({ type: 'error', message: 'Terjadi kesalahan saat menyimpan informasi toko.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#171F3F]">Pengaturan Toko</h1>
        <p className="text-xs text-[#6D6E70] mt-1">
          Kelola identitas, logo/banner, dan deskripsi toko yang akan dilihat oleh pembeli
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#CED2E3]/80 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                Nama Toko <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="store_name"
                required
                value={formData.store_name}
                onChange={handleInputChange}
                placeholder="Contoh: Toko Buku & Alat Tulis Cemerlang"
                className="w-full px-4 py-2.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                Logo / Foto Profil Toko
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-[#F5F6FA] border-2 border-dashed border-[#CED2E3] flex items-center justify-center overflow-hidden shrink-0">
                  {formData.store_image ? (
                    <img
                      src={formData.store_image}
                      alt="Logo Toko"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-8 h-8 text-[#6D6E70]" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-2 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs">
                      {uploading ? 'Mengunggah...' : 'Pilih File Gambar'}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.store_image && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, store_image: '' }))}
                        className="px-3 py-2 bg-white hover:bg-red-50 text-[#DC2626] border border-red-200 text-xs font-semibold rounded-xl transition-colors"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6D6E70]">
                    Format: JPG, PNG, WEBP (Maksimal 5MB). 
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                Deskripsi Toko
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ceritakan tentang toko Anda, spesialisasi produk stationery yang dijual, dll..."
                className="w-full px-4 py-2.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776] transition-all"
              />
            </div>

            <div className="pt-4 border-t border-[#CED2E3]/60 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving || uploading}
                className="px-6 py-2.5 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan Toko</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Live Preview Card */}
        <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#171F3F] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#171F3F]" />
              <span>Pratinjau Tampilan Toko</span>
            </h3>

            <div className="bg-[#F5F6FA] rounded-2xl p-5 border border-[#CED2E3]/60 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-xs overflow-hidden border border-[#CED2E3] flex items-center justify-center mb-3">
                {formData.store_image ? (
                  <img
                    src={formData.store_image}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store className="w-8 h-8 text-[#283776]" />
                )}
              </div>
              <h4 className="font-bold text-sm text-[#171F3F]">
                {formData.store_name || 'Nama Toko Anda'}
              </h4>
              <p className="text-[11px] text-[#63A357] font-semibold mt-1 inline-flex items-center gap-1 justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-[#63A357]" />
                <span>Mitra Terverifikasi StudyGear</span>
              </p>
              <p className="text-xs text-[#6D6E70] mt-3 line-clamp-4 leading-relaxed">
                {formData.description || 'Deskripsi toko Anda akan muncul di sini untuk para pembeli.'}
              </p>
            </div>

            <div className="mt-5 space-y-2 text-xs text-[#6D6E70]">
              <div className="flex justify-between py-1 border-b border-[#F5F6FA]">
                <span>Pemilik Toko:</span>
                <span className="font-semibold text-[#171F3F]">{user?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F6FA]">
                <span>Email Kontak:</span>
                <span className="font-semibold text-[#171F3F]">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Status Akun:</span>
                <span className="font-bold text-[#63A357] uppercase">Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
