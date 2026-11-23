'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addToCart, toggleWishlist } from '@/actions/cartActions';
import { BookOpen, Store, Star, Check } from 'lucide-react';

export default function ProductCard({ product, isBuyer = false, initialWishlisted = false }) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [addingCart, setAddingCart] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isBuyer) {
      router.push('/login?callbackUrl=/products/' + product.id);
      return;
    }

    // Optimistic toggle
    setWishlisted(!wishlisted);
    try {
      const res = await toggleWishlist(product.id);
      if (res?.error) {
        setWishlisted(wishlisted); // revert
      }
    } catch {
      setWishlisted(wishlisted);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isBuyer) {
      router.push('/login?callbackUrl=/products/' + product.id);
      return;
    }

    if (product.stock <= 0) return;

    setAddingCart(true);
    try {
      const res = await addToCart(product.id, 1);
      if (res?.success) {
        setAddedToast(true);
        setTimeout(() => setAddedToast(false), 2000);
      } else if (res?.error) {
        window.alert(res.error);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setAddingCart(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#CED2E3]/70 overflow-hidden hover:shadow-md hover:border-[#283776]/50 transition-all flex flex-col justify-between group">
      <div>
        {/* Image Container with Badges */}
        <div className="aspect-square bg-[#F5F6FA] relative flex items-center justify-center overflow-hidden">
          <Link href={`/products/${product.id}`} className="w-full h-full block">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#CED2E3]">
                <BookOpen className="w-12 h-12" />
              </div>
            )}
          </Link>

          {/* Category Badge */}
          {product.category_name && (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold bg-white/95 backdrop-blur-xs text-[#171F3F] rounded-full shadow-xs border border-[#CED2E3]/50">
              {product.category_name}
            </span>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlist}
            title={wishlisted ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#171F3F] flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 transition-colors ${
                wishlisted ? 'fill-[#DC2626] text-[#DC2626]' : 'text-[#6D6E70] hover:text-[#DC2626]'
              }`}
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

        {/* Content Details */}
        <div className="p-4">
          <div className="flex items-center justify-between text-[11px] text-[#6D6E70] mb-1">
            <span className="truncate font-medium inline-flex items-center gap-1">
              <Store className="w-3.5 h-3.5 shrink-0 text-[#6D6E70]" />
              <span className="truncate">{product.store_name}</span>
            </span>
            {Number(product.avg_rating) > 0 && (
              <span className="flex items-center gap-1 text-[#E59417] font-bold shrink-0">
                <Star className="w-3.5 h-3.5 text-[#E59417] fill-[#E59417]" />
                <span>{Number(product.avg_rating).toFixed(1)}</span>
              </span>
            )}
          </div>

          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-sm text-[#2B2B2B] hover:text-[#283776] line-clamp-2 leading-snug transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
      </div>

      {/* Price & Action Button */}
      <div className="p-4 pt-0">
        <div className="pt-3 border-t border-[#F5F6FA] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-[#6D6E70] block leading-tight">Harga</span>
            <span className="text-sm sm:text-base font-extrabold text-[#171F3F]">
              Rp {Number(product.price).toLocaleString('id-ID')}
            </span>
          </div>

          {/* Action button */}
          {product.stock <= 0 ? (
            <span className="px-3 py-1.5 bg-zinc-100 text-zinc-400 text-xs font-semibold rounded-xl">
              Habis
            </span>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingCart}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                addedToast
                  ? 'bg-[#63A357] text-white'
                  : 'bg-[#171F3F] hover:bg-[#283776] text-white'
              }`}
            >
              {addedToast ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </>
              ) : addingCart ? (
                <span>...</span>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>+ Keranjang</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
