export interface Vehicle {
  id: string;
  customerId: string;
  hasPlate: boolean;
  plate: {
    city: number;
    code: string | null;
  };
  model: {
    year: number;
    type: {
      value: string;
      text: string;
    };
    brand: {
      value: string;
      text: string;
    };
  };
  utilizationStyle: string;
  fuel: {
    type: string;
    customLpg: boolean;
    customLpgPrice: number | null;
  } | null;
  engineNumber: string;
  chassisNumber: string;
  registrationDate: string;
  seatNumber: number;
  documentSerial: {
    code: string;
    number: string;
  } | null;
  kaskoOldPolicy: string | null;
  trafikOldPolicy: string | null;
  lossPayeeClause: {
    type: 'BANK' | 'FINANCIAL_INSTITUTION';
    bank: {
      id: string;
      name: string;
    } | null;
    bankBranch: {
      id: string;
      name: string;
      bankId: string;
    } | null;
    financialInstitution: {
      id: string;
      name: string;
    } | null;
  } | null;
}
