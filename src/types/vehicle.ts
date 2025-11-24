export interface Vehicle {
  id: string;
  customerId: string;
  hasPlate: boolean;
  plate: {
    city: number;
    code: string | null;
  };
  model: {
    /*...*/
  };
  utilizationStyle: number;
  engineNumber: string;
  chassisNumber: string;
  registrationDate: string;
  seatNumber: number;
}
