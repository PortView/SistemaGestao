import { DashboardStats } from "@/lib/types";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusCardsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

const StatusCards = ({ stats, isLoading = false }: StatusCardsProps) => {
  const cards = [
    {
      title: "Total de Documentos",
      value: stats?.documentCount || 0,
      icon: <FileText className="h-6 w-6 text-primary" />,
      link: "/documentos",
      linkText: "Ver todos",
      bgColor: "bg-primary",
    },
    {
      title: "Pendentes",
      value: stats?.pendingCount || 0,
      icon: <Clock className="h-6 w-6 text-amber-500" />,
      link: "/documentos?status=pendente",
      linkText: "Ver pendentes",
      bgColor: "bg-amber-500",
    },
    {
      title: "Aprovados",
      value: stats?.approvedCount || 0,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      link: "/documentos?status=aprovado",
      linkText: "Ver aprovados",
      bgColor: "bg-green-600",
    },
    {
      title: "Expirados",
      value: stats?.expiredCount || 0,
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      link: "/documentos?status=expirado",
      linkText: "Ver expirados",
      bgColor: "bg-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {card.icon}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                  <dd>
                    {isLoading ? (
                      <Skeleton className="h-7 w-16" />
                    ) : (
                      <div className="text-lg font-medium text-gray-900">{card.value}</div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href={card.link} className="font-medium text-primary hover:text-blue-700">
                {card.linkText}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusCards;
