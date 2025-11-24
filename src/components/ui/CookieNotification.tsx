import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAgencyConfig } from '../../context/AgencyConfigProvider';

const CookieNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useAgencyConfig();

  useEffect(() => {
    // Check localStorage if user has already seen the notification
    const hasSeenNotification = localStorage.getItem('cookieNotificationSeen');
    
    if (!hasSeenNotification) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Set flag in localStorage so it doesn't appear again
    localStorage.setItem('cookieNotificationSeen', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm md:max-w-md">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <div className="flex items-start">
          <div className="flex-1 pr-4">
            <p className="text-sm text-gray-700">
              Sitemizde, size daha iyi hizmet verebilmek ve işlevsellik gereği çerezler kullanıyoruz. 
              Çerezleri nasıl kullandığımızı incelemek ve çerezleri nasıl kontrol edebileceğinizi öğrenmek için{' '}
              <Link 
                to="/cerez-politikasi" 
                className="font-medium"
                style={{
                  color: theme.primaryColor,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                Çerez Politikası
              </Link>
              'nı inceleyebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={handleClose}
            aria-label="Kapat"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieNotification; 