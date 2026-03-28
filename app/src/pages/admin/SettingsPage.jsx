import React, { useState } from 'react';
import { 
  Settings, 
  Bell,
  Shield,
  Database,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { adminAPI } from '@/services/api';
import { toast } from 'sonner';

const SettingsPage = () => {
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [isCleaning, setIsCleaning] = useState(false);

  const handleCleanup = async () => {
    setIsCleaning(true);
    try {
      await adminAPI.cleanupOldData({ days: cleanupDays, type: 'all' });
      toast.success('Очистка выполнена успешно');
      setIsCleanupDialogOpen(false);
    } catch (error) {
      toast.error('Ошибка при очистке');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Настройки</h1>
        <p className="text-frost-400 mt-1">Управление системой</p>
      </div>

      {/* Settings Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Settings className="w-5 h-5 text-ice-400" />
              <span>Общие настройки</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Уведомления</Label>
                <p className="text-sm text-frost-400">Включить push-уведомления</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Авто-очистка</Label>
                <p className="text-sm text-frost-400">Автоматическая очистка старых логов</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-ice-400" />
              <span>Безопасность</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Двухфакторная аутентификация</Label>
                <p className="text-sm text-frost-400">Требовать 2FA для админов</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Логирование</Label>
                <p className="text-sm text-frost-400">Логировать все действия</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card className="glass-card border-0 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Database className="w-5 h-5 text-ice-400" />
              <span>База данных</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-frost-800/30">
              <div>
                <Label className="text-white">Очистка старых данных</Label>
                <p className="text-sm text-frost-400">
                  Удалить логи и уведомления старше указанного количества дней
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setIsCleanupDialogOpen(true)}
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Очистить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cleanup Dialog */}
      <Dialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
        <DialogContent className="glass-card border-frost-700/50">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Подтвердите очистку</span>
            </DialogTitle>
            <DialogDescription className="text-frost-400">
              Это действие нельзя отменить. Все данные старше указанного количества дней будут удалены.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-white">Удалить данные старше (дней)</Label>
              <Input
                type="number"
                value={cleanupDays}
                onChange={(e) => setCleanupDays(parseInt(e.target.value))}
                className="frost-input"
                min="1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCleanupDialogOpen(false)}
              className="border-frost-600 text-frost-300"
            >
              Отмена
            </Button>
            <Button
              onClick={handleCleanup}
              disabled={isCleaning}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              {isCleaning ? 'Очистка...' : 'Подтвердить удаление'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
