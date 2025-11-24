import { Info } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../utils/cn';
import { Switch } from '../../../components/ui/switch';
import { fetchWithAuth } from '../../../services/fetchWithAuth';

interface Permission {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface PermissionGroup {
  id: string;
  title: string;
  description: string;
  permissions: Permission[];
}

const SettingsPage = () => {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([
    {
      id: 'kvkk',
      title: 'KVKK',
      description: 'Kişisel Verilerin Korunması Kanunu kapsamındaki izinleriniz',
      permissions: [
        {
          id: 'kvkk-1',
          title: 'Kişisel Verilerin İşlenmesi',
          description: 'Kişisel verilerimin işlenmesine izin veriyorum.',
          enabled: true,
        },
        {
          id: 'kvkk-2',
          title: 'Özel Nitelikli Kişisel Veriler',
          description: 'Özel nitelikli kişisel verilerimin işlenmesine izin veriyorum.',
          enabled: false,
        },
        {
          id: 'kvkk-3',
          title: 'Veri Aktarımı',
          description: 'Kişisel verilerimin üçüncü taraflarla paylaşılmasına izin veriyorum.',
          enabled: false,
        },
      ],
    },
    {
      id: 'communication',
      title: 'İletişim İzinlerim',
      description: 'Sizinle nasıl iletişim kurabileceğimize dair tercihleriniz',
      permissions: [
        {
          id: 'comm-1',
          title: 'E-posta Bildirimleri',
          description: 'Kampanya ve fırsatlardan e-posta yoluyla haberdar olmak istiyorum.',
          enabled: true,
        },
        {
          id: 'comm-2',
          title: 'SMS Bildirimleri',
          description: 'Kampanya ve fırsatlardan SMS yoluyla haberdar olmak istiyorum.',
          enabled: true,
        },
        {
          id: 'comm-3',
          title: 'Telefon Aramaları',
          description: 'Kampanya ve fırsatlar için telefonla aranmayı kabul ediyorum.',
          enabled: false,
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Çerez Tercihlerim',
      description: 'Web sitemizde kullanılan çerezler için tercihleriniz',
      permissions: [
        {
          id: 'cookie-1',
          title: 'Zorunlu Çerezler',
          description: 'Sitenin çalışması için gerekli olan çerezler.',
          enabled: true,
        },
        {
          id: 'cookie-2',
          title: 'Analitik Çerezler',
          description: 'Site kullanımını analiz etmemize yardımcı olan çerezler.',
          enabled: true,
        },
        {
          id: 'cookie-3',
          title: 'Pazarlama Çerezleri',
          description: 'Kişiselleştirilmiş reklamlar için kullanılan çerezler.',
          enabled: false,
        },
      ],
    },
  ]);

  const handleTogglePermission = (groupId: string, permissionId: string) => {
    setPermissionGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            permissions: group.permissions.map((permission) => {
              if (permission.id === permissionId) {
                return { ...permission, enabled: !permission.enabled };
              }
              return permission;
            }),
          };
        }
        return group;
      })
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Ayarlarım</h1>
        <p className="mt-1 text-gray-500">İzinlerinizi ve tercihlerinizi yönetin</p>
      </div>

      <div className="space-y-6">
        {permissionGroups.map((group) => (
          <div key={group.id} className="shadow-xs rounded-xl border border-gray-100 bg-white p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
              <p className="mt-1 text-gray-500">{group.description}</p>
            </div>

            <div className="space-y-4">
              {group.permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-start justify-between rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex-1 pr-8">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{permission.title}</h3>
                      {permission.id === 'cookie-1' && (
                        <div className="group relative">
                          <Info className="h-4 w-4 text-gray-400" />
                          <div className="invisible absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg bg-gray-900 p-2 text-xs text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                            Bu izin devre dışı bırakılamaz
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{permission.description}</p>
                  </div>
                  <div className="flex items-center">
                    <Switch
                      checked={permission.enabled}
                      onChange={() => handleTogglePermission(group.id, permission.id)}
                      className={cn(
                        permission.enabled ? 'bg-secondary' : 'bg-gray-200',
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2'
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                          permission.enabled ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </Switch>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
