'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Store } from 'lucide-react';

export default function FooterClient({ session, homeHref }) {
  const pathname = usePathname();

  // Sembunyikan Footer di halaman Login & Register
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <footer className="bg-white border-t border-[#CED2E3] text-[#2B2B2B] mt-auto">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Description (Span 2 cols on lg) */}
          <div className="lg:col-span-2">
            <Link href={homeHref} className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#171F3F] to-[#283776] flex items-center justify-center text-white shadow-xs">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#171F3F]">
                Study<span className="text-[#283776]">Gear</span>
              </span>
            </Link>
            <p className="text-sm text-[#6D6E70] mb-6 max-w-sm leading-relaxed">
              Platform e-commerce alat tulis kantor, buku catatan, organizer meja, dan perlengkapan penunjang belajar terbaik untuk pelajar & mahasiswa Indonesia.
            </p>
          </div>

          {/* Column: Hubungi Kami */}
          <div>
            <h3 className="text-sm font-bold text-[#171F3F] uppercase tracking-wider mb-4">
              Layanan Pelanggan
            </h3>
            <ul className="space-y-3 text-sm text-[#6D6E70]">
              <li className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-[#283776] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-[#283776] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>halo@studygear.id</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-[#283776] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Makassar, Sulawesi Selatan</span>
              </li>
            </ul>
          </div>

          {/* Column: Kategori Populer */}
          <div>
            <h3 className="text-sm font-bold text-[#171F3F] uppercase tracking-wider mb-4">
              Kategori
            </h3>
            <ul className="space-y-2.5 text-sm text-[#6D6E70]">
              <li>
                <Link href="/products?category=1" className="hover:text-[#283776] transition-colors">
                  Alat Tulis & Pena
                </Link>
              </li>
              <li>
                <Link href="/products?category=2" className="hover:text-[#283776] transition-colors">
                  Buku Catatan & Kertas
                </Link>
              </li>
              <li>
                <Link href="/products?category=3" className="hover:text-[#283776] transition-colors">
                  Perlengkapan Meja
                </Link>
              </li>
              <li>
                <Link href="/products?category=4" className="hover:text-[#283776] transition-colors">
                  Binder & Organizer
                </Link>
              </li>
              <li>
                <Link href="/products?category=5" className="hover:text-[#283776] transition-colors">
                  Alat Gambar & Highlighters
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Navigasi Khusus Role */}
          {/* <div>
            <ul className="space-y-2.5 text-sm text-[#6D6E70]">
              {session?.role === 'admin' ? (
                <li>
                  <Link href="/admin" className="text-[#283776] font-semibold hover:underline inline-flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#283776]" />
                    <span>Panel Admin</span>
                  </Link>
                </li>
              ) : session?.role === 'seller' ? (
                <li>
                  <Link
                    href={session.seller_status === 'approved' ? '/seller/products' : '/seller/pending'}
                    className="text-[#283776] font-semibold hover:underline inline-flex items-center gap-1.5"
                  >
                    <Store className="w-3.5 h-3.5 text-[#283776]" />
                    <span>Dashboard Toko</span>
                  </Link>
                </li>
              ) : null}
            </ul>
          </div> */}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#CED2E3]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6D6E70]">
          <p>© 2026 StudyGear. Tugas Final Pemrograman Web. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="font-medium text-[#171F3F]">Pengiriman Cepat & Terpercaya</span>
            <span>•</span>
            <span className="font-medium text-[#171F3F]">100% Produk Original</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
