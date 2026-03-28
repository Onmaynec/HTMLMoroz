import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { 
  Users, 
  MessageSquare, 
  Bell, 
  TrendingUp,
  Calendar,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { userAPI, notificationAPI } from '@/services/api';
import { toast } from 'sonner';

const DashboardPage = () => {
  const { user } = useAuth();
  const { unreadNotifications } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [onlineRes, notificationsRes] = await Promise.all([
        userAPI.getOnlineUsers(),
        notificationAPI.getAll({ limit: 5 })
      ]);

      setOnlineUsers(onlineRes.data.data.users || []);
      setRecentNotifications(notificationsRes.data.data.notifications || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Доброй ночи';
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const stats = [
    {
      title: 'Онлайн',
      value: onlineUsers.length,
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Уведомления',
      value: unreadNotifications,
      icon: Bell,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Статус',
      value: user?.role === 'admin' ? 'Админ' : 'Участник',
      icon: Shield,
      color: 'text-ice-400',
      bgColor: 'bg-ice-500/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-card p-8 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {getGreeting()}, {user?.username}!
            </h1>
            <p className="text-frost-400">
              Рады видеть вас в ICE FAMILY
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Badge 
              variant="outline" 
              className="bg-ice-500/10 text-ice-400 border-ice-500/30 px-4 py-2"
            >
              <Zap className="w-4 h-4 mr-2" />
              {user?.role === 'admin' ? 'Администратор' : 'Участник'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-frost-400">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color} mt-1`}>
                    {stat.value}
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

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Online Users */}
        <Card className="glass-card border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-ice-400" />
              <span>Участники онлайн</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {onlineUsers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {onlineUsers.map((onlineUser) => (
                  <div 
                    key={onlineUser._id} 
                    className="flex flex-col items-center p-4 rounded-lg bg-frost-800/30 hover:bg-frost-800/50 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12 border-2 border-ice-500/30">
                        <AvatarImage src={onlineUser.avatar} />
                        <AvatarFallback className="bg-ice-500/20 text-ice-400">
                          {onlineUser.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-frost-900" />
                    </div>
                    <p className="mt-2 text-sm text-white text-center truncate w-full">
                      {onlineUser.username}
                    </p>
                    <p className="text-xs text-frost-500">
                      {onlineUser.gameNickname}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-frost-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Сейчас никого нет онлайн</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Bell className="w-5 h-5 text-ice-400" />
              <span>Последние уведомления</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentNotifications.length > 0 ? (
              <div className="space-y-4">
                {recentNotifications.map((notification) => (
                  <div 
                    key={notification._id}
                    className={`p-3 rounded-lg ${
                      notification.isRead 
                        ? 'bg-frost-800/20' 
                        : 'bg-ice-500/10 border border-ice-500/20'
                    }`}
                  >
                    <p className="text-sm font-medium text-white">
                      {notification.title}
                    </p>
                    <p className="text-xs text-frost-400 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-frost-500 mt-2">
                      {new Date(notification.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-frost-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Нет уведомлений</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-ice-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-ice-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Дата вступления
                </h3>
                <p className="text-frost-400">
                  {user?.joinedAt 
                    ? new Date(user.joinedAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Неизвестно'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-ice-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-ice-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Последняя активность
                </h3>
                <p className="text-frost-400">
                  {user?.lastActive 
                    ? new Date(user.lastActive).toLocaleString('ru-RU')
                    : 'Неизвестно'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
