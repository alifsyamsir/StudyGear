import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import ProductCard from '@/components/product/ProductCard';
import { BookOpen, Truck, CreditCard, ShieldCheck, PenTool, Package, ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const session = await getSession();

  // If user is Admin or Seller, automatically redirect to their respective management dashboards
  if (session) {
    if (session.role === 'admin') {
      redirect('/admin/verifications');
    }
    if (session.role === 'seller') {
      redirect(session.seller_status === 'approved' ? '/seller/products' : '/seller/pending');
    }
  }

  const isBuyer = session?.role === 'buyer';

  let categories = [];
  let featuredProducts = [];
  let wishlistIds = new Set();

  try {
    const catRes = await query('SELECT id, name FROM categories ORDER BY id ASC LIMIT 5');
    categories = catRes.rows;

    if (isBuyer) {
      const wishRes = await query('SELECT product_id FROM wishlists WHERE buyer_id = $1', [session.id]);
      wishlistIds = new Set(wishRes.rows.map((r) => r.product_id));
    }

    const prodQuery = isBuyer
      ? `SELECT p.id, p.name, p.price, p.stock, p.image_url, s.store_name, c.name AS category_name,
                COALESCE(AVG(r.rating), 0)::NUMERIC(2,1) AS avg_rating
         FROM products p
         JOIN stores s ON p.store_id = s.id
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN reviews r ON p.id = r.product_id
         GROUP BY p.id, s.store_name, c.name
         ORDER BY RANDOM() LIMIT 4`
      : `SELECT p.id, p.name, p.price, p.stock, p.image_url, s.store_name, c.name AS category_name,
                COALESCE(AVG(r.rating), 0)::NUMERIC(2,1) AS avg_rating
         FROM products p
         JOIN stores s ON p.store_id = s.id
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN reviews r ON p.id = r.product_id
         GROUP BY p.id, s.store_name, c.name
         ORDER BY p.created_at DESC LIMIT 4`;

    const prodRes = await query(prodQuery);
    featuredProducts = prodRes.rows;
  } catch (err) {
    console.error('Homepage data fetch error:', err.message);
  }

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* 1. Hero Section (referencing image.png) */}
      <section
        className="relative bg-cover bg-center bg-no-repeat text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-sm"
        style={{ backgroundImage: "url('/images/hero_bg1.jpg')" }}
      >
        {/* Overlay Deep Navy */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#171F3F]/85 via-[#171F3F]/10 to-[#171F3F]/80 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <span className="inline-block px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase text-[#CED2E3] border border-white/20">
              Koleksi Terbaik 2026
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Tingkatkan Semangat Belajarmu dengan <span className="text-[#5FA2DD]">StudyGear</span>
            </h1>
            <p className="text-base sm:text-lg text-[#CED2E3] max-w-xl leading-relaxed">
              Temukan buku catatan premium, pena berkualitas tinggi, organizer meja belajar minimalis, dan perlengkapan studi terbaik langsung dari mitra terpercaya.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <Link
                href="/products"
                className="px-6 py-3 bg-white text-[#171F3F] font-bold text-sm rounded-full shadow-md hover:bg-[#CED2E3] transition-colors inline-flex items-center gap-1.5"
              >
                <span>Jelajahi Katalog Lengkap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {!session && (
                <Link
                  href="/register"
                  className="px-6 py-3 border border-white/60 text-white font-semibold text-sm rounded-full hover:bg-white/10 transition-colors"
                >
                  Daftar Sekarang
                </Link>
              )}
            </div>
          </div>

          {/* Hero Illustration / Preview Box */}
          <div className="flex-1 max-w-md w-full">
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">Check out our Stationery</h2>
              <p className="text-xs text-[#CED2E3] mb-5">
                Kebutuhan sekolah & kuliah terlengkap dengan harga terjangkau!
              </p>
              <Link
                href="/products"
                className="w-full py-3 bg-white text-[#171F3F] hover:bg-[#CED2E3] rounded-full text-xs font-bold transition-colors uppercase tracking-wider inline-flex items-center justify-center gap-1.5"
              >
                <span>Lihat Produk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Feature Highlights (Shopping made easy! from image.png) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-[#171F3F]">Shopping made easy!</h2>
          <p className="text-xs sm:text-sm text-[#6D6E70] mt-1">
            Now shop at our store with complete convenience & trusted sellers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-6 rounded-2xl border border-[#CED2E3]/70 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#5FA2DD]/10 text-[#5FA2DD] flex items-center justify-center mb-4">
              <Truck className="w-7 h-7 text-[#5FA2DD]" />
            </div>
            <h3 className="font-bold text-[#171F3F] mb-1">Free and Fast delivery</h3>
            <p className="text-xs text-[#6D6E70] leading-relaxed">
              Pengiriman kilat dan aman langsung ke alamat tempat belajar atau rumah Anda.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#CED2E3]/70 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#63A357]/10 text-[#63A357] flex items-center justify-center mb-4">
              <CreditCard className="w-7 h-7 text-[#63A357]" />
            </div>
            <h3 className="font-bold text-[#171F3F] mb-1">Different payment options</h3>
            <p className="text-xs text-[#6D6E70] leading-relaxed">
              Checkout multi-toko praktis dan otomatis dengan rincian pesanan transparan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#CED2E3]/70 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#E59417]/10 text-[#E59417] flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-[#E59417]" />
            </div>
            <h3 className="font-bold text-[#171F3F] mb-1">Click and collect</h3>
            <p className="text-xs text-[#6D6E70] leading-relaxed">
              Pilih produk stationery favorit Anda, tambahkan ke wishlist, dan pesan kapan saja.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category (Cards membulat dari image.png) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#171F3F]">Shop by category</h2>
            <p className="text-xs text-[#6D6E70] mt-0.5">
              Pick the category you are looking for and start shopping now!
            </p>
          </div>
          <Link href="/products" className="text-xs font-semibold text-[#283776] hover:underline">
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="bg-white p-6 rounded-2xl border border-[#CED2E3]/70 text-center hover:border-[#283776] hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F5F6FA] group-hover:bg-[#171F3F] group-hover:text-white text-[#171F3F] flex items-center justify-center transition-colors mb-3">
                <PenTool className="w-6 h-6 transition-colors" />
              </div>
              <span className="text-xs font-bold text-[#2B2B2B] group-hover:text-[#283776] block">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Products Section (Rekomendasi untuk Buyer / Katalog Terbaru untuk Public) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#171F3F]">
              {isBuyer ? 'Rekomendasi Untukmu' : 'Produk Pilihan Terbaru'}
            </h2>
            <p className="text-xs text-[#6D6E70] mt-0.5">
              {isBuyer
                ? 'Daftar produk acak yang direkomendasikan spesial untuk melengkapi meja belajarmu'
                : 'Koleksi perlengkapan belajar terkini dari seluruh toko terverifikasi'}
            </p>
          </div>
          <Link href="/products" className="text-xs font-semibold text-[#283776] hover:underline">
            Lihat Semua Produk →
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#CED2E3] p-12 text-center shadow-xs">
            <Package className="w-12 h-12 text-[#CED2E3] mx-auto mb-3" />
            <h3 className="font-bold text-[#171F3F] text-base mb-1">Katalog Sedang Disiapkan</h3>
            <p className="text-xs text-[#6D6E70] max-w-sm mx-auto mb-4">
              Produk alat tulis akan segera hadir setelah penjual menambahkan koleksi mereka.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isBuyer={isBuyer}
                initialWishlisted={wishlistIds.has(p.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
