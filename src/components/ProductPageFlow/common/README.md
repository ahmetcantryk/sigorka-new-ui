# Product Page Flow - Common Components

Bu klasör, product-flow içinde tüm branşlarda (Kasko, Trafik, İMM, vb.) kullanılabilecek global component'leri içerir.

## UpdateVehicleModal

Kayıtlı araçları güncelleme için kullanılan modal component'i.

### Özellikler

- ✅ Tam validasyon sistemi (AddVehicleModal'dan alındı)
- ✅ Plaka şehir kodu, marka, model, yıl seçimi
- ✅ Motor ve şasi numarası validasyonu
- ✅ Belge seri kodu/no (plakalı araçlar için)
- ✅ Aksesuarlar (Ses, Ekran, Diğer)
- ✅ Kasko ve Trafik eski poliçe bilgileri
- ✅ Dain-i Mürtehin (Banka/Finans Kurumu)
- ✅ API entegrasyonu (PUT /api/customers/{customerId}/vehicles/{vehicleId})
- ✅ Responsive tasarım
- ✅ Product-flow stil sistemi ile uyumlu

### Kullanım

```tsx
import { UpdateVehicleModal } from '@/components/ProductPageFlow/common';

// Component içinde
const [showUpdateModal, setShowUpdateModal] = useState(false);
const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

// Edit icon'a tıklandığında
const handleEditVehicle = (vehicleId: string, e: React.MouseEvent) => {
  e.stopPropagation();
  setEditingVehicleId(vehicleId);
  setShowUpdateModal(true);
};

// Güncelleme başarılı olduğunda
const handleUpdateSuccess = () => {
  refetchVehicles(); // Araç listesini yenile
  setShowUpdateModal(false);
  setEditingVehicleId(null);
};

// Render
{showUpdateModal && editingVehicleId && (
  <UpdateVehicleModal
    vehicleId={editingVehicleId}
    onClose={() => setShowUpdateModal(false)}
    onSuccess={handleUpdateSuccess}
  />
)}
```

### Props

| Prop | Tip | Açıklama |
|------|-----|----------|
| `vehicleId` | `string` | Güncellenecek aracın ID'si |
| `onClose` | `() => void` | Modal kapandığında çağrılır |
| `onSuccess` | `() => void` | Güncelleme başarılı olduğunda çağrılır |

### Validasyon Kuralları

#### Plaka
- **Plaka İl Kodu**: Zorunlu
- **Plaka Kodu**: Plakalı araçlar için zorunlu, max 6 karakter, sadece harf/rakam

#### Araç Bilgileri
- **Marka**: Zorunlu
- **Model Yılı**: Zorunlu, 1900 - (şimdiki yıl + 1)
- **Model Tipi**: Zorunlu
- **Motor No**: Zorunlu, min 6 - max 40 karakter, sadece harf/rakam
- **Şasi No**: Zorunlu, tam 17 karakter, sadece harf/rakam
- **Koltuk Adedi**: Zorunlu, 1-100 arası

#### Belge Bilgileri (Plakalı Araçlar)
- **Belge Seri Kodu**: Zorunlu, tam 2 harf
- **Belge Seri No**: Zorunlu, tam 6 rakam

#### Eski Poliçe Bilgileri (Opsiyonel)
- **Poliçe No**: 12-16 hane arası
- **Yenileme No**: Tam 1 hane
- **Sigorta Şirketi No**: 1-3 hane arası
- **Acenta No**: 5-11 hane arası

#### Dain-i Mürtehin
- **Banka seçiliyse**: Banka ve Şube zorunlu
- **Finans Kurumu seçiliyse**: Finans Kurumu zorunlu

### API Endpoint

```
PUT /api/customers/{customerId}/vehicles/{vehicleId}
```

**Request Body:**
```json
{
  "vehicleId": "string",
  "customerId": "string",
  "plate": {
    "city": 34,
    "code": "ABC123"
  },
  "modelYear": 2023,
  "brandReference": "string",
  "modelTypeReference": "string",
  "utilizationStyle": 1,
  "fuel": {
    "type": 2,
    "customLpg": false,
    "customLpgPrice": null
  },
  "engine": "string",
  "chassis": "string",
  "documentSerial": {
    "code": "AA",
    "number": "123456"
  },
  "registrationDate": "2023-01-01",
  "seatNumber": 5,
  "accessories": [
    { "$type": "audio", "price": 5000 },
    { "$type": "display", "price": 3000 }
  ],
  "kaskoOldPolicy": {
    "insuranceCompanyPolicyNumber": 123456789012,
    "insuranceCompanyRenewalNumber": 0,
    "insuranceCompanyReference": "123",
    "agentNumber": 12345,
    "endDate": "2024-01-01"
  },
  "trafikOldPolicy": { ... },
  "lossPayeeClause": {
    "type": "BANK",
    "bank": { "id": "...", "name": "..." },
    "bankBranch": { "id": "...", "name": "...", "bankId": "..." }
  }
}
```

### Stil Sistemi

Modal, `product-page-flow.css` içindeki `.pp-modal-*` class'larını kullanır:

- `.pp-modal-overlay`: Modal arka planı
- `.pp-modal-container`: Modal kutusu
- `.pp-modal-header`: Modal başlığı
- `.pp-modal-content`: Modal içeriği
- `.pp-modal-footer`: Modal butonları
- `.pp-form-row`: 2 kolonlu form satırı
- `.pp-form-group`: Form alanı grubu
- `.pp-input`: Input alanları
- `.pp-select`: Select alanları
- `.pp-accordion`: Açılır-kapanır bölümler
- `.pp-button`: Butonlar

### Responsive Tasarım

- **Desktop (>768px)**: 2 kolonlu form layout
- **Mobile (≤768px)**: 1 kolonlu form layout, tam genişlik butonlar

### Notlar

- Component, `AddVehicleModal` ile aynı validasyon kurallarını kullanır
- Tüm input validasyonları gerçek zamanlı çalışır
- API yanıtı başarılı olduğunda `onSuccess` callback'i tetiklenir
- Modal dışına tıklandığında kapanır
- ESC tuşu ile kapatma özelliği yok (kullanıcı deneyimi için)

