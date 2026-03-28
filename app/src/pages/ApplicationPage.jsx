import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ChevronLeft, 
  Send, 
  User, 
  MessageCircle, 
  Calendar, 
  Clock, 
  Briefcase,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { applicationAPI } from '@/services/api';
import { toast } from 'sonner';

const ApplicationPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    gameNickname: '',
    discordUsername: '',
    age: '',
    rpExperience: '',
    previousFamilies: '',
    motivation: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.gameNickname.trim() || formData.gameNickname.length < 3) {
      newErrors.gameNickname = 'Введите корректный игровой ник (минимум 3 символа)';
    }

    if (!formData.discordUsername.trim()) {
      newErrors.discordUsername = 'Введите ваш Discord';
    } else if (!/^.{3,32}#\d{4}$|^[a-zA-Z0-9_.]{2,32}$/.test(formData.discordUsername)) {
      newErrors.discordUsername = 'Неверный формат Discord (username#1234 или username)';
    }

    if (!formData.age || formData.age < 16 || formData.age > 99) {
      newErrors.age = 'Введите корректный возраст (16-99)';
    }

    if (!formData.rpExperience.trim() || formData.rpExperience.length < 10) {
      newErrors.rpExperience = 'Опишите ваш опыт (минимум 10 символов)';
    }

    if (!formData.motivation.trim() || formData.motivation.length < 50) {
      newErrors.motivation = 'Опишите вашу мотивацию подробнее (минимум 50 символов)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await applicationAPI.create({
        ...formData,
        age: parseInt(formData.age)
      });

      toast.success('Заявка успешно отправлена!', {
        description: 'Мы рассмотрим её в ближайшее время'
      });

      // Redirect to status page with discord username
      navigate(`/status?discord=${encodeURIComponent(formData.discordUsername)}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Ошибка при отправке заявки';
      toast.error(message);
      
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach(err => {
          apiErrors[err.field] = err.message;
        });
        setErrors(apiErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-frost-400 hover:text-ice-400 transition-colors mb-6">
            <ChevronLeft className="w-5 h-5 mr-1" />
            На главную
          </Link>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ice-500 to-ice-600 flex items-center justify-center shadow-ice-glow">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Подать заявку</h1>
              <p className="text-frost-400">Заполните все поля для рассмотрения</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-8 rounded-2xl space-y-6">
            {/* Game Nickname */}
            <div className="space-y-2">
              <Label htmlFor="gameNickname" className="text-white flex items-center space-x-2">
                <User className="w-4 h-4 text-ice-400" />
                <span>Игровой ник</span>
              </Label>
              <Input
                id="gameNickname"
                name="gameNickname"
                value={formData.gameNickname}
                onChange={handleChange}
                placeholder="Введите ваш ник в игре"
                className={`frost-input ${errors.gameNickname ? 'border-red-500/50' : ''}`}
              />
              {errors.gameNickname && (
                <p className="text-red-400 text-sm">{errors.gameNickname}</p>
              )}
            </div>

            {/* Discord */}
            <div className="space-y-2">
              <Label htmlFor="discordUsername" className="text-white flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-ice-400" />
                <span>Discord</span>
              </Label>
              <Input
                id="discordUsername"
                name="discordUsername"
                value={formData.discordUsername}
                onChange={handleChange}
                placeholder="username#1234 или username"
                className={`frost-input ${errors.discordUsername ? 'border-red-500/50' : ''}`}
              />
              {errors.discordUsername && (
                <p className="text-red-400 text-sm">{errors.discordUsername}</p>
              )}
              <p className="text-xs text-frost-500">
                Укажите ваш точный Discord для связи
              </p>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-ice-400" />
                <span>Возраст</span>
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="16"
                max="99"
                value={formData.age}
                onChange={handleChange}
                placeholder="Введите ваш возраст"
                className={`frost-input ${errors.age ? 'border-red-500/50' : ''}`}
              />
              {errors.age && (
                <p className="text-red-400 text-sm">{errors.age}</p>
              )}
            </div>

            {/* RP Experience */}
            <div className="space-y-2">
              <Label htmlFor="rpExperience" className="text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-ice-400" />
                <span>Опыт в GTA RP</span>
              </Label>
              <Textarea
                id="rpExperience"
                name="rpExperience"
                value={formData.rpExperience}
                onChange={handleChange}
                placeholder="Расскажите о вашем опыте игры в GTA RP. Сколько часов наиграно, на каких серверах играли, какой опыт получили..."
                rows={4}
                className={`frost-input resize-none ${errors.rpExperience ? 'border-red-500/50' : ''}`}
              />
              {errors.rpExperience && (
                <p className="text-red-400 text-sm">{errors.rpExperience}</p>
              )}
            </div>

            {/* Previous Families */}
            <div className="space-y-2">
              <Label htmlFor="previousFamilies" className="text-white flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-ice-400" />
                <span>Прошлые фамы/фракции</span>
              </Label>
              <Textarea
                id="previousFamilies"
                name="previousFamilies"
                value={formData.previousFamilies}
                onChange={handleChange}
                placeholder="Укажите организации, в которых вы ранее состояли (если есть)"
                rows={3}
                className="frost-input resize-none"
              />
              <p className="text-xs text-frost-500">
                Необязательное поле
              </p>
            </div>

            {/* Motivation */}
            <div className="space-y-2">
              <Label htmlFor="motivation" className="text-white flex items-center space-x-2">
                <Heart className="w-4 h-4 text-ice-400" />
                <span>Почему хотите к нам?</span>
              </Label>
              <Textarea
                id="motivation"
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                placeholder="Расскажите, почему вы хотите присоединиться к нашей организации. Что вас привлекает, какие цели ставите..."
                rows={5}
                className={`frost-input resize-none ${errors.motivation ? 'border-red-500/50' : ''}`}
              />
              {errors.motivation && (
                <p className="text-red-400 text-sm">{errors.motivation}</p>
              )}
              <p className="text-xs text-frost-500">
                Минимум 50 символов
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-frost-500 text-center sm:text-left">
              Отправляя заявку, вы соглашаетесь с правилами организации
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="btn-neon min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Отправить заявку
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Info Card */}
        <div className="mt-8 glass-card p-6 rounded-xl">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-lg bg-ice-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-ice-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Что дальше?
              </h3>
              <ul className="space-y-2 text-frost-400">
                <li>• Мы рассмотрим вашу заявку в течение 24 часов</li>
                <li>• Вы получите уведомление о решении на указанный Discord</li>
                <li>• При одобрении вы сможете зарегистрироваться на сайте</li>
                <li>• В случае отклонения вы можете подать заявку повторно через неделю</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;
