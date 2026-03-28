import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ChevronLeft, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { applicationAPI } from '@/services/api';
import { toast } from 'sonner';

const ApplicationStatusPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDiscord = searchParams.get('discord') || '';
  
  const [discordUsername, setDiscordUsername] = useState(initialDiscord);
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialDiscord);

  React.useEffect(() => {
    if (initialDiscord) {
      checkStatus(initialDiscord);
    }
  }, [initialDiscord]);

  const checkStatus = async (discord) => {
    setIsLoading(true);
    try {
      const response = await applicationAPI.checkMyApplication(discord);
      setApplication(response.data.data.application);
    } catch (error) {
      setApplication(null);
      if (hasSearched) {
        toast.error('Заявка не найдена');
      }
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!discordUsername.trim()) return;
    
    setSearchParams({ discord: discordUsername });
    checkStatus(discordUsername);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: Clock,
        title: 'Ожидает рассмотрения',
        description: 'Ваша заявка находится в очереди на рассмотрение. Обычно это занимает до 24 часов.',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30'
      },
      under_review: {
        icon: AlertCircle,
        title: 'На рассмотрении',
        description: 'Администратор рассматривает вашу заявку. Мы скоро свяжемся с вами.',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30'
      },
      approved: {
        icon: CheckCircle,
        title: 'Заявка одобрена!',
        description: 'Поздравляем! Ваша заявка одобрена. Теперь вы можете зарегистрироваться.',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30'
      },
      rejected: {
        icon: XCircle,
        title: 'Заявка отклонена',
        description: 'К сожалению, ваша заявка была отклонена. Вы можете подать заявку повторно через неделю.',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30'
      }
    };
    return configs[status] || configs.pending;
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-frost-400 hover:text-ice-400 transition-colors mb-6">
            <ChevronLeft className="w-5 h-5 mr-1" />
            На главную
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ice-500 to-ice-600 flex items-center justify-center shadow-ice-glow">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Проверить статус</h1>
              <p className="text-frost-400">Узнайте статус вашей заявки</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-frost-500" />
              <Input
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="Введите ваш Discord (username#1234)"
                className="frost-input pl-10"
              />
            </div>
            <Button 
              type="submit" 
              className="btn-neon"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Проверить
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Results */}
        {hasSearched && (
          <>
            {application ? (
              <Card className={`glass-card border-0 overflow-hidden`}>
                <div className={`p-6 ${getStatusConfig(application.status).bgColor} border-b ${getStatusConfig(application.status).borderColor}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full ${getStatusConfig(application.status).bgColor} flex items-center justify-center`}>
                      {React.createElement(getStatusConfig(application.status).icon, {
                        className: `w-8 h-8 ${getStatusConfig(application.status).color}`
                      })}
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${getStatusConfig(application.status).color}`}>
                        {getStatusConfig(application.status).title}
                      </h2>
                      <p className="text-frost-400 mt-1">
                        {application.gameNickname}
                      </p>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-6">
                  <p className="text-frost-300">
                    {getStatusConfig(application.status).description}
                  </p>

                  {application.reviewNotes && (
                    <div className="p-4 rounded-lg bg-frost-800/50">
                      <p className="text-sm text-frost-400 mb-1">Комментарий:</p>
                      <p className="text-white">{application.reviewNotes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-frost-500">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Подано: {new Date(application.submittedAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    {application.reviewedAt && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          Рассмотрено: {new Date(application.reviewedAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    )}
                  </div>

                  {application.canRegister && (
                    <Link to={`/register?application=${application.id}`}>
                      <Button className="w-full btn-neon mt-4">
                        Зарегистрироваться
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  )}

                  {application.status === 'rejected' && (
                    <Link to="/apply">
                      <Button variant="outline" className="w-full border-ice-500/30 text-ice-400 mt-4">
                        Подать новую заявку
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card border-0 p-8 text-center">
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Заявка не найдена
                </h3>
                <p className="text-frost-400 mb-6">
                  По указанному Discord не найдено ни одной заявки. 
                  Проверьте правильность ввода или подайте новую заявку.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/apply">
                    <Button className="btn-neon">
                      Подать заявку
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Info */}
        {!hasSearched && (
          <Card className="glass-card border-0 p-6">
            <div className="flex items-start space-x-4">
              <MessageSquare className="w-6 h-6 text-ice-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Как проверить статус?
                </h3>
                <ul className="space-y-2 text-frost-400">
                  <li>• Введите ваш Discord в формате username#1234</li>
                  <li>• Нажмите кнопку "Проверить"</li>
                  <li>• Вы увидите текущий статус вашей заявки</li>
                  <li>• При одобрении вы сможете зарегистрироваться</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApplicationStatusPage;
