import React, { useEffect, useState } from 'react';
import { 
  ScrollText, 
  Search,
  Filter,
  Clock,
  User,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logAPI } from '@/services/api';
import { toast } from 'sonner';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.action = filter;
      
      const response = await logAPI.getAll(params);
      setLogs(response.data.data.logs || []);
    } catch (error) {
      toast.error('Ошибка при загрузке логов');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('login')) return 'text-green-400 bg-green-500/10';
    if (action.includes('logout')) return 'text-yellow-400 bg-yellow-500/10';
    if (action.includes('approve')) return 'text-green-400 bg-green-500/10';
    if (action.includes('reject')) return 'text-red-400 bg-red-500/10';
    if (action.includes('ban')) return 'text-red-400 bg-red-500/10';
    return 'text-ice-400 bg-ice-500/10';
  };

  const filteredLogs = logs.filter(log => 
    log.description?.toLowerCase().includes(search.toLowerCase()) ||
    log.actorId?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Логи</h1>
        <p className="text-frost-400 mt-1">История действий в системе</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-frost-500" />
          <Input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="frost-input pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48 frost-input">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Все действия" />
          </SelectTrigger>
          <SelectContent className="glass-card">
            <SelectItem value="all">Все действия</SelectItem>
            <SelectItem value="login">Входы</SelectItem>
            <SelectItem value="application">Заявки</SelectItem>
            <SelectItem value="user">Пользователи</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-ice-500/30 border-t-ice-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-2">
          {filteredLogs.map((log, index) => (
            <Card key={index} className="glass-card border-0">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActionColor(log.action)}`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-white font-medium">{log.description}</p>
                      <Badge variant="outline" className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-frost-500">
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{log.actorId?.username || 'Система'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(log.timestamp).toLocaleString('ru-RU')}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 glass-card rounded-xl">
          <ScrollText className="w-16 h-16 mx-auto mb-4 text-frost-600" />
          <h3 className="text-xl font-semibold text-white mb-2">Нет логов</h3>
          <p className="text-frost-400">{search ? 'По вашему запросу ничего не найдено' : 'Логи появятся здесь'}</p>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
