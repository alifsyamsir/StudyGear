'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/actions/authActions';
import { Shield } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
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

  const fillDemoAccount = (email, pass) => {
    setFormData({ email, password: pass });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const data = new FormData();
      data.append('email', formData.email);
      data.append('password', formData.password);

      const result = await loginUser(data);

      if (result?.error) {
        setErrorMessage(result.error);
        setLoading(false);
        return;
      }

      if (result?.success) {
        const destination = callbackUrl || result.redirectUrl || '/';
        router.push(destination);
        router.refresh();
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setErrorMessage('Terjadi kesalahan jaringan atau server. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-8 sm:p-10 shadow-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#171F3F] to-[#283776] flex items-center justify-center text-white shadow-xs mb-3">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#171F3F]">Selamat Datang Kembali</h1>
        <p className="text-xs text-[#6D6E70] mt-1">
          Masuk ke akun StudyGear Anda untuk melanjutkan aktivitas
        </p>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#171F3F]">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password Anda"
              className="w-full pl-4 pr-11 py-2.5 text-sm bg-[#F5F6FA] border border-[#CED2E3] rounded-xl text-[#2B2B2B] placeholder-[#6D6E70] focus:bg-white focus:outline-none focus:border-[#283776] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6D6E70] hover:text-[#171F3F] cursor-pointer"
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
              <span>Memproses...</span>
            </>
          ) : (
            <span>Masuk Sekarang</span>
          )}
        </button>
      </form>

      {/* Quick Demo Credentials */}
      <div className="mt-6 pt-5 border-t border-[#CED2E3]/60">
        <p className="text-[11px] font-semibold text-[#6D6E70] uppercase tracking-wider text-center mb-2.5">
          Akun Cepat untuk Uji Coba:
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount('admin@studygear.id', 'admin123')}
            className="px-2.5 py-1 text-[11px] bg-[#F5F6FA] hover:bg-[#CED2E3]/50 text-[#171F3F] font-medium rounded-lg border border-[#CED2E3] transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-[#171F3F]" />
            <span>Demo Admin</span>
          </button>
        </div>
      </div>

      {/* Switch to Register */}
      <div className="mt-6 text-center text-xs text-[#6D6E70]">
        Belum punya akun StudyGear?{' '}
        <Link href="/register" className="font-semibold text-[#283776] hover:underline">
          Daftar Sekarang
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Suspense
          fallback={
            <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-8 sm:p-10 shadow-sm text-center">
              <div className="animate-spin h-8 w-8 mx-auto text-[#171F3F] border-2 border-current border-t-transparent rounded-full mb-2"></div>
              <p className="text-xs text-[#6D6E70]">Memuat halaman masuk...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
