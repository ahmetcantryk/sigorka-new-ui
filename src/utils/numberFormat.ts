/**
 * Sayıyı binlik ayırıcı ile formatlar (örn: 100000 -> "100.000")
 * @param value - Formatlanacak sayı (string veya number)
 * @returns Formatlanmış string
 */
export const formatNumberWithDots = (value: string | number): string => {
  if (!value) return '';
  
  // String ise sadece rakamları al
  const numericValue = typeof value === 'string' 
    ? value.replace(/\D/g, '') 
    : value.toString();
  
  if (!numericValue) return '';
  
  // Sayıyı binlik ayırıcı ile formatla
  return parseInt(numericValue).toLocaleString('tr-TR');
};

/**
 * Formatlanmış sayıdan sadece rakamları çıkarır (örn: "100.000" -> "100000")
 * @param formattedValue - Formatlanmış sayı string'i
 * @returns Sadece rakamları içeren string
 */
export const removeNumberFormatting = (formattedValue: string): string => {
  if (!formattedValue) return '';
  return formattedValue.replace(/\D/g, '');
};

/**
 * Input onChange handler'ı için formatlanmış değer döner
 * @param value - Input'tan gelen değer
 * @param maxValue - Maksimum izin verilen değer
 * @returns Formatlanmış değer
 */
export const handleFormattedNumberChange = (value: string, maxValue?: number): string => {
  // Sadece rakamları al
  const numericValue = removeNumberFormatting(value);
  
  // Boşsa boş döndür
  if (!numericValue) return '';
  
  // Sayıya çevir
  const numberValue = parseInt(numericValue);
  
  // Maksimum değer kontrolü
  if (maxValue && numberValue > maxValue) {
    return formatNumberWithDots(maxValue);
  }
  
  return formatNumberWithDots(numberValue);
}; 