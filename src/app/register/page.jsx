'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/actions/authActions';
import { ShoppingBag, Store, Clock, Upload, FileText, X } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState('buyer'); // 'buyer' or 'seller'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    storeName: '',
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      setLoading(false);
      return;
    }

    if (role === 'seller' && !documentFile) {
      setErrorMessage('Dokumen bukti verifikasi toko wajib diunggah.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('confirmPassword', formData.confirmPassword);
      data.append('role', role);
      if (role === 'seller') {
        data.append('storeName', formData.storeName);
        if (documentFile) {
          data.append('document', documentFile);
        }
      }

      const result = await registerUser(data);

      if (result?.error) {
        setErrorMessage(result.error);
        setLoading(false);
        return;
      }

      if (result?.success) {
        router.push(result.redirectUrl || '/');
        router.refresh();
      }
    } catch (err) {
      console.error('Register submit error:', err);
      setErrorMessage('Terjadi kesalahan jaringan atau server. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-8 sm:p-10 shadow-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#171F3F] to-[#283776] flex items-center justify-center text-white shadow-xs mb-3">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#171F3F]">Buat Akun Baru</h1>
            <p className="text-xs text-[#6D6E70] mt-1">
              Bergabunglah dengan StudyGear sebagai Pembeli atau Penjual
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex bg-[#F5F6FA] p-1 rounded-2xl mb-6 border border-[#CED2E3]/60">
            <button
              type="button"
              onClick={() => { setRole('buyer'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'buyer'
                  ? 'bg-white text-[#171F3F] shadow-xs'
                  : 'text-[#6D6E70] hover:text-[#171F3F]'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#283776]" />
              <span>Pembeli (Buyer)</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('seller'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'seller'
                  ? 'bg-white text-[#171F3F] shadow-xs'
                  : 'text-[#6D6E70] hover:text-[#171F3F]'
              }`}
            >
              <Store className="w-4 h-4 text-[#283776]" />
              <span>Penjual (Seller)</span>
            </button>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Seller Notice */}
          {role === 'seller' && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#E59417] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Pendaftaran Penjual Membutuhkan Verifikasi</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Akun penjual akan berstatus <strong>Pending</strong> sampai disetujui oleh Administrator.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: Muhammad Alif"
                className="w-full px-4 py-2.5 text-sm bg-[#F5F6FA] border border-[#CED2E3] rounded-xl text-[#2B2B2B] placeholder-[#6D6E70] focus:bg-white focus:outline-none focus:border-[#283776] transition-all"
              />
            </div>

            {role === 'seller' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                    Nama Toko (Opsional)
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder={`Contoh: Toko Alat Tulis ${formData.name || 'Alif'}`}
                    className="w-full px-4 py-2.5 text-sm bg-[#F5F6FA] border border-[#CED2E3] rounded-xl text-[#2B2B2B] placeholder-[#6D6E70] focus:bg-white focus:outline-none focus:border-[#283776] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                    Dokumen Bukti Verifikasi Toko (KTM / KTP / NIB / Surat Izin) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5F6FA] hover:bg-[#CED2E3]/40 border border-dashed border-[#CED2E3] rounded-xl cursor-pointer text-xs font-medium text-[#283776] transition-colors overflow-hidden">
                      {documentFile ? (
                        <FileText className="w-4 h-4 text-[#283776] shrink-0" />
                      ) : (
                        <Upload className="w-4 h-4 text-[#283776] shrink-0" />
                      )}
                      <span className="truncate">
                        {documentFile ? documentFile.name : 'Pilih File Dokumen (JPG, PNG, PDF)'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              setErrorMessage('Ukuran file dokumen bukti maksimal 5MB.');
                              return;
                            }
                            setDocumentFile(file);
                            setErrorMessage('');
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {documentFile && (
                      <button
                        type="button"
                        onClick={() => setDocumentFile(null)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 transition-colors"
                        title="Hapus file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6D6E70] mt-1">
                    Format: JPG, PNG, atau PDF (maks 5MB). Digunakan Admin sebagai pertimbangan untuk menyetujui akun toko Anda.
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className="w-full px-4 py-2.5 text-sm bg-[#F5F6FA] border border-[#CED2E3] rounded-xl text-[#2B2B2B] placeholder-[#6D6E70] focus:bg-white focus:outline-none focus:border-[#283776] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-4 pr-11 py-2.5 text-sm bg-[#F5F6FA] border border-[#CED2E3] rounded-xl text-[#2B2B2B] placeholder-[#6D6E70] focus:bg-white focus:outline-none focus:border-[#283776] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6D6E70] hover:text-[#171F3F]"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                Konfirmasi Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                className="w-full px-4 py-2.5 text-sm bg-[#F5F6FA] border border-[#CED2E3] rounded-xl text-[#2B2B2B] placeholder-[#6D6E70] focus:bg-white focus:outline-none focus:border-[#283776] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#171F3F] hover:bg-[#283776] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <span>Daftar Sekarang</span>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center text-xs text-[#6D6E70]">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-semibold text-[#283776] hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
