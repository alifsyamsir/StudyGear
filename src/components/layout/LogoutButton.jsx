'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/actions/authActions';
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutButton({ className = '', variant = 'sidebar' }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback API jika server action redirect tertahan di client
      try {
        await fetch('/api/auth', { method: 'DELETE' });
      } catch (e) {
        console.error('Fallback logout API error:', e);
      }
      router.push('/');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center justify-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200/80 hover:border-red-600 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group shadow-2xs ${className}`}
      title="Keluar dari akun"
    >
      {isLoggingOut ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-red-600 group-hover:text-white" />
      ) : (
        <LogOut className="w-4 h-4 shrink-0 text-red-600 group-hover:text-white transition-colors" />
      )}
      <span>{isLoggingOut ? 'Sedang keluar...' : 'Keluar (Logout)'}</span>
    </button>
  );
}
