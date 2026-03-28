import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shield, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  ChevronLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { toast } from 'sonner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('application');
  
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [applicationChecked, setApplicationChecked] = useState(false);
  const [applicationValid, setApplicationValid] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    applicationToken: applicationId || ''
  });
  const [errors, setErrors] = useState({});

  // Check application validity on mount
  React.useEffect(() => {
    if (applicationId) {
      checkApplication(applicationId);
    }
  }, [applicationId]);

  const checkApplication = async (id) => {
    try {
      const response = await authAPI.checkApplication(id);
      setApplicationValid(response.data.data.canRegister);
      setApplicationData(response.data.data);
      setApplicationChecked(true);
    } catch (error) {
      setApplicationValid(false);
      setApplicationChecked(true);
      toast.error('Заявка не найдена или уже использована');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim() || formData.username.length < 3) {
      newErrors.username = 'Имя пользователя должно быть от 3 символов';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть от 6 символов';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать заглавную, строчную букву и цифру';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (!formData.applicationToken) {
      newErrors.applicationToken = 'Требуется токен заявки';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      applicationToken: formData.applicationToken,
      discordUsername: applicationData?.discordUsername || '',
      gameNickname: applicationData?.gameNickname || '',
      age: 18
    });

    if (result.success) {
      navigate('/dashboard');
    }

    setIsLoading(false);
  };

  // Show application check first
  if (!applicationId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-ice-500/5 via-transparent to-transparent" />
        
        <div className="relative z-10 w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-frost-400 hover:text-ice-400 transition-colors mb-8">
            <ChevronLeft className="w-5 h-5 mr-1" />
            На главную
          </Link>

          <div className="glass-card p-8 rounded-2xl text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Требуется заявка
            </h1>
            <p className="text-frost-400 mb-6">
              Регистрация доступна только после одобрения заявки. 
              Пожалуйста, подайте заявку или проверьте её статус.
            </p>
            <div className="flex flex-col space-y-3">
              <Link to="/apply">
                <Button className="w-full btn-neon">
                  Подать заявку
                </Button>
              </Link>
              <Link to="/status">
                <Button variant="outline" className="w-full border-ice-500/30 text-ice-400">
                  Проверить статус
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (applicationChecked && !applicationValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-transparent to-transparent" />
        
        <div className="relative z-10 w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-frost-400 hover:text-ice-400 transition-colors mb-8">
            <ChevronLeft className="w-5 h-5 mr-1" />
            На главную
          </Link>

          <div className="glass-card p-8 rounded-2xl text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Заявка недействительна
            </h1>
            <p className="text-frost-400 mb-6">
              Эта заявка не одобрена, уже использована или не существует.
            </p>
            <div className="flex flex-col space-y-3">
              <Link to="/apply">
                <Button className="w-full btn-neon">
                  Подать новую заявку
                </Button>
              </Link>
              <Link to="/status">
                <Button variant="outline" className="w-full border-ice-500/30 text-ice-400">
                  Проверить статус
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-ice-500/5 via-transparent to-transparent" />
      
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-frost-400 hover:text-ice-400 transition-colors mb-8">
          <ChevronLeft className="w-5 h-5 mr-1" />
          На главную
        </Link>

        <div className="glass-card p-8 rounded-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-ice-500 to-ice-600 flex items-center justify-center shadow-ice-glow">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Регистрация</h1>
            <p className="text-frost-400 mt-2">
              Создайте аккаунт ICE FAMILY
            </p>
          </div>

          {/* Success Message */}
          {applicationValid && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-medium">Заявка одобрена!</p>
                <p className="text-green-400/70 text-sm">
                  {applicationData?.gameNickname}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Имя пользователя
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-frost-500" />
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username"
                  className={`frost-input pl-10 ${errors.username ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-frost-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`frost-input pl-10 ${errors.email ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Пароль
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-frost-500" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`frost-input pl-10 pr-10 ${errors.password ? 'border-red-500/50' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-frost-500 hover:text-frost-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password}</p>
              )}
              <p className="text-xs text-frost-500">
                Минимум 6 символов, заглавная, строчная буква и цифра
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Подтвердите пароль
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-frost-500" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`frost-input pl-10 ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full btn-neon"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Регистрация...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-frost-400">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-ice-400 hover:text-ice-300 font-medium">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
