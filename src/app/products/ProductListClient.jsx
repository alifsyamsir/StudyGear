'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function ProductListClient({
  products = [],
  categories = [],
  currentSearch = '',
  currentCategory = '',
  currentSort = 'latest',
  isBuyer = false,
  wishlistIds = [],
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wishlistSet = new Set(wishlistIds);

  const applyFilter = ({ search, category, sort }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (search !== undefined) {
      if (search.trim()) params.set('search', search.trim());
      else params.delete('search');
    }

    if (category !== undefined) {
      if (category && category !== 'all') params.set('category', category);
      else params.delete('category');
    }

    if (sort !== undefined) {
      if (sort && sort !== 'latest') params.set('sort', sort);
      else params.delete('sort');
    }

    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#6D6E70]">
        <Link href="/" className="hover:text-[#171F3F] transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <span className="text-[#171F3F] font-semibold">Katalog</span>
      </nav>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#171F3F]">Katalog Perlengkapan Belajar</h1>
        <p className="text-xs sm:text-sm text-[#6D6E70] mt-1">
          Jelajahi berbagai pilihan stationery, alat tulis, dan aksesoris meja terbaik
        </p>
      </div>

      {/* Filter Bar (Cleaned from duplicate search bar) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#CED2E3]/80 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Left: Filter Indicator */}
        <div className="flex items-center gap-2.5 text-xs text-[#171F3F] self-start sm:self-auto">
          <div className="w-8 h-8 rounded-xl bg-[#283776]/10 text-[#283776] flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block">Filter & Urutan</span>
            <span className="text-[11px] text-[#6D6E70]">
              Menampilkan {products.length} produk pilihan
            </span>
          </div>
        </div>

        {/* Right: Category & Sorting Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6D6E70] hidden sm:inline">Kategori:</span>
            <select
              value={currentCategory || 'all'}
              onChange={(e) => applyFilter({ category: e.target.value })}
              className="px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776] cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6D6E70] hidden sm:inline">Urutan:</span>
            <select
              value={currentSort || 'latest'}
              onChange={(e) => applyFilter({ sort: e.target.value })}
              className="px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776] cursor-pointer"
            >
              <option value="latest">Terbaru</option>
              <option value="price_asc">Harga: Termurah</option>
              <option value="price_desc">Harga: Termahal</option>
              <option value="oldest">Terlama</option>
            </select>
          </div>

          {(currentSearch || currentCategory || currentSort !== 'latest') && (
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-red-50 border border-red-200 rounded-xl transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {(currentSearch || currentCategory) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6D6E70]">
          <span>Filter aktif:</span>
          {currentSearch && (
            <span className="px-3 py-1 bg-white border border-[#CED2E3] rounded-full text-[#171F3F] font-medium inline-flex items-center gap-1.5 shadow-2xs">
              <span>
                Pencarian: <strong>&ldquo;{currentSearch}&rdquo;</strong>
              </span>
              <button
                type="button"
                onClick={() => applyFilter({ search: '' })}
                className="text-[#6D6E70] hover:text-[#DC2626] p-0.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                title="Hapus filter pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {currentCategory && (
            <span className="px-3 py-1 bg-white border border-[#CED2E3] rounded-full text-[#171F3F] font-medium inline-flex items-center gap-1.5 shadow-2xs">
              <span>
                Kategori:{' '}
                <strong>
                  {categories.find((c) => c.id.toString() === currentCategory)?.name || currentCategory}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => applyFilter({ category: 'all' })}
                className="text-[#6D6E70] hover:text-[#DC2626] p-0.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                title="Hapus filter kategori"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-16 text-center shadow-xs">
          <Search className="w-12 h-12 text-[#CED2E3] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#171F3F] mb-1">
            Tidak Ada Produk yang Ditemukan
          </h2>
          <p className="text-xs text-[#6D6E70] max-w-sm mx-auto mb-5">
            Coba gunakan kata kunci pencarian yang berbeda di bilah navigasi atas atau hapus filter kategori.
          </p>
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="px-5 py-2.5 bg-[#171F3F] text-white text-xs font-semibold rounded-full hover:bg-[#283776] transition-colors cursor-pointer"
          >
            Tampilkan Semua Produk
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isBuyer={isBuyer}
              initialWishlisted={wishlistSet.has(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
