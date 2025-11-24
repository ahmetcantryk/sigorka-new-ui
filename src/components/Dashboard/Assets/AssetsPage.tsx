import { Car, Home, Pencil, Plus } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import AddPropertyModal from './AddPropertyModal';
import AddVehicleModal from './AddVehicleModal';
import { useAuthStore } from '../../../store/useAuthStore';
import { Asset, AssetCardProps } from '../../../types/interfaces/asset';
import { Vehicle } from '../../../types/interfaces/vehicle';
import { PropertyResponse } from '../../../types/interfaces/property';
import { fetchWithAuth } from '../../../services/fetchWithAuth';
import { API_BASE_URL } from '../../../config/api';

const AssetCard: React.FC<AssetCardProps> = ({ asset, onEdit }) => {
  const isVehicle = asset.type === 'vehicle';
  const Icon = isVehicle ? Car : Home;

  const title = isVehicle
    ? `${(asset.details as Vehicle).model.brand.text} ${(asset.details as Vehicle).model.type.text}`
    : `${(asset.details as PropertyResponse).address.city.text} ${(asset.details as PropertyResponse).address.district.text}`;

  const subtitle = isVehicle
    ? (asset.details as Vehicle).plate.code 
      ? `${(asset.details as Vehicle).plate.city} ${(asset.details as Vehicle).plate.code}`
      : `Plakasız ${(asset.details as Vehicle).plate.city}`
    : (asset.details as PropertyResponse).address.neighborhood.text;

  const details = null;

  return (
    <div className="shadow-xs group relative rounded-xl border border-gray-100 bg-white p-4 md:p-6 transition-shadow hover:shadow-md min-h-[120px] md:min-h-[140px]">
      <div className="flex items-start space-x-3 md:space-x-4 pr-8">
        <div className="rounded-lg bg-primary/10 p-2 md:p-3 flex-shrink-0">
          <Icon className="text-secondary h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm md:text-base leading-tight break-words">{title}</h3>
          <p className="mt-1 text-xs md:text-sm text-gray-500 truncate">{subtitle}</p>
          <div className="hidden md:block">
            {details}
          </div>
          <div className="md:hidden">
            {/* Mobil detay alanı kaldırıldı */}
          </div>
        </div>
      </div>
      <button
        onClick={() => onEdit(asset)}
        className="absolute -top-3 -right-3 md:top-3 md:right-3 z-10 rounded-full bg-white shadow-lg w-10 h-10 flex items-center justify-center border border-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Düzenle"
      >
        <Pencil className="h-5 w-5 text-secondary" />
      </button>
    </div>
  );
};

const AddAssetCard = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border-2 border-dashed border-gray-200 p-3 md:p-4 text-left transition-colors hover:border-secondary"
    >
      <div className="flex items-start space-x-3 md:space-x-4">
        <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
          <Plus className="text-secondary h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 text-sm md:text-base">Yeni Varlık Ekle</h3>
          <p className="mt-1 text-xs md:text-sm text-gray-500">Araç veya konut ekleyin</p>
        </div>
      </div>
    </button>
  );
};

const AssetsPage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const token = useAuthStore((state) => state.accessToken);
  const customerData = useAuthStore((state) => state.customerId);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAssetTypeModal, setShowAssetTypeModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const fetchWithAuthAssets = async () => {
    try {
      const [vehiclesResponse, propertiesResponse] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/api/customers/me/vehicles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetchWithAuth(`${API_BASE_URL}/api/customers/me/properties`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!vehiclesResponse.ok || !propertiesResponse.ok) {
        throw new Error('Veriler yüklenirken hata oluştu');
      }

      const vehicles = await vehiclesResponse.json();
      const properties = await propertiesResponse.json();

      const formattedAssets: Asset[] = [
        ...vehicles.map((v: Vehicle) => ({
          type: 'vehicle' as const,
          details: v,
        })),
        ...properties.map((p: PropertyResponse) => ({ type: 'property' as const, details: p })),
      ];

      setAssets(formattedAssets);
    } catch (error) {
    }
  };

  useEffect(() => {
    if (token) {
      fetchWithAuthAssets();
    }
  }, [token]);

  const handleAddAssetClick = () => {
    setSelectedAsset(null);
    setShowAssetTypeModal(true);
  };

  const handleAssetTypeSelect = (type: 'vehicle' | 'property') => {
    setShowAssetTypeModal(false);
    if (type === 'vehicle') {
      setShowAddVehicleModal(true);
    } else {
      setShowAddPropertyModal(true);
    }
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    if (asset.type === 'vehicle') {
      setShowAddVehicleModal(true);
    } else {
      setShowAddPropertyModal(true);
    }
  };

  return (
    <div className="px-5 py-5 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Varlıklarım</h1>
        <p className="mt-1 text-sm md:text-base text-gray-500">
          Araç ve konut varlıklarınızı görüntüleyin
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <AssetCard
            key={
              asset.type === 'vehicle'
                ? asset.details.id
                : (asset.details as PropertyResponse).number
            }
            asset={asset}
            onEdit={handleEditAsset}
          />
        ))}
        <AddAssetCard onClick={handleAddAssetClick} />
      </div>

      {/* Asset Type Selection Modal */}
      {showAssetTypeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4" style={{zIndex: 9999}}>
          <div className="w-full max-w-md rounded-xl bg-white p-4 md:p-6">
            <h2 className="mb-4 text-lg md:text-xl font-bold text-gray-900">Varlık Tipi Seçin</h2>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={() => handleAssetTypeSelect('vehicle')}
                className="flex flex-col items-center rounded-lg border p-3 md:p-4 hover:border-secondary hover:bg-primary/10 transition-colors"
              >
                <Car className="text-secondary mb-2 h-6 w-6 md:h-8 md:w-8" />
                <span className="font-medium text-sm md:text-base">Araç</span>
              </button>
              <button
                onClick={() => handleAssetTypeSelect('property')}
                className="flex flex-col items-center rounded-lg border p-3 md:p-4 hover:border-secondary hover:bg-primary/10 transition-colors"
              >
                <Home className="text-secondary mb-2 h-6 w-6 md:h-8 md:w-8" />
                <span className="font-medium text-sm md:text-base">Konut</span>
              </button>
            </div>
            <button
              onClick={() => setShowAssetTypeModal(false)}
              className="mt-4 w-full py-2 text-sm md:text-base text-gray-600 hover:text-gray-900 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Vehicle Modal */}
      {showAddVehicleModal && (
        <AddVehicleModal
          onClose={() => setShowAddVehicleModal(false)}
          initialData={
            selectedAsset?.type === 'vehicle'
              ? { type: 'vehicle', details: selectedAsset.details as Vehicle }
              : undefined
          }
          onSuccess={fetchWithAuthAssets}
        />
      )}

      {/* Property Modal */}
      {showAddPropertyModal && (
        <AddPropertyModal
          onClose={() => setShowAddPropertyModal(false)}
          initialData={
            selectedAsset?.type === 'property'
              ? (selectedAsset.details as PropertyResponse)
              : undefined
          }
          onSuccess={fetchWithAuthAssets}
        />
      )}
    </div>
  );
};

export default AssetsPage;
