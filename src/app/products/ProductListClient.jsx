'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { Search } from 'lucide-react';

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

  const [searchTerm, setSearchTerm] = useState(currentSearch);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilter({ search: searchTerm });
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

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#CED2E3]/80 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari alat tulis, buku, organizer..."
            className="w-full pl-10 pr-20 py-2.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-full focus:bg-white focus:outline-none focus:border-[#283776] transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6D6E70]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            className="absolute inset-y-1 right-1 px-4 text-xs font-semibold text-white bg-[#171F3F] hover:bg-[#283776] rounded-full transition-colors"
          >
            Cari
          </button>
        </form>

        {/* Category & Sorting Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6D6E70] hidden sm:inline">Kategori:</span>
            <select
              value={currentCategory || 'all'}
              onChange={(e) => applyFilter({ category: e.target.value })}
              className="px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
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
              className="px-3.5 py-2 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776]"
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
        <div className="flex items-center gap-2 text-xs text-[#6D6E70]">
          <span>Filter aktif:</span>
          {currentSearch && (
            <span className="px-2.5 py-1 bg-white border border-[#CED2E3] rounded-full text-[#171F3F] font-medium">
              Pencarian: "{currentSearch}"
            </span>
          )}
          {currentCategory && (
            <span className="px-2.5 py-1 bg-white border border-[#CED2E3] rounded-full text-[#171F3F] font-medium">
              Kategori: {categories.find((c) => c.id.toString() === currentCategory)?.name || currentCategory}
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
            Coba gunakan kata kunci pencarian yang berbeda atau hapus filter kategori.
          </p>
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="px-5 py-2.5 bg-[#171F3F] text-white text-xs font-semibold rounded-full hover:bg-[#283776] transition-colors"
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
