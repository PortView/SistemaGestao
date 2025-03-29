import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@/lib/types";
import StatusCards from "@/components/dashboard/status-cards";
import DocumentsList from "@/components/documents/document-list";
import NotificationList from "@/components/notifications/notification-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";

const Dashboard = () => {
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["/api/notifications", { limit: 3 }],
  });

  return (
    <div className="flex-1 relative pb-8 z-0 overflow-y-auto">
      {/* Page header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Dashboard</h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link to="/documentos/novo">
                <Button className="ml-3">
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Novo Documento
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Status cards */}
          <StatusCards stats={stats} isLoading={isLoadingStats} />

          {/* Recent documents */}
          <div className="mt-8">
            <DocumentsList 
              limit={5}
              showFilters={false}
              title="Documentos Recentes"
              viewAllLink="/documentos"
            />
          </div>

          {/* Recent notifications */}
          <div className="mt-8">
            <NotificationList 
              notifications={notifications?.data} 
              isLoading={isLoadingNotifications}
              limit={3}
              showViewAll={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
