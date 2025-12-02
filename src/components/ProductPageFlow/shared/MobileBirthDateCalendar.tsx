'use client';

import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
import { useMemo } from 'react';

// Türkçe locale'yi tek bir yerde tanımla
addLocale('tr', {
  firstDayOfWeek: 1,
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Paz', 'Pts', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  dayNamesMin: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
  monthNames: [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  today: 'Bugün',
  clear: 'Temizle',
});

interface MobileBirthDateCalendarProps {
  value: string | null | undefined; // YYYY-MM-DD veya ''
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

/**
 * Mobil için ortak doğum tarihi seçici.
 * - Görünen format: dd.mm.yyyy
 * - API formatı: YYYY-MM-DD (string)
 * - Input manuel yazmaya kapalı (readOnlyInput)
 */
const MobileBirthDateCalendar = ({
  value,
  onChange,
  onBlur,
  disabled = false,
}: MobileBirthDateCalendarProps) => {
  const dateValue = useMemo(() => {
    if (!value) return null;
    // value zaten YYYY-MM-DD, doğrudan new Date ile okutuyoruz
    return new Date(value);
  }, [value]);

  return (
    <Calendar
      id="birthDate"
      value={dateValue}
      onChange={(e) => {
        const date = e.value as Date | null;
        if (!date) {
          onChange('');
          return;
        }
        // Tarihi timezone'dan bağımsız, local olarak YYYY-MM-DD'ye çevir
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        onChange(`${year}-${month}-${day}`);
      }}
      onBlur={onBlur}
      disabled={disabled}
      locale="tr"
      touchUI
      showIcon
      readOnlyInput
      maxDate={new Date()}
      minDate={new Date(1900, 0, 1)}
      dateFormat="dd.mm.yy"
      placeholder="gg.aa.yyyy"
      panelClassName="pp-calendar-panel"
    />
  );
};

export default MobileBirthDateCalendar;


