/**
 * ProductPageManager
 * 
 * Ürün detay sayfaları için merkezi yönetici component
 * URL query parametrelerine göre doğru içeriği render eder
 */

'use client';

import { ReactNode, Suspense } from 'react';
import { useProductPageQuery } from './hooks/useProductPageQuery';
import AuthGuard from './AuthGuard';

interface ProductPageManagerProps {
  // Farklı modlar için render edilecek componentler
  formComponent: ReactNode;
  quoteComponent: ReactNode;
  purchaseComponent: ReactNode;
  defaultComponent: ReactNode;
  
  // Loading states
  formLoading?: ReactNode;
  quoteLoading?: ReactNode;
  purchaseLoading?: ReactNode;
}

const ProductPageManager = ({
  formComponent,
  quoteComponent,
  purchaseComponent,
  defaultComponent,
  formLoading,
  quoteLoading,
  purchaseLoading,
}: ProductPageManagerProps) => {
  const { activeMode } = useProductPageQuery();

  // Mode'a göre component render et
  const renderContent = () => {
    switch (activeMode) {
      case 'quote':
        return (
          <AuthGuard requireAuth={true}>
            <Suspense fallback={quoteLoading || <DefaultLoading message="Teklifler yükleniyor..." />}>
              {quoteComponent}
            </Suspense>
          </AuthGuard>
        );
      
      case 'purchase':
        return (
          <AuthGuard requireAuth={true}>
            <Suspense fallback={purchaseLoading || <DefaultLoading message="Ödeme ekranı yükleniyor..." />}>
              {purchaseComponent}
            </Suspense>
          </AuthGuard>
        );
      
      case 'default':
      default:
        return defaultComponent;
    }
  };

  return <>{renderContent()}</>;
};

// Default loading component
const DefaultLoading = ({ message }: { message: string }) => (
  <div className="product-page-loading">
    <div className="product-page-loading__spinner">
      <div className="spinner"></div>
    </div>
    <p className="product-page-loading__message">{message}</p>
  </div>
);

export default ProductPageManager;

