import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  ShieldAlert,
  TrendingUp,
  Users,
  Package,
  ArrowRight,
  Tags,
  CheckCircle2,
  Clock,
  Plus,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login?callbackUrl=/admin');
  }

  // 1. Fetch Key Metrics Data
  let metrics = {
    pendingVerifications: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalBuyers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalCategories: 0,
  };

  let pendingStores = [];
  let recentOrders = [];
  let categoryDistribution = [];

  try {
    // KPI 1: Pending Verifications
    const pendingRes = await query(
      "SELECT COUNT(*)::int AS total_pending FROM users WHERE role = 'seller' AND seller_status = 'pending'"
    );
    metrics.pendingVerifications = pendingRes.rows[0]?.total_pending || 0;

    // KPI 2: Total Revenue & Orders
    const orderRes = await query(
      "SELECT COALESCE(SUM(total_price), 0)::numeric AS total_revenue, COUNT(*)::int AS total_orders FROM orders WHERE status != 'Dibatalkan'"
    );
    metrics.totalRevenue = Number(orderRes.rows[0]?.total_revenue || 0);
    metrics.totalOrders = orderRes.rows[0]?.total_orders || 0;

    // KPI 3: Users Breakdown
    const userRes = await query(`
      SELECT 
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE role = 'buyer')::int AS total_buyers,
        COUNT(*) FILTER (WHERE role = 'seller' AND seller_status = 'approved')::int AS total_sellers
      FROM users
    `);
    metrics.totalUsers = userRes.rows[0]?.total_users || 0;
    metrics.totalBuyers = userRes.rows[0]?.total_buyers || 0;
    metrics.totalSellers = userRes.rows[0]?.total_sellers || 0;

    // KPI 4: Total Products & Categories
    const catalogRes = await query(`
      SELECT 
        (SELECT COUNT(*)::int FROM products) AS total_products,
        (SELECT COUNT(*)::int FROM categories) AS total_categories
    `);
    metrics.totalProducts = catalogRes.rows[0]?.total_products || 0;
    metrics.totalCategories = catalogRes.rows[0]?.total_categories || 0;

    // Action Section: Pending Store Approvals
    const pendingStoresRes = await query(`
      SELECT u.id, u.name, u.email, u.created_at, s.store_name, s.document_url
      FROM users u
      LEFT JOIN stores s ON u.id = s.seller_id
      WHERE u.role = 'seller' AND u.seller_status = 'pending'
      ORDER BY u.created_at DESC
      LIMIT 4
    `);
    pendingStores = pendingStoresRes.rows;

    // Recent Marketplace Orders
    const recentOrdersRes = await query(`
      SELECT o.id, o.total_price, o.status, o.created_at, u.name AS buyer_name, s.store_name
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      JOIN stores s ON o.store_id = s.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    recentOrders = recentOrdersRes.rows;

    // Category Breakdown
    const categoryRes = await query(`
      SELECT c.id, c.name, COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY product_count DESC
      LIMIT 5
    `);
    categoryDistribution = categoryRes.rows;
  } catch (err) {
    console.error('Error fetching admin dashboard data:', err);
  }

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header & Welcome Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#CED2E3]/80 shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#283776] bg-[#283776]/10 px-2.5 py-1 rounded-md">
            Overview Panel
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171F3F] mt-2">
            Selamat Datang, {session?.name || 'Administrator'}!
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6E70] mt-1">
            Pantau aktivitas transaksi, moderasi produk, dan verifikasi seller di platform StudyGear.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#171F3F] bg-[#F5F6FA] hover:bg-[#CED2E3]/50 border border-[#CED2E3] rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kategori Baru</span>
          </Link>
          <Link
            href="/admin/verifications"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#171F3F] hover:bg-[#283776] rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#E59417]" />
            <span>Cek Verifikasi</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid (4 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pending Verifications (Action Required) */}
        <div className="bg-white p-5 rounded-2xl border border-[#CED2E3]/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6D6E70]">Verifikasi Pending</span>
            <div className="w-9 h-9 rounded-xl bg-[#E59417]/10 text-[#E59417] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#171F3F]">
              {metrics.pendingVerifications}
            </div>
            <p className="text-[11px] text-[#6D6E70] mt-1">
              {metrics.pendingVerifications > 0 ? (
                <span className="text-[#E59417] font-semibold">Toko butuh peninjauan segera</span>
              ) : (
                <span className="text-[#63A357] font-semibold">Semua toko terverifikasi</span>
              )}
            </p>
          </div>
          <Link
            href="/admin/verifications"
            className="mt-4 pt-3 border-t border-[#F5F6FA] text-[11px] font-semibold text-[#283776] hover:underline flex items-center justify-between"
          >
            <span>Tinjau Dokumen</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* KPI 2: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#CED2E3]/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6D6E70]">Volume Transaksi</span>
            <div className="w-9 h-9 rounded-xl bg-[#283776]/10 text-[#283776] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#171F3F]">
              {formatRupiah(metrics.totalRevenue)}
            </div>
            <p className="text-[11px] text-[#6D6E70] mt-1">
              Dari <strong className="text-[#171F3F]">{metrics.totalOrders}</strong> pesanan berhasil
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F5F6FA] text-[11px] text-[#63A357] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Marketplace aktif</span>
          </div>
        </div>

        {/* KPI 3: Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-[#CED2E3]/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6D6E70]">Pengguna Terdaftar</span>
            <div className="w-9 h-9 rounded-xl bg-[#63A357]/10 text-[#63A357] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#171F3F]">
              {metrics.totalUsers}
            </div>
            <p className="text-[11px] text-[#6D6E70] mt-1">
              <strong className="text-[#171F3F]">{metrics.totalBuyers}</strong> Buyer &bull;{' '}
              <strong className="text-[#171F3F]">{metrics.totalSellers}</strong> Seller Aktif
            </p>
          </div>
          <Link
            href="/admin/users"
            className="mt-4 pt-3 border-t border-[#F5F6FA] text-[11px] font-semibold text-[#283776] hover:underline flex items-center justify-between"
          >
            <span>Kelola Pengguna</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* KPI 4: Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-[#CED2E3]/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6D6E70]">Katalog Stationery</span>
            <div className="w-9 h-9 rounded-xl bg-[#171F3F]/10 text-[#171F3F] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#171F3F]">
              {metrics.totalProducts}
            </div>
            <p className="text-[11px] text-[#6D6E70] mt-1">
              Tersebar di <strong className="text-[#171F3F]">{metrics.totalCategories}</strong> kategori
            </p>
          </div>
          <Link
            href="/admin/products"
            className="mt-4 pt-3 border-t border-[#F5F6FA] text-[11px] font-semibold text-[#283776] hover:underline flex items-center justify-between"
          >
            <span>Moderasi Produk</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. Middle Section: Pending Verifications & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Pending Verifications (Action Required) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#CED2E3]/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#E59417]" />
                <h2 className="text-base font-bold text-[#171F3F]">
                  Pendaftaran Toko Perlu Ditinjau
                </h2>
              </div>
              <Link
                href="/admin/verifications"
                className="text-xs font-semibold text-[#283776] hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingStores.length === 0 ? (
              <div className="text-center py-10 px-4 bg-[#F5F6FA] rounded-xl border border-dashed border-[#CED2E3]">
                <CheckCircle2 className="w-10 h-10 text-[#63A357] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#171F3F]">
                  Tidak Ada Pendaftaran Tertunda
                </p>
                <p className="text-xs text-[#6D6E70] mt-0.5">
                  Seluruh pengajuan verifikasi toko seller telah diproses dengan baik.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingStores.map((store) => (
                  <div
                    key={store.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#F5F6FA] hover:bg-[#CED2E3]/30 rounded-xl transition-colors border border-[#CED2E3]/50 gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#171F3F]">
                          {store.store_name || `Toko ${store.name}`}
                        </span>
                        <span className="px-2 py-0.5 bg-[#E59417]/15 text-[#E59417] text-[10px] font-bold rounded-md">
                          Pending
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6D6E70] mt-0.5">
                        Pemilik: {store.name} &bull; {store.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {store.document_url && (
                        <a
                          href={store.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-white text-[#6D6E70] hover:text-[#171F3F] border border-[#CED2E3] rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Dokumen</span>
                        </a>
                      )}
                      <Link
                        href="/admin/verifications"
                        className="px-3 py-1.5 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Tinjau
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#F5F6FA] text-[11px] text-[#6D6E70] flex items-center justify-between">
            <span>Verifikasi melindungi integritas katalog stationery StudyGear.</span>
            <span className="font-semibold text-[#171F3F]">{metrics.pendingVerifications} antrean</span>
          </div>
        </div>

        {/* Right (1 col): Category Distribution */}
        <div className="bg-white rounded-2xl border border-[#CED2E3]/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tags className="w-4 h-4 text-[#283776]" />
                <h2 className="text-base font-bold text-[#171F3F]">Kategori Utama</h2>
              </div>
              <Link
                href="/admin/categories"
                className="text-xs font-semibold text-[#283776] hover:underline"
              >
                Kelola
              </Link>
            </div>

            <div className="space-y-3">
              {categoryDistribution.map((cat) => {
                const percentage =
                  metrics.totalProducts > 0
                    ? Math.round((cat.product_count / metrics.totalProducts) * 100)
                    : 0;

                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#2B2B2B] truncate max-w-[160px]">
                        {cat.name}
                      </span>
                      <span className="text-[#6D6E70] font-medium">
                        {cat.product_count} produk ({percentage}%)
                      </span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full h-2 bg-[#F5F6FA] rounded-full overflow-hidden border border-[#CED2E3]/50">
                      <div
                        className="h-full bg-gradient-to-r from-[#171F3F] to-[#283776] rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F5F6FA]">
            <Link
              href="/admin/categories"
              className="text-xs font-semibold text-[#171F3F] hover:text-[#283776] inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Kelola & Tambah Kategori Baru &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Recent Marketplace Orders */}
      <div className="bg-white rounded-2xl border border-[#CED2E3]/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#283776]" />
            <h2 className="text-base font-bold text-[#171F3F]">
              Transaksi Terkini di Marketplace
            </h2>
          </div>
          <span className="text-xs text-[#6D6E70]">
            Memantau 5 transaksi terakhir dari seluruh toko
          </span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 px-4 bg-[#F5F6FA] rounded-xl border border-dashed border-[#CED2E3]">
            <Clock className="w-8 h-8 text-[#CED2E3] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#171F3F]">Belum Ada Transaksi</p>
            <p className="text-xs text-[#6D6E70] mt-0.5">
              Pesanan yang dilakukan oleh pembeli akan muncul secara real-time di tabel ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F6FA] text-[#6D6E70] uppercase font-bold text-[10px] tracking-wider border-b border-[#CED2E3]">
                <tr>
                  <th className="py-3 px-4">ID Pesanan</th>
                  <th className="py-3 px-4">Pembeli</th>
                  <th className="py-3 px-4">Toko Penjual</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Total Bayar</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F6FA]">
                {recentOrders.map((order) => {
                  let statusBadgeClass = 'bg-[#F5F6FA] text-[#6D6E70]';
                  if (order.status === 'Selesai') {
                    statusBadgeClass = 'bg-[#63A357]/15 text-[#63A357]';
                  } else if (order.status === 'Dibatalkan') {
                    statusBadgeClass = 'bg-[#DC2626]/15 text-[#DC2626]';
                  } else if (order.status === 'Diproses' || order.status === 'Dikirim') {
                    statusBadgeClass = 'bg-[#5FA2DD]/15 text-[#283776]';
                  } else {
                    statusBadgeClass = 'bg-[#E59417]/15 text-[#E59417]';
                  }

                  return (
                    <tr key={order.id} className="hover:bg-[#F5F6FA]/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#171F3F]">
                        #{order.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#2B2B2B]">
                        {order.buyer_name}
                      </td>
                      <td className="py-3 px-4 text-[#6D6E70]">{order.store_name}</td>
                      <td className="py-3 px-4 text-[#6D6E70]">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#171F3F]">
                        {formatRupiah(order.total_price)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${statusBadgeClass}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
