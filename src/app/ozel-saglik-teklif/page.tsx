import { redirect } from 'next/navigation';

/**
 * Özel Sağlık Teklif sayfası artık ürün detay sayfasına yönlendiriliyor
 * Form artık /ozel-saglik-sigortasi sayfasının banner'ında yer alıyor
 */
export default function OzelSaglikTeklifPage() {
  redirect('/ozel-saglik-sigortasi');
}
