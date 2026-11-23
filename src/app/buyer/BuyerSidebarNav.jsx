'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Package, Heart, User } from 'lucide-react';

export default function BuyerSidebarNav() {
  const pathname = usePathname();

  const links = [
    {
      href: '/buyer/cart',
      label: 'Keranjang Belanja',
      icon: ShoppingCart,
      description: 'Item siap checkout',
    },
    {
      href: '/buyer/orders',
      label: 'Riwayat Pesanan',
      icon: Package,
      description: 'Lacak status & beri ulasan',
    },
    {
      href: '/buyer/wishlist',
      label: 'Wishlist Saya',
      icon: Heart,
      description: 'Koleksi produk favorit',
    },
    {
      href: '/buyer/profile',
      label: 'Profil & Alamat',
      icon: User,
      description: 'Alamat pengiriman default',
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
