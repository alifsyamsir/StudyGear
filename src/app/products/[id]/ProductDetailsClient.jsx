'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addToCart, toggleWishlist } from '@/actions/cartActions';
import { AlertCircle, CheckCircle, X, BookOpen, Store, Star, MessageSquare } from 'lucide-react';

export default function ProductDetailsClient({
  product,
  reviews = [],
  isBuyer = false,
  session = null,
  initialWishlisted = false,
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [addingCart, setAddingCart] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleWishlist = async () => {
    if (!isBuyer) {
      router.push(`/login?callbackUrl=/products/${product.id}`);
      return;
    }

    setWishlisted(!wishlisted);
    try {
      const res = await toggleWishlist(product.id);
      if (res?.message) {
        setToastMessage({ type: 'success', text: res.message });
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch {
      setWishlisted(wishlisted);
    }
  };

  const handleAddToCart = async () => {
    if (!isBuyer) {
      router.push(`/login?callbackUrl=/products/${product.id}`);
      return;
    }

    if (quantity > product.stock) {
      setToastMessage({ type: 'error', text: 'Kuantitas melebihi sisa stok yang tersedia.' });
      return;
    }

    setAddingCart(true);
    try {
      const res = await addToCart(product.id, quantity);
      if (res?.success) {
        setToastMessage({ type: 'success', text: res.message });
        setTimeout(() => setToastMessage(null), 3000);
      } else if (res?.error) {
        setToastMessage({ type: 'error', text: res.error });
      }
    } catch (err) {
      console.error('Add to cart detail error:', err);
    } finally {
      setAddingCart(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold p-1 hover:opacity-75 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#6D6E70]">
        <Link
          href={
            session?.role === 'admin'
              ? '/admin/verifications'
              : session?.role === 'seller'
              ? session.seller_status === 'approved' ? '/seller/products' : '/seller/pending'
              : '/'
          }
          className="hover:text-[#171F3F]"
        >
          Beranda
        </Link>
        <span>/</span>
        <Link
          href={
            session?.role === 'admin'
              ? '/admin/products'
              : session?.role === 'seller'
              ? session.seller_status === 'approved' ? '/seller/products' : '/seller/pending'
              : '/products'
          }
          className="hover:text-[#171F3F]"
        >
          {session?.role === 'admin' || session?.role === 'seller' ? 'Produk' : 'Katalog'}
        </Link>
        <span>/</span>
        <span className="text-[#171F3F] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-[#CED2E3]/80 shadow-xs">
        {/* Product Image Gallery */}
        <div className="aspect-square bg-[#F5F6FA] rounded-2xl overflow-hidden border border-[#CED2E3]/70 flex items-center justify-center relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-[#CED2E3]">
              <BookOpen className="w-16 h-16" />
            </div>
          )}

          {product.category_name && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-xs text-[#171F3F] text-xs font-bold rounded-full shadow-xs border border-[#CED2E3]/60">
              {product.category_name}
            </span>
          )}
        </div>

        {/* Product Info & Action Box */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            {/* Store & Rating */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-semibold text-[#283776] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#283776]" />
                <span>{product.store_name}</span>
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#E59417] font-bold">
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[#E59417] fill-[#E59417]" />
                  <span>{Number(product.avg_rating) > 0 ? Number(product.avg_rating).toFixed(1) : 'Belum ada rating'}</span>
                </span>
                <span className="text-[#6D6E70] font-normal">({reviews.length} ulasan)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171F3F] leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="bg-[#F5F6FA] p-4 rounded-2xl border border-[#CED2E3]/60 mb-6 flex items-baseline gap-2">
              <span className="text-xs text-[#6D6E70]">Harga:</span>
              <span className="text-3xl font-extrabold text-[#171F3F]">
                Rp {Number(product.price).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xs font-bold text-[#171F3F] uppercase tracking-wider">
                Deskripsi Produk
              </h3>
              <p className="text-xs sm:text-sm text-[#6D6E70] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Stock Availability */}
            <div className="flex items-center gap-2 text-xs mb-6">
              <span className="text-[#6D6E70]">Status Ketersediaan:</span>
              {product.stock > 0 ? (
                <span className="font-bold text-[#63A357] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Tersedia ({product.stock} unit)
                </span>
              ) : (
                <span className="font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  Stok Habis
                </span>
              )}
            </div>
          </div>

          {/* Action Box */}
          <div className="pt-6 border-t border-[#CED2E3]/60 space-y-4">
            {isBuyer ? (
              <>
                {product.stock > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-[#171F3F]">Jumlah:</span>
                    <div className="flex items-center border border-[#CED2E3] rounded-xl overflow-hidden bg-[#F5F6FA]">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="px-3.5 py-1.5 text-sm font-bold text-[#171F3F] hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 text-xs font-extrabold text-[#171F3F]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="px-3.5 py-1.5 text-sm font-bold text-[#171F3F] hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[11px] text-[#6D6E70]">
                      Subtotal: <strong className="text-[#171F3F]">Rp {(Number(product.price) * quantity).toLocaleString('id-ID')}</strong>
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingCart || product.stock <= 0}
                    className="flex-1 py-3 px-6 bg-[#171F3F] hover:bg-[#283776] text-white text-xs sm:text-sm font-bold rounded-2xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {addingCart ? (
                      <span>Menambahkan...</span>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Tambah ke Keranjang</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWishlist}
                    className={`p-3 rounded-2xl border transition-colors cursor-pointer flex items-center justify-center ${
                      wishlisted
                        ? 'bg-red-50 border-red-200 text-[#DC2626]'
                        : 'bg-[#F5F6FA] border-[#CED2E3] text-[#6D6E70] hover:text-[#DC2626]'
                    }`}
                    title={wishlisted ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={wishlisted ? 'currentColor' : 'none'}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
              </>
            ) : session?.role === 'admin' ? (
              <div className="bg-[#F5F6FA] p-5 rounded-2xl border border-[#CED2E3]/60 text-center space-y-2">
                <span className="inline-block px-3 py-1 bg-[#171F3F] text-white text-[11px] font-bold rounded-full">
                  Mode Administrator
                </span>
                <p className="text-xs text-[#6D6E70]">
                  Anda masuk sebagai Administrator. Anda dapat mengelola, memantau, atau menghapus produk ini melalui panel moderasi produk.
                </p>
                <div className="pt-2">
                  <Link
                    href="/admin/products"
                    className="inline-block py-2.5 px-6 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-bold rounded-full transition-colors shadow-xs"
                  >
                    Buka Panel Moderasi Produk
                  </Link>
                </div>
              </div>
            ) : session?.role === 'seller' ? (
              <div className="bg-[#F5F6FA] p-5 rounded-2xl border border-[#CED2E3]/60 text-center space-y-2">
                <span className="inline-block px-3 py-1 bg-[#283776] text-white text-[11px] font-bold rounded-full">
                  Mode Penjual
                </span>
                <p className="text-xs text-[#6D6E70]">
                  Anda masuk sebagai Penjual. Akun penjual tidak dapat membeli produk. Silakan kelola katalog produk dan pesanan toko Anda di dashboard penjual.
                </p>
                <div className="pt-2">
                  <Link
                    href={session.seller_status === 'approved' ? '/seller/products' : '/seller/pending'}
                    className="inline-block py-2.5 px-6 bg-[#283776] hover:bg-[#171F3F] text-white text-xs font-bold rounded-full transition-colors shadow-xs"
                  >
                    Buka Dashboard Produk Toko
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-[#F5F6FA] p-4 rounded-2xl border border-[#CED2E3]/60 text-center">
                <p className="text-xs text-[#6D6E70] mb-3">
                  Masuk sebagai Pembeli untuk menambahkan produk ini ke keranjang atau wishlist.
                </p>
                <Link
                  href={`/login?callbackUrl=/products/${product.id}`}
                  className="inline-block py-2.5 px-6 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-bold rounded-full transition-colors shadow-xs"
                >
                  Masuk untuk Membeli
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#CED2E3]/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#CED2E3]/60">
          <div>
            <h2 className="text-xl font-bold text-[#171F3F]">Ulasan Pembeli</h2>
            <p className="text-xs text-[#6D6E70] mt-0.5">
              Review asli dari pembeli yang telah menerima pesanan ini
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[#171F3F] inline-flex items-center gap-1.5 justify-end">
              <Star className="w-5 h-5 text-[#E59417] fill-[#E59417]" />
              <span>{Number(product.avg_rating) > 0 ? Number(product.avg_rating).toFixed(1) : '-'}</span>
            </span>
            <span className="text-xs text-[#6D6E70] block">
              dari 5.0 ({reviews.length} ulasan)
            </span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="py-12 text-center text-[#6D6E70]">
            <MessageSquare className="w-10 h-10 text-[#CED2E3] mx-auto mb-2" />
            <p className="font-semibold text-xs text-[#171F3F]">Belum ada ulasan untuk produk ini</p>
            <p className="text-[11px] text-[#6D6E70] mt-0.5">
              Jadilah pembeli pertama yang memberikan penilaian setelah pesanan selesai!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F6FA] space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#171F3F] text-white text-xs font-bold flex items-center justify-center">
                      {rev.buyer_name ? rev.buyer_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-bold text-xs text-[#171F3F]">{rev.buyer_name}</span>
                  </div>
                  <span className="text-[10px] text-[#6D6E70]">
                    {new Date(rev.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Star display */}
                <div className="flex items-center gap-1 text-[#E59417] mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating
                          ? 'text-[#E59417] fill-[#E59417]'
                          : 'text-gray-300 fill-transparent'
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-bold text-[#171F3F] ml-1">
                    {rev.rating}/5
                  </span>
                </div>

                <p className="text-xs text-[#2B2B2B] leading-relaxed bg-[#F5F6FA] p-3 rounded-xl">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
