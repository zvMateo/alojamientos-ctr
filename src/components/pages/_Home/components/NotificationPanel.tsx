import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, AlertCircle, CheckCircle, Info, X, Clock } from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "warning",
      title: "Nuevo alojamiento pendiente",
      message: "Hotel Las Palmas en Villa Carlos Paz requiere aprobación",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      read: false,
    },
    {
      id: "2",
      type: "info",
      title: "Actualización de datos",
      message: "Se actualizó la información del Hostal de las Sierras",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
      read: false,
    },
    {
      id: "3",
      type: "success",
      title: "Alojamiento aprobado",
      message: "Cabañas La Cumbre fue aprobado exitosamente",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
      read: true,
    },
    {
      id: "4",
      type: "error",
      title: "Error de sincronización",
      message: "No se pudo sincronizar con el sistema externo",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 horas atrás
      read: true,
    },
    {
      id: "5",
      type: "info",
      title: "Mantenimiento programado",
      message: "El sistema estará en mantenimiento el domingo de 2-4 AM",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "success":
        return "border-l-green-500 bg-green-50";
      case "error":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 24) {
      return timestamp.toLocaleDateString();
    } else if (hours > 0) {
      return `hace ${hours}h`;
    } else if (minutes > 0) {
      return `hace ${minutes}m`;
    } else {
      return "ahora";
    }
  };

  if (!isOpen) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-40 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Notificaciones</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} nuevas
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 px-2 text-xs"
                >
                  Marcar todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Mantente al día con las últimas actualizaciones
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 transition-all duration-200 ${
                  notification.read ? "opacity-60" : ""
                } ${getTypeColor(notification.type)}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-medium ${
                          notification.read ? "text-gray-600" : "text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-gray-200"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        notification.read ? "text-gray-500" : "text-gray-700"
                      }`}
                    >
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
