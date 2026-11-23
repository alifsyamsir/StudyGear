'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { submitReview } from '@/actions/orderActions';
import { X, Package, Store, BookOpen, Star } from 'lucide-react';

export default function OrdersClient({ orders = [], isCheckoutSuccess = false }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [reviewModal, setReviewModal] = useState(null); // { orderId, productId, productName, initialRating, initialComment }
  const [submittingReview, setSubmittingReview] = useState(false);
  const [bannerAlert, setBannerAlert] = useState(
    isCheckoutSuccess
      ? {
          type: 'success',
          message:
            'Pesanan Anda berhasil dibuat! Rincian pesanan telah diteruskan ke toko penjual. Silakan pantau status proses di bawah.',
        }
      : null
  );

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  });

  const handleOpenReview = (orderId, item) => {
    setReviewModal({
      orderId,
      productId: item.product_id,
      productName: item.product_name,
      rating: item.review_rating || 5,
      comment: item.review_comment || '',
      isEdit: !!item.review_rating,
    });
    setBannerAlert(null);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModal) return;

    setSubmittingReview(true);
    setBannerAlert(null);

    try {
      const formData = new FormData();
      formData.append('order_id', reviewModal.orderId);
      formData.append('product_id', reviewModal.productId);
      formData.append('rating', reviewModal.rating);
      formData.append('comment', reviewModal.comment);

      const res = await submitReview(formData);
      if (res?.error) {
        setBannerAlert({ type: 'error', message: res.error });
      } else {
        setBannerAlert({ type: 'success', message: res.message });
        setReviewModal(null);
        router.refresh();
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setBannerAlert({ type: 'error', message: 'Gagal mengirimkan ulasan.' });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171F3F]">Riwayat Pesanan</h1>
          <p className="text-xs text-[#6D6E70] mt-1">
            Lacak status pengiriman dan berikan ulasan untuk pesanan yang telah selesai
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#CED2E3] text-xs font-semibold overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Semua' },
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

      {bannerAlert && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            bannerAlert.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{bannerAlert.message}</span>
          <button
            type="button"
            onClick={() => setBannerAlert(null)}
            className="text-xs font-bold p-1 hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-16 text-center shadow-xs">
          <Package className="w-12 h-12 text-[#CED2E3] mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#171F3F] mb-1">
            Tidak Ada Pesanan pada Kategori Ini
          </h2>
          <p className="text-xs text-[#6D6E70] max-w-sm mx-auto mb-5">
            Pesanan Anda akan tercatat di sini setelah melakukan checkout di keranjang belanja.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-semibold rounded-full transition-colors"
          >
            Jelajahi Produk
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-[#CED2E3]/80 p-6 shadow-xs space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F5F6FA]">
                <div className="flex items-center gap-3">
                  {/* <span className="font-mono font-bold text-xs bg-[#F5F6FA] px-2.5 py-1 rounded-lg text-[#171F3F] border border-[#CED2E3]">
                    #{order.id}
                  </span> */}
                  <div>
                    <span className="text-xs font-bold text-[#171F3F] inline-flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#283776]" />
                      <span>{order.store_name}</span>
                    </span>
                    <span className="text-[10px] text-[#6D6E70] block mt-0.5">
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

                <div className="flex items-center gap-2">
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
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#F5F6FA]">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-[#F5F6FA] border border-[#CED2E3] overflow-hidden shrink-0 flex items-center justify-center text-[#CED2E3]">
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
                        <Link
                          href={`/products/${item.product_id}`}
                          className="font-bold text-xs text-[#2B2B2B] hover:text-[#283776] line-clamp-1"
                        >
                          {item.product_name}
                        </Link>
                        <span className="text-xs text-[#6D6E70] block">
                          {item.quantity} × Rp {Number(item.price_at_purchase).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Review Button for 'Selesai' Orders */}
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-xs font-bold text-[#171F3F]">
                        Rp {(Number(item.price_at_purchase) * item.quantity).toLocaleString('id-ID')}
                      </span>

                      {order.status === 'Selesai' && (
                        <button
                          type="button"
                          onClick={() => handleOpenReview(order.id, item)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                            item.review_rating
                              ? 'bg-[#F5F6FA] text-[#171F3F] hover:bg-[#CED2E3]/40 border border-[#CED2E3]'
                              : 'bg-[#E59417] hover:bg-amber-600 text-white shadow-xs'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 text-[#E59417] fill-[#E59417]" />
                          <span>
                            {item.review_rating
                              ? `Ulasan: ${item.review_rating}/5`
                              : 'Beri Ulasan'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer & Shipping Address */}
              <div className="pt-3 border-t border-[#F5F6FA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-[#6D6E70]">
                  <span>Alamat Pengiriman: </span>
                  <span className="font-medium text-[#2B2B2B]">{order.shipping_address}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#6D6E70]">Total Belanja: </span>
                  <span className="font-extrabold text-sm text-[#171F3F]">
                    Rp {Number(order.total_price).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CED2E3] shadow-xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#CED2E3]/60">
              <div>
                <h3 className="font-bold text-base text-[#171F3F]">
                  {reviewModal.isEdit ? 'Ubah Ulasan Produk' : 'Tulis Ulasan & Rating'}
                </h3>
                <p className="text-xs text-[#6D6E70] truncate max-w-xs mt-0.5">
                  {reviewModal.productName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="text-[#6D6E70] hover:text-[#171F3F] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Rating Star Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                  Skor Rating (1 sampai 5 Bintang)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewModal((prev) => ({ ...prev, rating: star }))
                      }
                      className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewModal.rating
                            ? 'text-[#E59417] fill-[#E59417]'
                            : 'text-gray-300 fill-transparent'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#171F3F] ml-2">
                    {reviewModal.rating} dari 5 Bintang
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                  Komentar Ulasan
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewModal.comment}
                  onChange={(e) =>
                    setReviewModal((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  placeholder="Ceritakan kepuasan Anda mengenai kualitas alat tulis, ketebalan kertas, ketepatan barang, dll..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#CED2E3]/60">
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#6D6E70] hover:text-[#171F3F]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submittingReview ? 'Menyimpan...' : 'Kirim Ulasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
