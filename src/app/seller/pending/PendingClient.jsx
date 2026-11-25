'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser, deleteRejectedSeller } from '@/actions/authActions';
import { Clock, XCircle } from 'lucide-react';

export default function PendingClient({ user }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isPending = user?.seller_status === 'pending';
  const isRejected = user?.seller_status === 'rejected';

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin menghapus akun ini secara permanen? Data toko dan akun Anda akan dihapus dari sistem.'
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setErrorMessage('');
      const res = await deleteRejectedSeller();
      if (res?.error) {
        setErrorMessage(res.error);
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Delete account error:', err);
      setErrorMessage('Terjadi kesalahan saat menghapus akun.');
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-8 sm:p-10 shadow-sm text-center">
          {isPending && (
            <>
              {/* Pending Status Illustration */}
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center mb-5 animate-pulse">
                <Clock className="w-8 h-8 text-[#E59417]" />
              </div>

              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
                Menunggu Verifikasi
              </div>

              <h1 className="text-2xl font-bold text-[#171F3F] mb-3">
                Akun Anda sedang ditinjau.
              </h1>

              <p className="text-xs text-[#6D6E70] leading-relaxed mb-6">
                Halo <span className="font-semibold text-[#2B2B2B]">{user.name}</span>, permohonan pendaftaran toko Anda telah kami terima dan saat ini sedang ditinjau oleh Administrator StudyGear. Anda akan dapat mengakses dashboard Seller setelah disetujui.
              </p>

              <div className="bg-[#F5F6FA] rounded-2xl p-4 border border-[#CED2E3]/60 mb-6 text-left">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-[#6D6E70]">Email:</span>
                  <span className="font-medium text-[#2B2B2B]">{user.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6D6E70]">Status Toko:</span>
                  <span className="font-bold text-[#E59417] capitalize">{user.seller_status}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => router.refresh()}
                  className="w-full py-2.5 px-4 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Periksa Status Terbaru
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full py-2.5 px-4 bg-white hover:bg-[#F5F6FA] text-[#6D6E70] text-xs font-semibold rounded-xl border border-[#CED2E3] transition-colors cursor-pointer"
                >
                  {isLoggingOut ? 'Sedang keluar...' : 'Keluar (Logout)'}
                </button>
              </div>
            </>
          )}

          {isRejected && (
            <>
              {/* Rejected Status Illustration */}
              <div className="w-16 h-16 mx-auto rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mb-5">
                <XCircle className="w-8 h-8 text-[#DC2626]" />
              </div>

              <div className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
                Pendaftaran Ditolak
              </div>

              <h1 className="text-2xl font-bold text-[#171F3F] mb-3">
                Mohon Maaf, Akun Anda Ditolak.
              </h1>

              <p className="text-xs text-[#6D6E70] leading-relaxed mb-6">
                Halo <span className="font-semibold text-[#2B2B2B]">{user.name}</span>, permohonan pendaftaran toko Anda tidak memenuhi kriteria verifikasi StudyGear. Hubungi layanan pelanggan untuk informasi lebih lanjut.
              </p>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-3">
                {/* Delete Account Button */}
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full py-3 px-4 bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Menghapus Akun...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete Account (Hapus Akun)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full py-2.5 px-4 bg-white hover:bg-[#F5F6FA] text-[#6D6E70] text-xs font-semibold rounded-xl border border-[#CED2E3] transition-colors cursor-pointer"
                >
                  {isLoggingOut ? 'Sedang keluar...' : 'Keluar (Logout)'}
                </button>
              </div>
            </>
          )}

          {!isPending && !isRejected && (
            <div>
              <p className="text-sm text-[#2B2B2B] mb-4">
                Status akun Anda: <strong>{user?.seller_status || 'Unknown'}</strong>
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="py-2 px-4 bg-[#171F3F] text-white text-xs rounded-xl"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
