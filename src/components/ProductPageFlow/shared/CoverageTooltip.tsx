/**
 * CoverageTooltip
 * 
 * Branş bazlı dinamik teminat tooltip componenti
 * coverageTooltips.ts config dosyasından tooltip içeriklerini alır
 */

'use client';

import { useState } from 'react';
import { getCoverageTooltip } from '@/config/coverageTooltips';

interface CoverageTooltipProps {
  branch: string;
  coverageKey: string;
  customTooltip?: string;
  className?: string;
}

const CoverageTooltip = ({ branch, coverageKey, customTooltip, className }: CoverageTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Config'den tooltip al veya custom tooltip kullan
  const tooltipContent = customTooltip || getCoverageTooltip(branch, coverageKey);
  
  // Tooltip yoksa hiçbir şey gösterme
  if (!tooltipContent) return null;

  return (
    <div className={`pp-coverage-tooltip-container ${className || ''}`}>
      <span
        className="icon-teminat-info pp-coverage-tooltip-icon"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      />
      
      {isVisible && (
        <div className="pp-coverage-tooltip-content">
          <div className="pp-coverage-tooltip-text">{tooltipContent}</div>
          <div className="pp-coverage-tooltip-arrow" />
        </div>
      )}
    </div>
  );
};

export default CoverageTooltip;

