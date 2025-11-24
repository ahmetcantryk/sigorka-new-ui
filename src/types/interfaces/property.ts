export interface PropertyResponse {
  id: string;
  number: number;
  address: {
    city: { value: string; text: string };
    district: { value: string; text: string };
    town: { value: string; text: string };
    neighborhood: { value: string; text: string };
    street: { value: string; text: string };
    building: { value: string; text: string };
    apartment: { value: string; text: string };
  };
  squareMeter: number;
  constructionYear: number;
  damageStatus: number;
  floorNumber: number;
  structure: number;
  utilizationStyle: number;
  ownershipType: number;
  lossPayeeClause: {
    type: number;
    name: string;
  } | null;
  customerId: string;
}
