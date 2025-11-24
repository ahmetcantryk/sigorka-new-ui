import { HelpCircle, LogOut, Menu, Package2, Settings, Shield, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import '../../styles/form-style.css';
import { cn } from '../../utils/cn';
import { useAuthStore } from '@/store/useAuthStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const navigationItems = [
  {
    title: 'Bilgilerim',
    icon: <User className="h-6 w-6 rounded-full p-1" />,
    href: '/dashboard/profile',
    enabled: true,
    isLogout: false,
  },
  {
    title: 'Varlıklarım',
    icon: <Package2 className="h-6 w-6 rounded-full p-1" />,
    href: '/dashboard/assets',
    enabled: true,
    isLogout: false,
  },
  {
    title: 'Tekliflerim',
    icon: <Shield className="h-6 w-6 rounded-full p-1" />,
    href: '/dashboard/proposals',
    enabled: true,
    isLogout: false,
  },
  {
    title: 'Poliçelerim',
    icon: <Shield className="h-6 w-6 rounded-full p-1" />,
    href: '/dashboard/policies',
    enabled: true,
    isLogout: false,
  },
  {
    title: 'Çıkış Yap',
    icon: <LogOut className="h-6 w-6 rounded-full p-1" />,
    href: '#',
    enabled: true,
    isLogout: true,
  }
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  // Aktif sayfayı bul
  const activeItem = navigationItems.find(item => item.href === pathname);
  const otherItems = navigationItems.filter(item => item.href !== pathname);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-gray-50" style={{ paddingTop: '90px' }}>
      {/* Mobile Menu Toggle */}
      <div className="md:hidden bg-white border border-gray-200 px-4 py-3 mx-4 mt-4 rounded-xl">
        <button
          onClick={toggleMobileMenu}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-3">
            {activeItem?.icon}
            <span className="font-medium text-gray-900">
              {activeItem?.title || 'Dashboard'}
            </span>
          </div>
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-500" />
          ) : (
            <Menu className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {/* Mobile Collapsible Menu */}
        {isMobileMenuOpen && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <nav className="space-y-2">
              {navigationItems.map((item, index) => (
                item.isLogout ? (
                  <button
                    key={index}
                    onClick={() => {
                      logout();
                      router.push('/giris-yap');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-secondary hover:bg-primary/10 rounded-lg transition-colors w-full text-left"
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </button>
                ) : (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-secondary hover:bg-primary/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </a>
                )
              ))}
            </nav>
          </div>
        )}
      </div>

      <div className="flex min-h-[calc(100vh_-_158px)]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 flex-shrink-0 border-r border-gray-200 bg-white">
          <Sidebar items={navigationItems} />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-0 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
