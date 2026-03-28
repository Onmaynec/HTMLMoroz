import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Shield,
  Ban,
  CheckCircle,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { userAPI } from '@/services/api';
import { toast } from 'sonner';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.role = filter;
      if (search) params.search = search;
      
      const response = await userAPI.getAll(params);
      setUsers(response.data.data.users || []);
    } catch (error) {
      toast.error('Ошибка при загрузке пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userAPI.changeRole(userId, newRole);
      toast.success('Роль изменена');
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка при изменении роли');
    }
  };

  const handleBanToggle = async (user) => {
    try {
      await userAPI.toggleBan(user._id);
      toast.success(user.status === 'banned' ? 'Пользователь разблокирован' : 'Пользователь заблокирован');
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка при изменении статуса');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.gameNickname?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Пользователи</h1>
        <p className="text-frost-400 mt-1">Управление участниками</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-frost-500" />
          <Input
            placeholder="Поиск по нику..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="frost-input pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48 frost-input">
            <Users className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Все роли" />
          </SelectTrigger>
          <SelectContent className="glass-card">
            <SelectItem value="all">Все роли</SelectItem>
            <SelectItem value="admin">Администраторы</SelectItem>
            <SelectItem value="member">Участники</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-ice-500/30 border-t-ice-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="glass-card border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12 border-2 border-ice-500/30">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-ice-500/20 text-ice-400">
                          {user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-frost-900" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white">{user.username}</h3>
                        <Badge 
                          variant="outline" 
                          className={user.role === 'admin' 
                            ? 'bg-ice-500/20 text-ice-400 border-ice-500/30' 
                            : 'bg-frost-800 text-frost-300'
                          }
                        >
                          {user.role === 'admin' ? 'Админ' : 'Участник'}
                        </Badge>
                        {user.status === 'banned' && (
                          <Badge variant="destructive">Заблокирован</Badge>
                        )}
                      </div>
                      <p className="text-sm text-frost-400">{user.gameNickname}</p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-card">
                      <DropdownMenuItem onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'member' : 'admin')}>
                        <Shield className="w-4 h-4 mr-2" />
                        {user.role === 'admin' ? 'Снять админа' : 'Сделать админом'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleBanToggle(user)}
                        className={user.status === 'banned' ? 'text-green-400' : 'text-red-400'}
                      >
                        {user.status === 'banned' ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Разблокировать
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-2" />
                            Заблокировать
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 glass-card rounded-xl">
          <Users className="w-16 h-16 mx-auto mb-4 text-frost-600" />
          <h3 className="text-xl font-semibold text-white mb-2">Нет пользователей</h3>
          <p className="text-frost-400">{search ? 'По вашему запросу ничего не найдено' : 'Пользователи появятся здесь'}</p>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
