import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Thermometer,
  Waves,
  AlertTriangle,
  Cpu,
  Camera,
  Check,
  CheckCheck,
  X,
  Radio,
  ExternalLink,
} from 'lucide-react';

export interface SystemNotification {
  id: string;
  category: 'TERMICAS' | 'HIDRAULICA' | 'IOT_ESP32' | 'SENSORES' | 'CIUDADANIA';
  title: string;
  description: string;
  time: string;
  badge: string;
  badgeColor: 'emerald' | 'amber' | 'blue' | 'red' | 'purple';
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    category: 'TERMICAS',
    title: 'Frescura en el Barrio por el Reservorio',
    description:
      'El agua acumulada refresca el entorno vecinal: 24.2 °C en el agua vs. 32.8 °C en el aire (-8.6 °C más fresco en las calles cercanas).',
    time: 'Hace 3 min',
    badge: '8.6 °C más fresco',
    badgeColor: 'emerald',
    isRead: false,
  },
  {
    id: 'notif-2',
    category: 'HIDRAULICA',
    title: 'Desagüe y Drenaje Limpio',
    description:
      'La compuerta del cauce está drenando de forma constante y segura (1.2 m³/s). No hay basura ni ramas atascadas en la rejilla.',
    time: 'Hace 12 min',
    badge: 'Flujo despejado',
    badgeColor: 'blue',
    isRead: false,
  },
  {
    id: 'notif-3',
    category: 'IOT_ESP32',
    title: 'Revisión Preventiva de Batería Solar',
    description:
      'El panel solar de Tiscapa bajó a 18% de carga por el cielo nublado. El equipo pasó a modo de ahorro para continuar transmitiendo toda la noche.',
    time: 'Hace 26 min',
    badge: 'Ahorro activado',
    badgeColor: 'amber',
    isRead: false,
  },
  {
    id: 'notif-4',
    category: 'SENSORES',
    title: 'Medición de Agua Estable y Segura',
    description:
      'El sensor ultrasónico en el Cauce La Maravilla reporta lecturas exactas y sin interferencias. Monitoreo continuo 100% activo.',
    time: 'Hace 38 min',
    badge: 'Lectura activa',
    badgeColor: 'emerald',
    isRead: true,
  },
  {
    id: 'notif-5',
    category: 'CIUDADANIA',
    title: 'Limpieza Vecinal Programada',
    description:
      'Vecinos reportaron ramas y botellas cerca del paso peatonal de Sabana Grande. La cuadrilla municipal y jóvenes voluntarios ya van en camino.',
    time: 'Hace 1 hora',
    badge: 'Cuadrilla en camino',
    badgeColor: 'purple',
    isRead: true,
  },
];

interface NotificationBellProps {
  isDark: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const getCategoryIcon = (category: SystemNotification['category']) => {
    switch (category) {
      case 'TERMICAS':
        return <Thermometer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'HIDRAULICA':
        return <Waves className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'IOT_ESP32':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'SENSORES':
        return <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'CIUDADANIA':
        return <Camera className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
    }
  };

  const filteredNotifications =
    filter === 'UNREAD' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de la campana en la barra superior */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title="Avisos del barrio y estado del agua"
        aria-label="Abrir avisos del barrio"
        className={`relative p-2 rounded-xl border transition-all ${
          isOpen
            ? 'border-[#00A8E8] bg-[#00A8E8]/10 text-[#00A8E8]'
            : isDark
            ? 'border-slate-800 hover:bg-slate-800/60 text-slate-300'
            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
        }`}
      >
        <Bell className="w-3.5 h-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#D81B60] text-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Menú desplegable flotante de notificaciones */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-[340px] sm:w-[380px] rounded-2xl border shadow-xl z-50 overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-150 ${
            isDark
              ? 'bg-[#0f172a] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Encabezado del Dropdown */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Avisos y Novedades del Barrio
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#70C167]/20 text-[#70C167]">
                  {unreadCount} nuevos
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-[#00A8E8] hover:underline font-medium"
                >
                  Marcar leídas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filtros de notificación */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-[11px]">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'ALL'
                  ? 'bg-[#00A8E8] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'UNREAD'
                  ? 'bg-[#00A8E8] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
            >
              No leídas ({unreadCount})
            </button>
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No hay notificaciones en este filtro.
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => toggleReadStatus(notif.id)}
                  className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-start gap-3 ${
                    !notif.isRead
                      ? isDark
                        ? 'bg-slate-850/30'
                        : 'bg-[#00A8E8]/5'
                      : 'opacity-80'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5
                        className={`text-xs font-bold truncate ${
                          !notif.isRead
                            ? 'text-slate-900 dark:text-slate-100'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {notif.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {notif.description}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {notif.badge}
                      </span>

                      <span className="text-[10px] text-slate-400 hover:text-[#00A8E8] dark:hover:text-[#00A8E8] font-medium">
                        {!notif.isRead ? '● Marcar leída' : 'Leída'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pie de Telemetría */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Monitoreo Comunitario en Vivo • Barrio Sabana Grande, Managua
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
