'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/actions/authActions';
import {
  BookOpen,
  Shield,
  Store,
  ShieldCheck,
  Users,
  Tags,
  Package,
  ClipboardList,
  Clock,
  User,
  Heart,
  ShoppingCart,
} from 'lucide-react';

export default function NavbarClient({ session, cartCount = 0, wishlistCount = 0 }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const homeHref = !session
    ? '/'
    : session.role === 'admin'
    ? '/admin'
    : session.role === 'seller'
    ? session.seller_status === 'approved' ? '/seller/products' : '/seller/pending'
    : '/';

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (session?.role === 'admin') {
      router.push(query ? `/admin/products?search=${encodeURIComponent(query)}` : '/admin/products');
    } else if (session?.role === 'seller') {
      router.push(query ? `/seller/products?search=${encodeURIComponent(query)}` : '/seller/products');
    } else {
      router.push(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback via API
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#CED2E3]/60 shadow-xs">
      {/* Top Banner Accent */}
      <div className="bg-[#171F3F] text-white text-xs py-1.5 px-4 text-center font-medium">
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#5FA2DD]" />
          StudyGear — Lengkapi Kebutuhan Belajar & Alat Tulismu dengan Kualitas Terbaik!
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* 1. Brand Logo */}
          <Link href={homeHref} className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#171F3F] to-[#283776] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              {/* StudyGear Book / Pen Icon */}
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-[#171F3F] leading-none">
                Study<span className="text-[#283776]">Gear</span>
              </span>
              <span className="text-[10px] text-[#6D6E70] font-medium tracking-wider uppercase mt-0.5">
                Stationery & Learning
              </span>
            </div>
          </Link>

          {/* 2. Search Bar (Center, Rounded Pill following reference) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  session?.role === 'admin'
                    ? 'Cari produk dalam katalog admin...'
                    : session?.role === 'seller'
                    ? 'Cari produk di toko Anda...'
                    : 'Cari alat tulis, buku catatan, perlengkapan belajar...'
                }
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-[#F5F6FA] text-[#2B2B2B] placeholder-[#6D6E70] rounded-full border border-transparent focus:border-[#283776] focus:bg-white focus:outline-none transition-all shadow-inner"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6D6E70]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                className="absolute inset-y-1 right-1 px-4 text-xs font-semibold text-white bg-[#171F3F] hover:bg-[#283776] rounded-full transition-colors flex items-center"
              >
                Cari
              </button>
            </div>
          </form>

          {/* 3. Right Icons & User Session */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick role shortcut badges for Admin & Seller */}
            {session?.role === 'admin' && (
              <Link
                href="/admin/verifications"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#171F3F] hover:bg-[#283776] rounded-full transition-colors shadow-xs"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}

            {session?.role === 'seller' && (
              <Link
                href={session.seller_status === 'approved' ? '/seller/products' : '/seller/pending'}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#283776] hover:bg-[#171F3F] rounded-full transition-colors shadow-xs"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Dashboard Toko</span>
              </Link>
            )}

            {/* Wishlist & Cart icons only for Buyer and Guest */}
            {(!session || session.role === 'buyer') && (
              <>
                {/* Wishlist Icon */}
                <Link
                  href={session ? '/buyer/wishlist' : '/login'}
                  className="relative p-2 text-[#2B2B2B] hover:text-[#283776] hover:bg-[#F5F6FA] rounded-full transition-colors"
                  title="Wishlist"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {session && wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E59417] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart Icon with badge count */}
                <Link
                  href={session ? '/buyer/cart' : '/login'}
                  className="relative p-2 text-[#2B2B2B] hover:text-[#283776] hover:bg-[#F5F6FA] rounded-full transition-colors"
                  title="Keranjang Belanja"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {session && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#283776] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Auth / Profile Area */}
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#F5F6FA] border border-[#CED2E3] transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-[#171F3F] text-white flex items-center justify-center text-sm font-semibold uppercase">
                    {session.name ? session.name.charAt(0) : 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left pr-2">
                    <span className="text-xs font-semibold text-[#2B2B2B] leading-tight max-w-[120px] truncate">
                      {session.name}
                    </span>
                    <span className="text-[10px] font-medium text-[#6D6E70] capitalize">
                      {session.role}
                    </span>
                  </div>
                  <svg className={`w-4 h-4 text-[#6D6E70] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-[#CED2E3] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-[#F5F6FA]">
                      <p className="text-sm font-semibold text-[#2B2B2B] truncate">{session.name}</p>
                      <p className="text-xs text-[#6D6E70] truncate">{session.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#171F3F] text-white">
                          {session.role}
                        </span>
                        {session.role === 'seller' && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${
                              session.seller_status === 'approved'
                                ? 'bg-[#63A357]'
                                : session.seller_status === 'rejected'
                                ? 'bg-[#DC2626]'
                                : 'bg-[#E59417]'
                            }`}
                          >
                            {session.seller_status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Links according to Role */}
                    <div className="py-1">
                      {session.role === 'admin' && (
                        <>
                          <Link
                            href="/admin/verifications"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#283776]" />
                            <span>Verifikasi Seller</span>
                          </Link>
                          <Link
                            href="/admin/users"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]"
                          >
                            <Users className="w-4 h-4 text-[#283776]" />
                            <span>Kelola Pengguna</span>
                          </Link>
                          <Link
                            href="/admin/categories"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]"
                          >
                            <Tags className="w-4 h-4 text-[#283776]" />
                            <span>Kelola Kategori</span>
                          </Link>
                          <Link
                            href="/admin/products"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]"
                          >
                            <Package className="w-4 h-4 text-[#283776]" />
                            <span>Moderasi Produk</span>
                          </Link>
                          <Link
                            href="/admin/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776] border-t border-[#CED2E3]/40"
                          >
                            <User className="w-4 h-4 text-[#283776]" />
                            <span>Profil Admin</span>
                          </Link>
                        </>
                      )}

                      {session.role === 'seller' && (
                        <>
                          {session.seller_status === 'approved' ? (
                            <>
                              <Link
                                href="/seller/products"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]"
                              >
                                <Package className="w-4 h-4 text-[#283776]" />
                                <span>Produk Saya</span>
                              </Link>
                              <Link
                                href="/seller/orders"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]"
                              >
                                <ClipboardList className="w-4 h-4 text-[#283776]" />
                                <span>Pesanan Masuk</span>
                              </Link>
                              <Link
                                href="/seller/store"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]"
                              >
                                <Store className="w-4 h-4 text-[#283776]" />
                                <span>Profil Toko</span>
                              </Link>
                            </>
                          ) : (
                            <Link
                              href="/seller/pending"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]"
                            >
                              <Clock className="w-4 h-4 text-[#E59417]" />
                              <span>Status Verifikasi</span>
                            </Link>
                          )}
                        </>
                      )}

                      {session.role === 'buyer' && (
                        <>
                          <Link
                            href="/buyer/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]"
                          >
                            <User className="w-4 h-4 text-[#283776]" />
                            <span>Profil Saya</span>
                          </Link>
                          <Link
                            href="/buyer/orders"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]"
                          >
                            <Package className="w-4 h-4 text-[#283776]" />
                            <span>Riwayat Pesanan</span>
                          </Link>
                          <Link
                            href="/buyer/wishlist"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]"
                          >
                            <Heart className="w-4 h-4 text-[#DC2626]" />
                            <span>Wishlist Saya</span>
                          </Link>
                          <Link
                            href="/buyer/cart"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]"
                          >
                            <ShoppingCart className="w-4 h-4 text-[#283776]" />
                            <span>Keranjang</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-[#F5F6FA] pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#DC2626] hover:bg-red-50 text-left transition-colors font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {isLoggingOut ? 'Sedang keluar...' : 'Keluar (Logout)'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#171F3F] hover:text-[#283776] transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#171F3F] hover:bg-[#283776] rounded-full transition-colors shadow-xs"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#2B2B2B] hover:bg-[#F5F6FA] rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari alat tulis, perlengkapan belajar..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#F5F6FA] rounded-full border border-[#CED2E3] focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6D6E70]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
