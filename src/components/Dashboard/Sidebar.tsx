import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '../../utils/cn';

interface SidebarProps {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
    enabled: boolean;
    isLogout?: boolean;
  }[];
}

const Sidebar = ({ items }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleItemClick = (item: SidebarProps['items'][0]) => {
    if (item.isLogout) {
      logout();
      router.push('/giris-yap');
    }
  };

  return (
    <nav className="h-full">
      <ul className="space-y-3 p-6">
        {items.map((item, index) => (
          <li key={index}>
            {item.isLogout ? (
              <button
                onClick={() => handleItemClick(item)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 transition-all hover:text-secondary w-full text-left',
                  'hover:bg-primary/10',
                  !item.enabled && 'pointer-events-none opacity-50'
                )}
              >
                <div className="flex items-center justify-center rounded-full bg-gray-100">
                  {item.icon}
                </div>
                <span>{item.title}</span>
              </button>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 transition-all hover:text-secondary',
                  'hover:bg-primary/10',
                  pathname === item.href && 'bg-primary/10 text-secondary',
                  !item.enabled && 'pointer-events-none opacity-50'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center rounded-full',
                  pathname === item.href ? 'bg-primary/20' : 'bg-gray-100'
                )}>
                  {item.icon}
                </div>
                <span>{item.title}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
