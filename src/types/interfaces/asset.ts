import { Vehicle } from './vehicle';
import { PropertyResponse } from './property';

export interface Asset {
  type: 'vehicle' | 'property';
  details: Vehicle | PropertyResponse;
}

export interface AssetCardProps {
  asset: Asset;
  onEdit: (asset: Asset) => void;
}
