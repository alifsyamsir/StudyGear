'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateBuyerProfile } from '@/actions/buyerActions';
import { X } from 'lucide-react';

export default function ProfileClient({ user }) {
  const router = useRouter();
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('address', address);

      const res = await updateBuyerProfile(formData);
      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        router.refresh();
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setAlert({ type: 'error', message: 'Gagal memperbarui profil.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#171F3F]">Profil & Alamat Pengiriman</h1>
        <p className="text-xs text-[#6D6E70] mt-1">
          Kelola informasi akun pembeli dan alamat pengiriman default pesanan Anda
        </p>
      </div>

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

      <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
              Email Akun (Tidak dapat diubah)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 text-xs bg-zinc-100 border border-[#CED2E3] rounded-xl text-zinc-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
              Alamat Pengiriman Utama
            </label>
            <textarea
              rows={4}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Jl. Perintis Kemerdekaan KM.10, Tamalanrea, Makassar, Sulawesi Selatan (Kode Pos: 90245)"
              className="w-full px-4 py-2.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
            />
            <p className="text-[11px] text-[#6D6E70] mt-1">
              Alamat ini akan otomatis terisi saat Anda melakukan checkout di keranjang belanja.
            </p>
          </div>

          <div className="pt-4 border-t border-[#CED2E3]/60 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
