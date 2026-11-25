import { getSession } from '@/lib/auth';
import FooterClient from './FooterClient';

export default async function Footer() {
  const session = await getSession();

  // Sembunyikan Footer untuk Admin dan Seller agar ruang kerja tabel data tidak terganggu footer belanja
  if (session && (session.role === 'admin' || session.role === 'seller')) {
    return null;
  }

  const homeHref = !session
    ? '/'
    : session.role === 'admin'
    ? '/admin'
    : session.role === 'seller'
    ? session.seller_status === 'approved' ? '/seller/products' : '/seller/pending'
    : '/';

  return <FooterClient session={session} homeHref={homeHref} />;
}
