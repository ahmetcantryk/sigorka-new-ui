import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAgencyConfig } from '../../context/AgencyConfigProvider';

interface LoginCheckProps {
  children: React.ReactNode;
}

const LoginCheck = ({ children }: LoginCheckProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const { theme } = useAgencyConfig();

  const handleLogin = () => {
    navigate('/giris-yap');
  };

  // Eğer kullanıcı otomatik olarak giriş yaparsa çocuk bileşenleri göster
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Giriş yapmamış kullanıcılar için özel bir sayfa göster
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Oturum Açmanız Gerekiyor</h1>
        <p className="mb-8 text-lg text-gray-600">
          Bu sayfayı görüntülemek için lütfen giriş yapın veya hesap oluşturun.
        </p>
        <button
          onClick={handleLogin}
          className="flex items-center justify-center rounded-lg px-6 py-3 text-white transition-colors hover:bg-opacity-90 mx-auto"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <LogIn className="mr-2 h-5 w-5" />
          <span>Giriş Yap / Üye Ol</span>
        </button>
      </div>
    </div>
  );
};

export default LoginCheck;
