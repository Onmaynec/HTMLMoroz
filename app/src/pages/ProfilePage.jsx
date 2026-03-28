import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  MessageCircle, 
  Calendar, 
  Clock,
  Camera,
  Save,
  Edit3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { userAPI } from '@/services/api';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    discordUsername: user?.discordUsername || '',
    gameNickname: user?.gameNickname || '',
    age: user?.age || '',
    rpExperience: user?.rpExperience || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await userAPI.updateProfile(formData);
      updateUser(response.data.data.user);
      toast.success('Профиль обновлен');
      setIsEditing(false);
    } catch (error) {
      toast.error('Ошибка при обновлении профиля');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой (максимум 5MB)');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await userAPI.uploadAvatar(formData);
      updateUser({ avatar: response.data.data.avatar });
      toast.success('Аватар обновлен');
    } catch (error) {
      toast.error('Ошибка при загрузке аватара');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Мой профиль</h1>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={isEditing ? 'btn-neon' : 'border-ice-500/30 text-ice-400'}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4 mr-2" />
              Редактировать
            </>
          )}
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="glass-card border-0">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-ice-500/30 cursor-pointer group"
                onClick={handleAvatarClick}
              >
                <Avatar className="w-full h-full">
                  <AvatarImage src={user?.avatar} className="object-cover" />
                  <AvatarFallback className="bg-ice-500/20 text-ice-400 text-4xl">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2">
                <Badge 
                  variant={user?.isOnline ? 'default' : 'secondary'}
                  className={user?.isOnline ? 'bg-green-500' : 'bg-frost-600'}
                >
                  {user?.isOnline ? 'Онлайн' : 'Оффлайн'}
                </Badge>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-1">
                {user?.username}
              </h2>
              <p className="text-frost-400 mb-4">{user?.email}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge 
                  variant="outline" 
                  className="bg-ice-500/10 text-ice-400 border-ice-500/30"
                >
                  {user?.role === 'admin' ? 'Администратор' : 'Участник'}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="bg-frost-800/50 text-frost-300"
                >
                  {user?.gameNickname}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <User className="w-5 h-5 text-ice-400" />
              <span>Личная информация</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-frost-400 flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Discord</span>
              </Label>
              {isEditing ? (
                <Input
                  name="discordUsername"
                  value={formData.discordUsername}
                  onChange={handleChange}
                  className="frost-input"
                />
              ) : (
                <p className="text-white">{user?.discordUsername}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-frost-400 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Игровой ник</span>
              </Label>
              {isEditing ? (
                <Input
                  name="gameNickname"
                  value={formData.gameNickname}
                  onChange={handleChange}
                  className="frost-input"
                />
              ) : (
                <p className="text-white">{user?.gameNickname}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-frost-400 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Возраст</span>
              </Label>
              {isEditing ? (
                <Input
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  className="frost-input"
                />
              ) : (
                <p className="text-white">{user?.age} лет</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RP Info */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-ice-400" />
              <span>RP Опыт</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-frost-400">Опыт в GTA RP</Label>
              {isEditing ? (
                <Textarea
                  name="rpExperience"
                  value={formData.rpExperience}
                  onChange={handleChange}
                  rows={4}
                  className="frost-input resize-none"
                />
              ) : (
                <p className="text-white whitespace-pre-wrap">
                  {user?.rpExperience || 'Не указано'}
                </p>
              )}
            </div>

            <Separator className="bg-frost-700/50" />

            <div className="space-y-2">
              <Label className="text-frost-400">Дата регистрации</Label>
              <p className="text-white">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
