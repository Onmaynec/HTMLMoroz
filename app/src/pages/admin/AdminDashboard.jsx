import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI, applicationAPI, userAPI } from '@/services/api';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, online: 0, newThisWeek: 0 },
    applications: { pending: 0, under_review: 0, approved: 0, rejected: 0, total: 0 },
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, appStatsRes, userStatsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        applicationAPI.getStats(),
        userAPI.getStats()
      ]);

      setStats({
        users: dashboardRes.data.data.users,
        applications: dashboardRes.data.data.applications,
        recentActivity: dashboardRes.data.data.recentActivity
      });
    } catch (error) {
      toast.error('Ошибка при загрузке данных');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Всего пользователей',
      value: stats.users.total,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Онлайн',
      value: stats.users.online,
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Новых за неделю',
      value: stats.users.newThisWeek,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Заявок на рассмотрении',
      value: stats.applications.pending + stats.applications.under_review,
      icon: FileText,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  const applicationStats = [
    { label: 'Ожидают', value: stats.applications.pending, color: 'text-yellow-400', icon: Clock },
    { label: 'На рассмотрении', value: stats.applications.under_review, color: 'text-blue-400', icon: AlertCircle },
    { label: 'Одобрены', value: stats.applications.approved, color: 'text-green-400', icon: CheckCircle },
    { label: 'Отклонены', value: stats.applications.rejected, color: 'text-red-400', icon: XCircle }
  ];

  const getActionIcon = (action) => {
    if (action.includes('login')) return <Activity className="w-4 h-4" />;
    if (action.includes('application')) return <FileText className="w-4 h-4" />;
    if (action.includes('user')) return <Users className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getActionColor = (action) => {
    if (action.includes('login')) return 'text-green-400';
    if (action.includes('approve')) return 'text-green-400';
    if (action.includes('reject')) return 'text-red-400';
    if (action.includes('ban')) return 'text-red-400';
    return 'text-ice-400';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Дашборд</h1>
        <p className="text-frost-400 mt-1">Обзор системы и статистика</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-frost-400">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color} mt-1`}>
                    {isLoading ? '-' : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Application Stats */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-ice-400" />
              <span>Статистика заявок</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {applicationStats.map((stat, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-frost-800/30 flex items-center space-x-3"
                >
                  <div className={`w-10 h-10 rounded-lg bg-frost-800 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {isLoading ? '-' : stat.value}
                    </p>
                    <p className="text-xs text-frost-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-ice-400" />
              <span>Последняя активность</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {stats.recentActivity.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-frost-800/30"
                  >
                    <div className={`mt-0.5 ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-frost-500 mt-1">
                        {activity.actorId?.username || 'Система'} • {' '}
                        {new Date(activity.timestamp).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-frost-500">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Нет недавней активности</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
