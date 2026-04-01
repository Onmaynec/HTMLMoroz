import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Target, 
  TrendingUp, 
  MessageCircle, 
  ChevronRight,
  Zap,
  Award,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const benefits = [
    {
      icon: Target,
      title: 'Сильные контракты',
      description: 'Регулярные высокооплачиваемые контракты с гарантированным доходом для всех участников'
    },
    {
      icon: Users,
      title: 'Структурированность',
      description: 'Четкая иерархия и распределение ролей. Каждый знает свои обязанности'
    },
    {
      icon: Heart,
      title: 'Адекватный состав',
      description: 'Только проверенные игроки без токсичности и конфликтов'
    },
    {
      icon: TrendingUp,
      title: 'Помощь в развитии',
      description: 'Обучение новичков, помощь с фармом и развитием персонажа'
    }
  ];

  const stats = [
    { value: '50+', label: 'Активных участников' },
    { value: '100+', label: 'Выполненных контрактов' },
    { value: '24/7', label: 'Поддержка онлайн' },
    { value: 'Top 10', label: 'Рейтинг сервера' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-ice-950/50 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ice-500/10 via-transparent to-transparent" />
        
        {/* Floating Particles Effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-ice-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-ice-500/10 border border-ice-500/30 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-ice-400" />
            <span className="text-sm text-ice-300">GTA 5 RP Family</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in delay-100">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ice-400 via-cyan-400 to-ice-500 text-glow-ice">
              ICE FAMILY
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-frost-300 mb-4 max-w-3xl mx-auto animate-fade-in delay-200">
            Элитная организация для тех, кто стремится к вершинам
          </p>
          <p className="text-lg text-frost-400 mb-12 max-w-2xl mx-auto animate-fade-in delay-300">
            Присоединяйтесь к закрытому сообществу профессиональных игроков. 
            Вместе мы достигаем большего.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in delay-400">
            <Link to="/apply">
              <Button size="lg" className="btn-neon text-lg px-8 py-6">
                Подать заявку
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/status">
              <Button size="lg" variant="outline" className="border-ice-500/30 text-ice-400 hover:bg-ice-500/10 text-lg px-8 py-6">
                Проверить статус
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 animate-fade-in delay-500">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="glass-card-hover p-6 rounded-xl"
              >
                <div className="text-3xl sm:text-4xl font-bold text-ice-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-frost-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-ice-500/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-ice-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Почему <span className="text-ice-400">ICE FAMILY</span>?
            </h2>
            <p className="text-lg text-frost-400 max-w-2xl mx-auto">
              Мы создали организацию, в которой каждый участник получает максимум возможностей для развития
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="glass-card-hover p-8 rounded-xl group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-ice-500/20 to-ice-600/10 flex items-center justify-center border border-ice-500/30 group-hover:shadow-ice-glow transition-all duration-300">
                    <benefit.icon className="w-7 h-7 text-ice-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-frost-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-24 relative bg-frost-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Требования к <span className="text-ice-400">кандидатам</span>
              </h2>
              <p className="text-lg text-frost-400 mb-8">
                Мы ищем активных и целеустремленных игроков, готовых развиваться вместе с нами
              </p>

              <ul className="space-y-4">
                {[
                  'Возраст от 16 лет',
                  'Опыт игры в GTA RP от 100 часов',
                  'Наличие микрофона и Discord',
                  'Адекватное поведение и отсутствие токсичности',
                  'Готовность следовать правилам организации',
                  'Активная игровая активность'
                ].map((requirement, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-ice-500/20 flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 text-ice-400" />
                    </div>
                    <span className="text-frost-300">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right - CTA Card */}
            <div className="glass-card p-8 rounded-2xl border border-ice-500/20">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-ice-500 to-ice-600 flex items-center justify-center shadow-ice-glow">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Готовы присоединиться?
                </h3>
                <p className="text-frost-400 mb-8">
                  Заполните заявку и мы рассмотрим её в ближайшее время. 
                  Обычно ответ приходит в течение 24 часов.
                </p>
                <Link to="/apply">
                  <Button size="lg" className="btn-neon w-full">
                    Подать заявку сейчас
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-frost-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ice-500 to-ice-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                <span className="text-ice-400">ICE</span> FAMILY
              </span>
            </div>
            <p className="text-frost-500 text-sm">
              © 2024 ICE FAMILY. GTA 5 RP Organization.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
