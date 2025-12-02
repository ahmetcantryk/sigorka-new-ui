import { redirect } from 'next/navigation';

/**
 * Yabancı Sağlık Teklif sayfası artık ürün detay sayfasına yönlendiriliyor
 * Form artık /yabanci-saglik-sigortasi sayfasının banner'ında yer alıyor
 */
export default function YabanciSaglikTeklifPage() {
  redirect('/yabanci-saglik-sigortasi');
}
