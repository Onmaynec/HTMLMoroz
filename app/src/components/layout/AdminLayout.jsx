import React from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MessageSquare, 
  ScrollText,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadNotifications, isConnected } = useSocket();
  const location = useLocation();

  // Redirect if not admin
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const sidebarItems = [
    { path: '/admin', label: 'Дашборд', icon: LayoutDashboard },
    { path: '/admin/applications', label: 'Заявки', icon: FileText },
    { path: '/admin/users', label: 'Пользователи', icon: Users },
    { path: '/admin/logs', label: 'Логи', icon: ScrollText },
    { path: '/admin/settings', label: 'Настройки', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 glass-card border-r border-frost-700/30 flex-shrink-0 hidden lg:flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-frost-700/30">
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ice-500 to-ice-600 flex items-center justify-center shadow-ice-glow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">ADMIN</span>
              <p className="text-xs text-ice-400">Панель управления</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive(item.path)
                  ? 'bg-ice-500/20 text-ice-400 border border-ice-500/30'
                  : 'text-frost-300 hover:text-white hover:bg-frost-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Back to Site */}
        <div className="p-4 border-t border-frost-700/30">
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-frost-300 hover:text-white hover:bg-frost-800/50 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>На сайт</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="glass-card border-b border-frost-700/30 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Mobile Menu & Breadcrumb */}
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="lg:hidden">
                <Shield className="w-8 h-8 text-ice-400" />
              </Link>
              <h1 className="text-xl font-semibold text-white hidden sm:block">
                {sidebarItems.find(item => isActive(item.path))?.label || 'Админ панель'}
              </h1>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div 
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
                title={isConnected ? 'Подключено' : 'Отключено'}
              />

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 text-frost-300" />
                    {unreadNotifications > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 glass-card">
                  <DropdownMenuLabel>Уведомления</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="py-2 text-center text-sm text-frost-400">
                    Нет новых уведомлений
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-ice-500/30">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-ice-500/20 text-ice-400">
                        {user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.username}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-frost-400">{user?.email}</p>
                      <Badge variant="outline" className="w-fit mt-1 bg-ice-500/20 text-ice-400 border-ice-500/30">
                        Администратор
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                    <Shield className="mr-2 h-4 w-4" />
                    Профиль
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    На сайт
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="lg:hidden glass-card border-b border-frost-700/30 overflow-x-auto">
          <nav className="flex space-x-1 p-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  isActive(item.path)
                    ? 'bg-ice-500/20 text-ice-400 border border-ice-500/30'
                    : 'text-frost-300 hover:text-white hover:bg-frost-800/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
