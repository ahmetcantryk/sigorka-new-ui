import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { getInsuranceCompanyName } from '../../../utils/insuranceCompanies';
import { fetchWithAuth } from '../../../services/fetchWithAuth';

interface Claim {
  id: string;
  insuranceCompanyId: number;
  claimNumber: string;
  claimDate: string;
  status: string;
  description: string;
}

<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {getInsuranceCompanyName(claim.insuranceCompanyId)}
</td> 