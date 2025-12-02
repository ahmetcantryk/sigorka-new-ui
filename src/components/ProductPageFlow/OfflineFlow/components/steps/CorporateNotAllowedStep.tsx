/**
 * Offline Flow - Corporate Not Allowed Step
 * 
 * Kurumsal müşterilere gösterilen bilgilendirme ekranı
 */

'use client';

import { Info } from 'lucide-react';
import Link from 'next/link';
import { OfflineBranchConfig } from '../../types';

interface CorporateNotAllowedStepProps {
  branchConfig: OfflineBranchConfig;
}

const CorporateNotAllowedStep = ({ branchConfig }: CorporateNotAllowedStepProps) => {
  return (
    <div className="product-page-form">
      <div className="pp-card pp-result-card">
        <div className="pp-result-icon pp-result-info-icon">
          <Info size={48} />
        </div>
        <h2 className="pp-result-title">
          Kurumsal Müşteri Bildirimi
        </h2>
        <p className="pp-result-message">
          Kurumsal müşterilerimize {branchConfig.displayName} hizmeti verememekteyiz.
        </p>
        <p className="pp-result-message pp-corporate-links">
          Dilerseniz diğer ürünlerimizden teklif alabilirsiniz:
        </p>
        <div className="pp-branch-links">
          <Link href="/kasko-sigortasi" className="pp-branch-link">Kasko</Link>
          <Link href="/zorunlu-trafik-sigortasi" className="pp-branch-link">Trafik</Link>
          <Link href="/imm" className="pp-branch-link">İMM</Link>
          <Link href="/dask" className="pp-branch-link">DASK</Link>
          <Link href="/konut-sigortasi" className="pp-branch-link">Konut</Link>
        </div>
      </div>
    </div>
  );
};

export default CorporateNotAllowedStep;

