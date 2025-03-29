import { useQuery } from "@tanstack/react-query";
import NotificationList from "@/components/notifications/notification-list";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export default function Notifications() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/notifications", { limit: 50 }],
  });
  
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/notifications/mark-all-read', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  return (
    <div className="flex-1 relative pb-8 z-0 overflow-y-auto">
      {/* Page header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Notificações</h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button
                variant="outline"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <Check className="-ml-1 mr-2 h-4 w-4" />
                Marcar todas como lidas
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
            {data?.data && data.data.length > 0 ? (
              <NotificationList 
                notifications={data.data} 
                isLoading={isLoading} 
                limit={50} 
                showViewAll={false}
              />
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <Bell className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma notificação</h3>
                <p className="text-gray-500 max-w-md">
                  Você não tem nenhuma notificação no momento. Quando houver atualizações sobre seus documentos, elas aparecerão aqui.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
