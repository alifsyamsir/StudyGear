'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { moveToCart, removeFromWishlist } from '@/actions/cartActions';
import { X, Heart, BookOpen, Store } from 'lucide-react';

export default function WishlistClient({ wishlistItems = [] }) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const handleMoveToCart = async (productId) => {
    setProcessingId(productId);
    setAlert(null);

    try {
      const res = await moveToCart(productId);
      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        router.refresh();
      }
    } catch (err) {
      console.error('Move to cart error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemove = async (productId) => {
    setProcessingId(productId);
    setAlert(null);

    try {
      const res = await removeFromWishlist(productId);
      if (res?.error) {
        setAlert({ type: 'error', message: res.error });
      } else {
        setAlert({ type: 'success', message: res.message });
        router.refresh();
      }
    } catch (err) {
      console.error('Remove wishlist error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#171F3F]">Wishlist Saya</h1>
        <p className="text-xs text-[#6D6E70] mt-1">
          Koleksi produk alat tulis dan perlengkapan studi yang Anda simpan
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

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-16 text-center shadow-xs">
          <Heart className="w-14 h-14 text-[#CED2E3] mx-auto mb-4" />
          <h2 className="text-base font-bold text-[#171F3F] mb-1">
            Belum Ada Produk di Wishlist
          </h2>
          <p className="text-xs text-[#6D6E70] max-w-sm mx-auto mb-6">
            Tekan ikon hati pada produk apa pun di katalog untuk menyimpannya di sini.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-bold rounded-full transition-colors shadow-xs"
          >
            Jelajahi Katalog Produk →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#CED2E3]/70 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square bg-[#F5F6FA] relative flex items-center justify-center overflow-hidden">
                  <Link href={`/products/${item.product_id}`} className="w-full h-full block">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#CED2E3]">
                        <BookOpen className="w-10 h-10" />
                      </div>
                    )}
                  </Link>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.product_id)}
                    disabled={processingId === item.product_id}
                    title="Hapus dari Wishlist"
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#DC2626] flex items-center justify-center shadow-xs cursor-pointer transition-transform active:scale-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4">
                  <span className="text-[10px] text-[#6D6E70] truncate inline-flex items-center gap-1">
                    <Store className="w-3 h-3 text-[#6D6E70]" />
                    <span>{item.store_name}</span>
                  </span>
                  <Link href={`/products/${item.product_id}`}>
                    <h3 className="font-bold text-xs text-[#2B2B2B] hover:text-[#283776] line-clamp-2 mt-1">
                      {item.name}
                    </h3>
                  </Link>
                  <span className="text-sm font-extrabold text-[#171F3F] block mt-2">
                    Rp {Number(item.price).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-[#6D6E70] mt-0.5 block">
                    {item.stock > 0 ? `Sisa stok: ${item.stock}` : 'Stok habis'}
                  </span>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => handleMoveToCart(item.product_id)}
                  disabled={processingId === item.product_id || item.stock <= 0}
                  className="w-full py-2.5 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Pindahkan ke Keranjang</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
