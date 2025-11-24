import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FileText } from 'lucide-react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS } from '@/config/api';
import { fetchWithAuth } from '@/services/auth';

const GET_POLICIES = gql`
  query GetPolicies {
    policies(skip: 0, take: 10, order: [{createdAt: DESC}]) {
      totalCount
      items {
        id
        state
        productBranch
        startDate
        endDate
        insuranceCompanyLogo
        insuranceCompanyPolicyNumber
        insuranceCompanyName
        productName
        grossPremium
        netPremium
        insuredCustomerName
        insuredCustomerIdentity
        insuredCustomerType
        arrangementDate
        createdAt
        createdBy {
          name
          __typename
        }
        vehicleModel {
          brand {
            text
            value
            __typename
          }
          year
          type {
            text
            value
            __typename
          }
          __typename
        }
        channel
        insuredCustomerId
        vehicleId
        propertyId
        __typename
      }
      __typename
    }
  }
`;

const GET_POLICY_DOCUMENT = gql`
  query GetPolicyDocument($policyId: String!) {
    policyDocument(policyId: $policyId) {
      url
    }
  }
`;

interface Policy {
  id: string;
  state: string;
  productBranch: string;
  startDate: string;
  endDate: string;
  insuranceCompanyLogo: string | null;
  insuranceCompanyPolicyNumber: string;
  insuranceCompanyName: string;
  productName: string;
  grossPremium: number;
  netPremium: number;
  insuredCustomerName: string;
  insuredCustomerIdentity: string;
  insuredCustomerType: string;
  arrangementDate: string | null;
  createdAt: string;
  createdBy: {
    name: string;
  };
  vehicleModel: {
    brand: {
      text: string;
      value: string;
    };
    year: number;
    type: {
      text: string;
      value: string;
    };
  } | null;
  channel: string;
  insuredCustomerId: string;
  vehicleId: string | null;
  propertyId: string | null;
}

const PoliciesPage = () => {
  const { loading, error, data } = useQuery(GET_POLICIES, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all'
  });

  const getPolicyDocument = async (policyId: string) => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.POLICIES_DOCUMENT(policyId));
      if (!response.ok) {
        throw new Error('Döküman alınamadı');
      }
      const data = await response.json();
      return data.url;
    } catch (error) {
      throw new Error('Döküman görüntülenirken bir hata oluştu');
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'd MMMM yyyy', { locale: tr });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getAssetInfo = (policy: Policy) => {
    if (policy.vehicleModel) {
      return `${policy.vehicleModel.brand.text} ${policy.vehicleModel.year}`;
    }
    if (
      policy.productBranch.toLowerCase() === 'konut' ||
      policy.productBranch.toLowerCase() === 'dask'
    ) {
      return 'Konum Bilgisi'; // Bu kısım API'den gelecek veriye göre güncellenmeli
    }
    if (policy.productBranch.toLowerCase() === 'tss') {
      return policy.productName;
    }
    return '-';
  };

  const getPolicyStatus = (policy: Policy) => {
    const endDate = new Date(policy.endDate);
    const today = new Date();
    return endDate >= today ? 'Aktif Poliçe' : 'Süresi Doldu';
  };

  // Mobile Policy Card Component
  const PolicyCard = ({ policy }: { policy: Policy }) => {
    const status = getPolicyStatus(policy);
    const isActive = status === 'Aktif';

    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {policy.productBranch.charAt(0).toUpperCase() +
                policy.productBranch.slice(1).toLowerCase()}
            </h3>
          </div>
          <Badge
            variant={isActive ? 'success' : 'secondary'}
            className="text-sm px-3 py-1"
          >
            {status}
          </Badge>
        </div>

        {/* Insurance Company */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Sigorta Şirketi:</span>
            <span className="text-gray-900 font-medium">{policy.insuranceCompanyName}</span>
          </div>
        </div>

        {/* Policy Period */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Poliçe Süresi</h4>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Başlangıç:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(policy.startDate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Bitiş:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(policy.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Policy Number & Premium */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-xs font-medium text-blue-700 mb-1">Poliçe No</h4>
            <p className="text-sm font-semibold text-blue-900 break-all">
              {policy.insuranceCompanyPolicyNumber}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <h4 className="text-xs font-medium text-green-700 mb-1">Prim</h4>
            <p className="text-sm font-semibold text-green-900">
              {formatCurrency(policy.grossPremium)}
            </p>
          </div>
        </div>

        {/* PDF Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => handleViewPdf(policy)}
            className="flex items-center justify-center gap-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          >
            <FileText className="h-4 w-4" />
            Poliçe Dökümanı Görüntüle
          </button>
          <button
            onClick={() => handleDownloadPdf(policy)}
            className="flex items-center justify-center gap-2 w-full bg-green-50 hover:bg-green-100 text-green-700 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Poliçe Dökümanı İndir
          </button>
        </div>
      </div>
    );
  };

  const handleViewPdf = async (policy: Policy) => {
    try {
      const url = await getPolicyDocument(policy.id);
      if (url) {
        window.open(url, '_blank');
      } else {
        throw new Error("Döküman URL'si bulunamadı");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Döküman görüntülenirken bir hata oluştu');
    }
  };

  const handleDownloadPdf = async (policy: Policy) => {
    try {
      const url = await getPolicyDocument(policy.id);
      if (url) {
        // Dosyayı blob olarak indir
        const response = await fetch(url);
        const blob = await response.blob();
        
        // Blob URL oluştur
        const blobUrl = window.URL.createObjectURL(blob);
        
        // İndirme linki oluştur
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `poliçe-${policy.insuranceCompanyPolicyNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Blob URL'yi temizle
        window.URL.revokeObjectURL(blobUrl);
      } else {
        throw new Error("Döküman URL'si bulunamadı");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Döküman indirilirken bir hata oluştu');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="border-secondary h-8 w-8 animate-spin rounded-full border-b-2"></div>
    </div>
  );
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Hata: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-5 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Poliçelerim</h1>
        <p className="mt-1 text-sm md:text-base text-gray-500">
          Aktif ve geçmiş poliçelerinizi görüntüleyin
        </p>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="md:hidden space-y-4">
        {data?.policies?.items?.length > 0 ? (
          data.policies.items.map((policy: Policy) => (
            <PolicyCard key={policy.id} policy={policy} />
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">Henüz poliçe bulunmamaktadır.</p>
          </div>
        )}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden md:block shadow-xs rounded-xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[17%]" />
              <col className="w-[17%]" />
              <col className="w-[17%]" />
              <col className="w-[17%]" />
              <col className="w-[17%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100">
                <th className="whitespace-nowrap px-4 py-4 text-left text-sm font-medium text-gray-600">
                  Ürün Branşı
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-left text-sm font-medium text-gray-600">
                  Sigorta Şirketi
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-left text-sm font-medium text-gray-600">
                  Süre
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-left text-sm font-medium text-gray-600">
                  Prim
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-center text-sm font-medium text-gray-600">
                  Poliçe Dökümanı
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-center text-sm font-medium text-gray-600">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.policies?.items?.length > 0 ? (
                data.policies.items.map((policy: Policy) => (
                  <tr key={policy.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="truncate px-4 py-4">
                      <span className="font-medium text-gray-900">
                        {policy.productBranch.charAt(0).toUpperCase() +
                          policy.productBranch.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="truncate px-4 py-4 text-gray-600">
                      {policy.insuranceCompanyName}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-500 text-xs">Başlangıç:</span>
                          <div className="font-medium">{formatDate(policy.startDate)}</div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 text-xs">Bitiş:</span>
                          <div className="font-medium">{formatDate(policy.endDate)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-left font-medium text-gray-900">
                      {formatCurrency(policy.grossPremium)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewPdf(policy)}
                          className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          Görüntüle
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(policy)}
                          className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          İndir
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <Badge
                          variant={getPolicyStatus(policy) === 'Aktif Poliçe' ? 'success' : 'secondary'}
                          className="text-sm px-4 py-2"
                        >
                          {getPolicyStatus(policy)}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Henüz poliçe bulunmamaktadır.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;
