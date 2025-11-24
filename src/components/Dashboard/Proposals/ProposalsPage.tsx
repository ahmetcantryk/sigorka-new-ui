import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { useAgencyConfig } from '../../../context/AgencyConfigProvider'; // Corrected import path
import { fetchWithAuth } from '@/services/fetchWithAuth';

const GET_PROPOSALS = gql`
  query GetProposals {
    proposals(skip: 0, take: 50, order: [{ createdAt: DESC }]) {
      totalCount
      items {
        id
        productBranch
        insuredCustomerName
        insuredCustomerIdentity
        insuredCustomerType
        state
        highestPremium
        lowestPremium
        successRate
        productsCount
        succeedProductsCount
        createdAt
        agentUserCreatedBy {
          name
        }
        vehicleModel {
          brand {
            text
            value
          }
          year
          type {
            text
            value
          }
        }
        channel
        vehicleId
        propertyId
        insuredCustomerId
      }
    }
  }
`;

interface Proposal {
  id: string;
  productBranch: string;
  insuredCustomerName: string;
  insuredCustomerIdentity: string;
  insuredCustomerType: string;
  state: string;
  highestPremium: number;
  lowestPremium: number;
  successRate: number;
  productsCount: number;
  succeedProductsCount: number;
  createdAt: string;
  agentUserCreatedBy: {
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
  vehicleId: string | null;
  propertyId: string | null;
  insuredCustomerId: string;
}

const ProposalsPage = () => {
  const { loading, error, data } = useQuery(GET_PROPOSALS, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all'
  });
  const { theme } = useAgencyConfig();

  // FAILED state'i olan teklifleri filtrele
  const filteredProposals = data?.proposals?.items?.filter((proposal: Proposal) => 
    proposal.state !== 'FAILED'
  ) || [];

  const formatDate = (date: string) => {
    return format(new Date(date), 'd MMMM yyyy', { locale: tr });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const getAssetInfo = (proposal: Proposal) => {
    const branch = proposal.productBranch.toLowerCase();

    if (branch === 'tss') {
      return proposal.insuredCustomerName;
    }

    if (['kasko', 'trafik', 'imm'].includes(branch)) {
      return proposal.vehicleModel?.brand.text || 'Araç Bilgisi Yok';
    }

    // Fallback for other products like DASK, Konut, etc.
    if (proposal.vehicleModel) {
      return `${proposal.vehicleModel.brand.text} ${proposal.vehicleModel.type.text}`;
    }
    if (proposal.propertyId) {
      return 'Konut'; // Generic placeholder
    }
    return 'Varlık Bilgisi Yok';
  };

  const getStatusBadge = (state: string) => {
    const isSuccess = state === 'SUCCESS';
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isSuccess ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
        }`}
      >
        {isSuccess ? 'Poliçeleşti' : 'Poliçeleşmedi'}
      </span>
    );
  };

  const isOfferExpired = (createdAt: string) => {
    const offerDate = new Date(createdAt);
    const today = new Date();
    return differenceInDays(today, offerDate) > 3;
  };

  // Mobile Card Component
  const ProposalCard = ({ proposal }: { proposal: Proposal }) => {
    const expired = isOfferExpired(proposal.createdAt);
    const detailUrl = `/${proposal.productBranch.toLowerCase()}/quote-comparison/${proposal.id}`;

    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {capitalizeFirstLetter(proposal.productBranch)}
            </h3>
            <p className="text-gray-600 text-sm">{getAssetInfo(proposal)}</p>
          </div>
          {getStatusBadge(proposal.state)}
        </div>

        {/* Date */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Teklif Tarihi:</span>
            <span className="text-gray-900 font-medium">{formatDate(proposal.createdAt)}</span>
          </div>
        </div>

        {/* Price Range */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Prim Aralığı</h4>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">En Düşük:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(proposal.lowestPremium)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">En Yüksek:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(proposal.highestPremium)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {expired ? (
            <button
              disabled
              className="block w-full text-center whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
              title="Teklifin geçerlilik süresi dolmuştur."
            >
              Süresi Dolmuş
            </button>
          ) : (
            <Link
              href={detailUrl}
              title="Teklif Detayını Görüntüle"
              className="block w-full text-center whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 focus:outline-none focus:ring"
              style={{
                backgroundColor: theme.primaryColor,
              }}
            >
              Teklif Detayı
            </Link>
          )}
        </div>
      </div>
    );
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
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Tekliflerim</h1>
        <p className="mt-1 text-sm md:text-base text-gray-500">
          Aktif ve geçmiş tekliflerinizi görüntüleyin
        </p>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="md:hidden space-y-4">
        {filteredProposals.length > 0 ? (
          filteredProposals.map((proposal: Proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">Henüz teklif bulunmamaktadır.</p>
          </div>
        )}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden md:block shadow-xs rounded-xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[25%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[15%]" />
              <col className="w-[auto]" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Ürün Branşı
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Varlık
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Teklif Alınma Tarihi
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Prim Aralığı
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  Durum
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.length > 0 ? (
                filteredProposals.map((proposal: Proposal) => {
                  const expired = isOfferExpired(proposal.createdAt);
                    const getDetailUrl = (productBranch: string, proposalId: string) => {
                        const branch = productBranch.toLowerCase();
                        switch (branch) {
                            case 'konut':
                                return `/konut-teklif/quote-comparison/${proposalId}`;
                            case 'trafik':
                                return `/trafik/quote-comparison/${proposalId}`;
                            case 'kasko':
                                return `/kasko/quote-comparison/${proposalId}`;
                            case 'dask':
                                return `/dask/quote-comparison/${proposalId}`;
                            case 'imm':
                                return `/imm/quote-comparison/${proposalId}`;
                            case 'tss':
                                return `/tss/quote-comparison/${proposalId}`;
                            default:
                                return `/${branch}/quote-comparison/${proposalId}`;
                        }
                    };
                    const detailUrl = getDetailUrl(proposal.productBranch, proposal.id);
                  return (
                    <tr key={proposal.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">
                          {capitalizeFirstLetter(proposal.productBranch)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{getAssetInfo(proposal)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(proposal.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex flex-col space-y-1">
                          <div>
                            <span className="text-xs text-gray-500">En Düşük: </span>
                            <span>{formatCurrency(proposal.lowestPremium)}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">En Yüksek: </span>
                            <span>{formatCurrency(proposal.highestPremium)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(proposal.state)}</td>
                      <td className="px-4 py-3 text-center">
                        {expired ? (
                          <button
                            disabled
                            className="inline-block whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                            title="Teklifin geçerlilik süresi dolmuştur."
                          >
                            Süresi Dolmuş
                          </button>
                        ) : (
                          <Link
                            href={detailUrl}
                            title="Teklif Detayını Görüntüle"
                            className="inline-block whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 focus:outline-none focus:ring"
                            style={{
                              backgroundColor: theme.primaryColor,
                            }}
                          >
                            Teklif Detayı
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Henüz teklif bulunmamaktadır.
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

export default ProposalsPage;
