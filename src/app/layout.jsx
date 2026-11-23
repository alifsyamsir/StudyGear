import { Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata = {
  title: 'StudyGear — E-Commerce Alat Tulis & Penunjang Pembelajaran',
  description: 'Pusat belanja alat tulis, perlengkapan belajar, buku catatan, dan organizer meja belajar terlengkap.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F5F6FA] text-[#2B2B2B]">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
