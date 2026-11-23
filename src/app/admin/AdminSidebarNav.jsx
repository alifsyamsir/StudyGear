'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Users, Tags, Package, UserCircle } from 'lucide-react';

export default function AdminSidebarNav() {
  const pathname = usePathname();

  const links = [
    {
      href: '/admin/verifications',
      label: 'Verifikasi Seller',
      icon: ShieldCheck,
      description: 'Persetujuan pendaftaran toko',
    },
    {
      href: '/admin/users',
      label: 'Manajemen Pengguna',
      icon: Users,
      description: 'Kelola Admin, Seller, Buyer',
    },
    {
      href: '/admin/categories',
      label: 'Kelola Kategori',
      icon: Tags,
      description: 'Kategori produk stationery',
    },
    {
      href: '/admin/products',
      label: 'Moderasi Produk',
      icon: Package,
      description: 'Pantau seluruh produk',
    },
    {
      href: '/admin/profile',
      label: 'Profil Admin',
      icon: UserCircle,
      description: 'Kelola akun & kata sandi',
    },
  ];

  return (
    <nav className="space-y-1.5">
      {links.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const IconComponent = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'bg-[#171F3F] text-white shadow-xs'
                : 'text-[#2B2B2B] hover:bg-[#F5F6FA] hover:text-[#283776]'
            }`}
          >
            <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#283776]'}`} />
            <div className="flex flex-col text-left">
              <span>{item.label}</span>
              <span
                className={`text-[10px] font-normal ${
                  isActive ? 'text-[#CED2E3]' : 'text-[#6D6E70]'
                }`}
              >
                {item.description}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
