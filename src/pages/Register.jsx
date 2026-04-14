import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { Sprout, Mail, Lock, User, Loader2, Eye, EyeOff, CheckCircle, AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/api/api';
import { createPageUrl } from '@/utils';
import { toast, Toaster } from 'sonner';

const avatarColors = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'
];

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check if already logged in
  useEffect(() => {
    const user = localStorage.getItem('plantpulse_user');
    if (user) {
      navigate(createPageUrl('Dashboard'));
    }
  }, [navigate]);

  const passwordChecks = {
    minLength: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };
  const strengthScore = Object.values(passwordChecks).filter(Boolean).length;
  const strengthLabel = strengthScore <= 2
    ? t('auth.register.passwordWeak')
    : strengthScore <= 4
      ? t('auth.register.passwordFair')
      : t('auth.register.passwordStrong');
  const strengthColor = strengthScore <= 2
    ? 'bg-red-500'
    : strengthScore <= 4
      ? 'bg-amber-400'
      : 'bg-emerald-500';

  const mapAuthError = (message) => {
    if (!message) return t('common.error');
    const m = message.toLowerCase();
    if (m.includes('email already registered')) return t('auth.errors.emailAlreadyRegistered');
    if (m.includes('email and password are required')) return t('auth.errors.emailRequired');
    if (m.includes('at least 8')) return t('auth.errors.passwordMinLength');
    if (m.includes('uppercase')) return t('auth.errors.passwordUppercase');
    if (m.includes('lowercase')) return t('auth.errors.passwordLowercase');
    if (m.includes('one number')) return t('auth.errors.passwordNumber');
    if (m.includes('special character')) return t('auth.errors.passwordSpecial');
    return message;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.password !== formData.confirmPassword) {
      setFormError(t('auth.register.passwordsMismatch'));
      return;
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      setFormError(t('auth.register.passwordTooShort'));
      return;
    }

    setIsLoading(true);

    try {
      // Register via API
      const response = await api.auth.register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      });

      if (response && (response.success || response.data)) {
        const token = response.data?.token || response.token;
        const user = response.data?.user || response.user;

        // Store user in localStorage
        localStorage.setItem('plantpulse_user', JSON.stringify(user));
        localStorage.setItem('auth_token', token);

        toast.success(t('auth.register.success'));
        navigate(createPageUrl('Dashboard'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      setFormError(mapAuthError(error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:bg-none dark:bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-center" richColors closeButton />
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-200/20 dark:bg-green-500/[0.05] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-200/20 dark:bg-emerald-600/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to={"/"}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-emerald-200 dark:shadow-green-500/20"
              >
                <Sprout className="w-8 h-8 text-white" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight"
              >
                {t('auth.register.title')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-slate-500 dark:text-slate-400 mt-2 text-sm"
              >
                {t('auth.register.subtitle')}
              </motion.p>
            </Link>
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-sm border border-slate-100 dark:border-white/[0.08] rounded-2xl p-8 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-slate-700 dark:text-slate-300 text-sm font-medium">{t('auth.register.fullName')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="pl-9 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-300 dark:focus:border-green-500/40 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 text-sm font-medium">{t('auth.register.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-9 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-300 dark:focus:border-green-500/40 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 text-sm font-medium">{t('auth.register.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-9 pr-10 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-300 dark:focus:border-green-500/40 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {formData.password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{t('auth.register.passwordStrengthLabel')}</span>
                    <span className={strengthScore <= 2 ? 'text-red-500' : strengthScore <= 4 ? 'text-amber-500' : 'text-emerald-500'}>
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strengthScore ? strengthColor : 'bg-slate-200 dark:bg-white/10'}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-1 pt-1">
                    {[
                      { key: 'minLength', label: t('auth.register.requirements.minLength') },
                      { key: 'uppercase', label: t('auth.register.requirements.uppercase') },
                      { key: 'lowercase', label: t('auth.register.requirements.lowercase') },
                      { key: 'number', label: t('auth.register.requirements.number') },
                      { key: 'special', label: t('auth.register.requirements.special') },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-1.5">
                        {passwordChecks[key]
                          ? <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          : <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                        }
                        <span className={`text-xs ${passwordChecks[key] ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 text-sm font-medium">{t('auth.register.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-9 pr-10 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-300 dark:focus:border-green-500/40 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {formError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 dark:bg-green-500 hover:bg-emerald-700 dark:hover:bg-green-400 text-white shadow-lg shadow-emerald-200 dark:shadow-green-500/20 h-11 text-base font-semibold mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('auth.register.submitting')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('auth.register.submit')}
                  </>
                )}
              </Button>

              <div className="text-center pt-4 border-t border-white/[0.06]">
                <p className="text-sm text-slate-500">
                  {t('auth.register.hasAccount')}{' '}
                  <Link
                    to={createPageUrl('SignIn')}
                    className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                  >
                    {t('auth.register.login')}
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}