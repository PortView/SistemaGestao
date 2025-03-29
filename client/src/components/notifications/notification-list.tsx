import { useQuery, useMutation } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { Link } from "wouter";
import { Bell, Check, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getTimeAgo, notificationIcons } from "@/lib/types";

interface NotificationListProps {
  notifications?: Notification[];
  isLoading?: boolean;
  limit?: number;
  showViewAll?: boolean;
}

const NotificationList = ({ 
  notifications, 
  isLoading = false, 
  limit = 10,
  showViewAll = false
}: NotificationListProps) => {
  const { data, isLoading: isLoadingQuery } = useQuery<{ data: Notification[] }>({
    queryKey: ['/api/notifications', { limit }],
    enabled: !notifications, // Only fetch if notifications are not provided
  });

  const displayNotifications = notifications || data?.data || [];
  const loading = isLoading || isLoadingQuery;

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PATCH', `/api/notifications/${id}`, { isRead: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/notifications/mark-all-read', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Notificações recentes</h3>
        {showViewAll && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              Marcar todas como lidas
            </Button>
            <Link href="/notificacoes">
              <Button variant="link" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ul role="list" className="divide-y divide-gray-200">
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <li key={index} className="px-1 py-4 sm:px-0">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </li>
            ))
          ) : displayNotifications.length > 0 ? (
            displayNotifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`px-1 py-4 sm:px-0 hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className={`h-8 w-8 rounded-full bg-${notification.type}-100 flex items-center justify-center`}>
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-gray-900 ${
                      !notification.isRead ? 'font-semibold' : ''
                    }`}>
                      {notification.title}
                      {!notification.isRead && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                          Nova
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {notification.message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-xs text-gray-500">{getTimeAgo(notification.createdAt)}</p>
                    {!notification.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs mt-1"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        Marcar como lida
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-8">
              <div className="flex flex-col items-center justify-center text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">Nenhuma notificação</p>
                <p className="text-sm text-gray-400">
                  Você será notificado quando houver atualizações sobre seus documentos.
                </p>
              </div>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default NotificationList;
