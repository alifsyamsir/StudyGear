'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/actions/orderActions';
import { X, ClipboardList, Check, BookOpen, MapPin } from 'lucide-react';

export default function SellerOrdersClient({ orders = [] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setAlert(null);

    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        router.refresh();
      }
    } catch (err) {
      console.error('Update order status error:', err);
      setAlert({ type: 'error', message: 'Gagal memperbarui status pesanan.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171F3F]">Pesanan Masuk</h1>
          <p className="text-xs text-[#6D6E70] mt-1">
            Kelola transaksi dan perbarui status proses pengiriman pesanan toko Anda
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#CED2E3] text-xs font-semibold overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Semua Pesanan' },
            { id: 'Menunggu Pembayaran', label: 'Menunggu Pembayaran' },
            { id: 'Diproses', label: 'Diproses' },
            { id: 'Selesai', label: 'Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#171F3F] text-white shadow-xs'
                  : 'text-[#6D6E70] hover:text-[#171F3F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
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

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-16 text-center shadow-xs">
          <ClipboardList className="w-12 h-12 text-[#CED2E3] mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#171F3F] mb-1">
            Tidak Ada Pesanan pada Kategori Ini
          </h2>
          <p className="text-xs text-[#6D6E70] max-w-sm mx-auto">
            Seluruh pesanan masuk dari pembeli akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-[#CED2E3]/80 p-6 shadow-xs space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F5F6FA]">
                <div className="flex items-center gap-3">
                  {/* <span className="font-mono font-bold text-xs bg-[#F5F6FA] px-2.5 py-1 rounded-lg text-[#171F3F] border border-[#CED2E3]">
                    #{order.id}
                  </span> */}
                  <div>
                    <span className="text-xs font-bold text-[#171F3F]">
                      Pembeli: {order.buyer_name} ({order.buyer_email})
                    </span>
                    <span className="text-[10px] text-[#6D6E70] block">
                      Waktu Transaksi:{' '}
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Status Badge & Sequence Action */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Diproses'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status}
                  </span>

                  {/* Sequential Transition Actions */}
                  {order.status === 'Menunggu Pembayaran' && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, 'Diproses')}
                      className="px-3.5 py-1.5 bg-[#283776] hover:bg-[#171F3F] text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {updatingId === order.id ? 'Memproses...' : 'Proses Pesanan →'}
                    </button>
                  )}

                  {order.status === 'Diproses' && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusChange(order.id, 'Selesai')}
                      className="px-3.5 py-1.5 bg-[#63A357] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {updatingId === order.id ? (
                        <span>Menyelesaikan...</span>
                      ) : (
                        <>
                          <span>Selesaikan Pesanan</span>
                          <Check className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#F5F6FA]">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#F5F6FA] border border-[#CED2E3] overflow-hidden shrink-0 flex items-center justify-center text-[#CED2E3]">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-[#2B2B2B]">
                          {item.product_name}
                        </span>
                        <span className="text-[11px] text-[#6D6E70] block">
                          {item.quantity} × Rp {Number(item.price_at_purchase).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#171F3F]">
                        Rp {(Number(item.price_at_purchase) * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address & Total */}
              <div className="pt-3 border-t border-[#F5F6FA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-[#6D6E70] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#6D6E70] shrink-0" />
                  <span>Tujuan Pengiriman: </span>
                  <span className="font-semibold text-[#171F3F]">{order.shipping_address}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#6D6E70]">Total Transaksi: </span>
                  <span className="font-extrabold text-sm text-[#171F3F]">
                    Rp {Number(order.total_price).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
