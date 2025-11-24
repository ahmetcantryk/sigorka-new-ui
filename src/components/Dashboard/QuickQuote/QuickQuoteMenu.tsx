import { ArrowRight, Car, ChevronDown, Home, Shield, Umbrella } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../utils/cn';
import { fetchWithAuth } from '../../../services/fetchWithAuth';

interface QuoteProduct {
  id: string;
  title: string;
  icon: React.ReactNode;
  href: string;
}

interface QuickQuoteMenuProps {
  onStateChange?: (isOpen: boolean) => void;
}

const quoteProducts: QuoteProduct[] = [
  {
    id: 'kasko',
    title: 'Kasko',
    icon: <Car className="h-5 w-5" />,
    href: '#quote/kasko',
  },
  {
    id: 'trafik',
    title: 'Trafik Sigortası',
    icon: <Car className="h-5 w-5" />,
    href: '#quote/trafik',
  },
  {
    id: 'konut',
    title: 'Konut Sigortası',
    icon: <Home className="h-5 w-5" />,
    href: '#quote/konut',
  },
  {
    id: 'dask',
    title: 'DASK',
    icon: <Home className="h-5 w-5" />,
    href: '#quote/dask',
  },
  {
    id: 'saglik',
    title: 'Sağlık Sigortası',
    icon: <Shield className="h-5 w-5" />,
    href: '#quote/saglik',
  },
  {
    id: 'hayat',
    title: 'Hayat Sigortası',
    icon: <Umbrella className="h-5 w-5" />,
    href: '#quote/hayat',
  },
];

const QuickQuoteMenu = ({ onStateChange }: QuickQuoteMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onStateChange?.(newState);
  };

  return (
    <div className="absolute left-6 right-6 top-4 z-10">
      <div className="shadow-xs rounded-xl border border-gray-100 bg-white">
        {/* Ana Menü Butonu */}
        <button
          onClick={handleToggle}
          className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-primary/10 hover:text-secondary"
        >
          <div className="flex items-center gap-3">
            <ArrowRight className="h-5 w-5" />
            <span className="text-sm font-medium">Hızlı Teklif</span>
          </div>
          <ChevronDown
            className={cn('h-5 w-5 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>

        {/* Ürün Listesi */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            isOpen ? 'max-h-96' : 'max-h-0'
          )}
        >
          <div className="space-y-1 px-3 py-2">
            {quoteProducts.map((product) => (
              <a
                key={product.id}
                href={product.href}
                className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-500 transition-colors hover:bg-primary/10 hover:text-secondary"
              >
                {product.icon}
                <span className="text-sm font-medium">{product.title}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickQuoteMenu;
