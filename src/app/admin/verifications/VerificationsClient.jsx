'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifySeller } from '@/actions/adminActions';
import { Clock, History, Check, X, CheckCircle, FileText, ExternalLink } from 'lucide-react';

export default function VerificationsClient({ pendingSellers = [], processedSellers = [] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [alert, setAlert] = useState(null);

  const handleDecision = async (sellerId, decision) => {
    const actionText = decision === 'approved' ? 'menyetujui' : 'menolak';
    const confirmed = window.confirm(`Apakah Anda yakin ingin ${actionText} pendaftaran seller ini?`);
    if (!confirmed) return;

    setLoadingId(sellerId);
    setAlert(null);

    try {
      const res = await verifySeller(sellerId, decision);
      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        router.refresh();
      }
    } catch (err) {
      console.error('Verify seller action error:', err);
      setAlert({ type: 'error', message: 'Terjadi kesalahan sistem saat memproses verifikasi.' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171F3F]">Verifikasi Seller</h1>
          <p className="text-xs text-[#6D6E70] mt-1">
            Tinjau dan setujui permohonan pendaftaran toko dari calon penjual
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-white p-1 rounded-xl border border-[#CED2E3] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#171F3F] text-white shadow-xs'
                : 'text-[#6D6E70] hover:text-[#171F3F]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu ({pendingSellers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#171F3F] text-white shadow-xs'
                : 'text-[#6D6E70] hover:text-[#171F3F]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat ({processedSellers.length})</span>
          </button>
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

      {/* Tab: Pending Verifications */}
      {activeTab === 'pending' && (
        <>
          {pendingSellers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#CED2E3]/80 p-12 text-center shadow-xs">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-[#171F3F] text-base mb-1">
                Semua Permohonan Telah Ditinjau!
              </h3>
              <p className="text-xs text-[#6D6E70] max-w-sm mx-auto">
                Saat ini tidak ada pendaftaran penjual baru yang menunggu verifikasi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-white rounded-2xl border border-[#CED2E3]/80 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 bg-amber-50 text-[#E59417] border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E59417]"></span>
                        Pending Review
                      </span>
                      <span className="text-[11px] text-[#6D6E70]">
                        {new Date(seller.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#171F3F]">{seller.name}</h3>
                    <p className="text-xs text-[#6D6E70] mb-4">{seller.email}</p>

                    <div className="bg-[#F5F6FA] rounded-xl p-3.5 border border-[#CED2E3]/60 mb-5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6D6E70]">Nama Usulan Toko:</span>
                        <span className="font-semibold text-[#171F3F]">
                          {seller.store_name || `Toko ${seller.name}`}
                        </span>
                      </div>
                      {seller.description && (
                        <div className="pt-1.5 border-t border-[#CED2E3]/40">
                          <span className="text-[#6D6E70] block mb-0.5">Deskripsi:</span>
                          <span className="text-[#2B2B2B] line-clamp-2 text-[11px]">
                            {seller.description}
                          </span>
                        </div>
                      )}
                      <div className="pt-1.5 border-t border-[#CED2E3]/40 flex items-center justify-between">
                        <span className="text-[#6D6E70]">Dokumen Bukti:</span>
                        {seller.document_url ? (
                          <a
                            href={seller.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-[#CED2E3]/30 text-[#283776] border border-[#CED2E3] rounded-lg text-xs font-semibold transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#283776]" />
                            <span>Buka Dokumen</span>
                            <ExternalLink className="w-3 h-3 text-[#6D6E70]" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#6D6E70] italic">Tidak dilampirkan</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#CED2E3]/60">
                    <button
                      type="button"
                      disabled={loadingId === seller.id}
                      onClick={() => handleDecision(seller.id, 'approved')}
                      className="flex-1 py-2.5 px-3 bg-[#63A357] hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {loadingId === seller.id ? (
                        <span>Memproses...</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve (Setujui)</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={loadingId === seller.id}
                      onClick={() => handleDecision(seller.id, 'rejected')}
                      className="flex-1 py-2.5 px-3 bg-white hover:bg-red-50 text-[#DC2626] border border-red-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject (Tolak)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Processed History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#CED2E3]/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2B2B2B]">
              <thead className="bg-[#F5F6FA] border-b border-[#CED2E3] text-[#6D6E70] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Nama Seller</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Nama Toko</th>
                  <th className="px-5 py-3.5">Dokumen</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F6FA]">
                {processedSellers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-[#6D6E70]">
                      Belum ada riwayat verifikasi seller.
                    </td>
                  </tr>
                ) : (
                  processedSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-[#F5F6FA]/50 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium">#{seller.id}</td>
                      <td className="px-5 py-4 font-semibold text-[#171F3F]">{seller.name}</td>
                      <td className="px-5 py-4 text-[#6D6E70]">{seller.email}</td>
                      <td className="px-5 py-4 font-medium">{seller.store_name || '-'}</td>
                      <td className="px-5 py-4">
                        {seller.document_url ? (
                          <a
                            href={seller.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#283776] hover:underline font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Lihat ↗</span>
                          </a>
                        ) : (
                          <span className="text-[#6D6E70] italic">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            seller.seller_status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {seller.seller_status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {seller.seller_status === 'approved' ? (
                          <button
                            type="button"
                            onClick={() => handleDecision(seller.id, 'rejected')}
                            className="px-2.5 py-1 bg-white hover:bg-red-50 text-[#DC2626] border border-red-200 rounded-lg text-[11px] font-medium transition-colors"
                          >
                            Batalkan (Tolak)
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDecision(seller.id, 'approved')}
                            className="px-2.5 py-1 bg-[#63A357] hover:bg-emerald-700 text-white rounded-lg text-[11px] font-medium transition-colors"
                          >
                            Setujui Ulang
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
