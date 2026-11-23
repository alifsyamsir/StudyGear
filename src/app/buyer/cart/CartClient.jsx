'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateCartQty, removeFromCart, checkoutCart } from '@/actions/cartActions';
import { X, ShoppingCart, Store, BookOpen } from 'lucide-react';

export default function CartClient({ cartItems = [], userAddress = '' }) {
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState(userAddress || '');
  const [updatingId, setUpdatingId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [bannerAlert, setBannerAlert] = useState(null);

  // Group items by store
  const storeMap = new Map();
  for (const item of cartItems) {
    if (!storeMap.has(item.store_id)) {
      storeMap.set(item.store_id, {
        store_name: item.store_name,
        items: [],
      });
    }
    storeMap.get(item.store_id).items.push(item);
  }

  const grandTotal = cartItems.reduce(
    (sum, it) => sum + Number(it.price) * it.quantity,
    0
  );
  const totalItemsCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  const handleQtyChange = async (cartId, newQty) => {
    setUpdatingId(cartId);
    setBannerAlert(null);

    try {
      const res = await updateCartQty(cartId, newQty);
      if (res?.error) {
        setBannerAlert({ type: 'error', message: res.error });
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Update qty error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (cartId) => {
    setUpdatingId(cartId);
    setBannerAlert(null);

    try {
      const res = await removeFromCart(cartId);
      if (res?.error) {
        setBannerAlert({ type: 'error', message: res.error });
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Remove cart item error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      setBannerAlert({ type: 'error', message: 'Harap masukkan alamat pengiriman sebelum checkout.' });
      return;
    }

    setCheckingOut(true);
    setBannerAlert(null);

    try {
      const res = await checkoutCart(shippingAddress.trim());
      if (res?.error) {
        setBannerAlert({ type: 'error', message: res.error });
        setCheckingOut(false);
      } else {
        router.push('/buyer/orders?checkout=success');
        router.refresh();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setBannerAlert({ type: 'error', message: 'Terjadi kesalahan sistem saat checkout.' });
      setCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#171F3F]">Keranjang Belanja</h1>
        <p className="text-xs text-[#6D6E70] mt-1">
          Periksa kembali pilihan alat tulis Anda dan konfirmasi alamat pengiriman
        </p>
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
            className="text-xs font-bold p-1 hover:opacity-75"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-16 text-center shadow-xs">
          <ShoppingCart className="w-14 h-14 text-[#CED2E3] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#171F3F] mb-1">
            Keranjang Belanja Anda Kosong
          </h2>
          <p className="text-xs text-[#6D6E70] max-w-sm mx-auto mb-6">
            Temukan berbagai buku catatan, pena, dan perlengkapan studi terbaik di katalog kami.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-bold rounded-full transition-colors shadow-xs"
          >
            Mulai Belanja Sekarang →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Cart Items by Store */}
          <div className="lg:col-span-2 space-y-5">
            {Array.from(storeMap.entries()).map(([storeId, storeGroup]) => (
              <div
                key={storeId}
                className="bg-white rounded-3xl border border-[#CED2E3]/80 p-6 shadow-xs"
              >
                {/* Store Header */}
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F5F6FA]">
                  <Store className="w-4 h-4 text-[#283776]" />
                  <span className="font-bold text-xs text-[#171F3F]">
                    {storeGroup.store_name}
                  </span>
                </div>

                {/* Items in this Store */}
                <div className="divide-y divide-[#F5F6FA]">
                  {storeGroup.items.map((it) => (
                    <div key={it.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      {/* Thumbnail & Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-[#F5F6FA] border border-[#CED2E3] shrink-0 overflow-hidden flex items-center justify-center text-[#CED2E3]">
                          {it.image_url ? (
                            <img
                              src={it.image_url}
                              alt={it.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-6 h-6" />
                          )}
                        </div>

                        <div>
                          <Link
                            href={`/products/${it.product_id}`}
                            className="font-bold text-xs text-[#2B2B2B] hover:text-[#283776] line-clamp-1"
                          >
                            {it.name}
                          </Link>
                          <span className="text-xs font-semibold text-[#171F3F] block mt-0.5">
                            Rp {Number(it.price).toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-[#6D6E70]">
                            Sisa stok: {it.stock} unit
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-[#CED2E3] rounded-xl overflow-hidden bg-[#F5F6FA]">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(it.id, it.quantity - 1)}
                            disabled={updatingId === it.id}
                            className="px-2.5 py-1 text-xs font-bold text-[#171F3F] hover:bg-white disabled:opacity-50 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-extrabold text-[#171F3F]">
                            {it.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(it.id, it.quantity + 1)}
                            disabled={updatingId === it.id || it.quantity >= it.stock}
                            className="px-2.5 py-1 text-xs font-bold text-[#171F3F] hover:bg-white disabled:opacity-50 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[80px] hidden sm:block">
                          <span className="text-xs font-bold text-[#171F3F]">
                            Rp {(Number(it.price) * it.quantity).toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Delete Item */}
                        <button
                          type="button"
                          onClick={() => handleRemove(it.id)}
                          disabled={updatingId === it.id}
                          className="p-1.5 text-zinc-400 hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
                          title="Hapus dari keranjang"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Col: Shipping Address & Checkout Summary */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-6 shadow-xs space-y-5">
              <h3 className="font-bold text-sm text-[#171F3F]">
                Alamat & Ringkasan Checkout
              </h3>

              {/* Shipping Address Input */}
              <div>
                <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                  Alamat Pengiriman Pesanan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Masukkan jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota/kabupaten..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
                />
              </div>

              {/* Order Calculation */}
              <div className="pt-4 border-t border-[#F5F6FA] space-y-2 text-xs">
                <div className="flex justify-between text-[#6D6E70]">
                  <span>Total Produk:</span>
                  <span className="font-medium text-[#171F3F]">{totalItemsCount} item</span>
                </div>
                <div className="flex justify-between text-[#6D6E70]">
                  <span>Jumlah Transaksi Toko:</span>
                  <span className="font-medium text-[#171F3F]">{storeMap.size} toko</span>
                </div>
                <div className="flex justify-between text-[#6D6E70]">
                  <span>Ongkos Kirim:</span>
                  <span className="font-bold text-[#63A357]">GRATIS (Promo 2026)</span>
                </div>
                <div className="pt-3 border-t border-[#CED2E3]/60 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#171F3F]">Total Pembayaran:</span>
                  <span className="text-xl font-extrabold text-[#171F3F]">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full py-3 px-4 bg-[#171F3F] hover:bg-[#283776] text-white text-xs sm:text-sm font-bold rounded-2xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {checkingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Memproses Transaksi...</span>
                  </>
                ) : (
                  <span>Checkout Sekarang ({totalItemsCount})</span>
                )}
              </button>

              <p className="text-[11px] text-[#6D6E70] text-center leading-relaxed">
                Stok produk akan berkurang otomatis dan status awal pesanan adalah <strong>"Menunggu Pembayaran"</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
