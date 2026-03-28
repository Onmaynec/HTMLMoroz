import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { applicationAPI } from '@/services/api';
import { toast } from 'sonner';

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      
      const response = await applicationAPI.getAll(params);
      setApplications(response.data.data.applications || []);
    } catch (error) {
      toast.error('Ошибка при загрузке заявок');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedApp || !newStatus) return;

    setIsUpdating(true);
    try {
      await applicationAPI.updateStatus(selectedApp._id, {
        status: newStatus,
        notes: statusNotes
      });

      toast.success(`Статус заявки изменен на "${getStatusLabel(newStatus)}"`);
      fetchApplications();
      setIsStatusDialogOpen(false);
      setSelectedApp(null);
      setNewStatus('');
      setStatusNotes('');
    } catch (error) {
      toast.error('Ошибка при изменении статуса');
    } finally {
      setIsUpdating(false);
    }
  };

  const openStatusDialog = (app, status) => {
    setSelectedApp(app);
    setNewStatus(status);
    setIsStatusDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { class: 'status-pending', icon: Clock, label: 'Ожидает' },
      under_review: { class: 'status-under-review', icon: AlertCircle, label: 'На рассмотрении' },
      approved: { class: 'status-approved', icon: CheckCircle, label: 'Одобрена' },
      rejected: { class: 'status-rejected', icon: XCircle, label: 'Отклонена' }
    };
    return configs[status] || configs.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Ожидает рассмотрения',
      under_review: 'На рассмотрении',
      approved: 'Одобрена',
      rejected: 'Отклонена'
    };
    return labels[status] || status;
  };

  const filteredApplications = applications.filter(app => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      app.gameNickname?.toLowerCase().includes(searchLower) ||
      app.discordUsername?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Заявки</h1>
          <p className="text-frost-400 mt-1">
            Управление заявками на вступление
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-frost-500" />
          <Input
            placeholder="Поиск по нику или Discord..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="frost-input pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48 frost-input">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent className="glass-card">
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="pending">Ожидают</SelectItem>
            <SelectItem value="under_review">На рассмотрении</SelectItem>
            <SelectItem value="approved">Одобрены</SelectItem>
            <SelectItem value="rejected">Отклонены</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-ice-500/30 border-t-ice-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const statusBadge = getStatusBadge(app.status);
            return (
              <Card key={app._id} className="glass-card border-0 hover:bg-frost-800/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {app.gameNickname}
                        </h3>
                        <Badge className={statusBadge.class}>
                          <statusBadge.icon className="w-3 h-3 mr-1" />
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-frost-400">
                        <span>{app.discordUsername}</span>
                        <span>•</span>
                        <span>{app.age} лет</span>
                        <span>•</span>
                        <span>
                          {new Date(app.submittedAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <p className="mt-2 text-frost-500 line-clamp-2">
                        {app.motivation}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {app.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStatusDialog(app, 'under_review')}
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            На рассмотрение
                          </Button>
                        </>
                      )}
                      
                      {(app.status === 'pending' || app.status === 'under_review') && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => openStatusDialog(app, 'approved')}
                            className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Одобрить
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStatusDialog(app, 'rejected')}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Отклонить
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/applications/${app._id}/chat`)}
                        className="border-ice-500/30 text-ice-400 hover:bg-ice-500/10"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Чат
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 glass-card rounded-xl">
          <FileText className="w-16 h-16 mx-auto mb-4 text-frost-600" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Нет заявок
          </h3>
          <p className="text-frost-400">
            {search ? 'По вашему запросу ничего не найдено' : 'Заявки появятся здесь'}
          </p>
        </div>
      )}

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="glass-card border-frost-700/50">
          <DialogHeader>
            <DialogTitle className="text-white">
              Изменить статус заявки
            </DialogTitle>
            <DialogDescription className="text-frost-400">
              {selectedApp?.gameNickname} - {getStatusLabel(newStatus)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-frost-400">
                {newStatus === 'rejected' ? 'Причина отклонения' : 'Примечания'}
              </label>
              <Textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder={newStatus === 'rejected' 
                  ? 'Укажите причину отклонения...' 
                  : 'Добавьте примечания...'
                }
                className="frost-input resize-none"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
              className="border-frost-600 text-frost-300"
            >
              Отмена
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={isUpdating}
              className={newStatus === 'rejected' 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : newStatus === 'approved'
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'btn-neon'
              }
            >
              {isUpdating ? 'Сохранение...' : 'Подтвердить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationsPage;
