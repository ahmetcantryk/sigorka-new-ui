import { redirect } from 'next/navigation';

/**
 * Ferdi Kaza Teklif sayfası artık ürün detay sayfasına yönlendiriliyor
 * Form artık /ferdi-kaza-sigortasi sayfasının banner'ında yer alıyor
 */
export default function FerdiKazaTeklifPage() {
  redirect('/ferdi-kaza-sigortasi');
}
