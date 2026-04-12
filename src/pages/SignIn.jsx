import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { Sprout, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/api/api';
import { createPageUrl } from '@/utils';
import { toast, Toaster } from 'sonner';

export default function SignIn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await api.auth.login({ email: formData.email, password: formData.password });

      if (response && (response.success || response.token)) {
        const token = response.token || (response.data && response.data.token);
        const basicUser = response.user || (response.data && response.data.user);

        // Store token first so the /me request is authenticated
        localStorage.setItem('auth_token', token);

        // Fetch full profile (includes profile_picture) after login
        let fullUser = basicUser;
        try {
          const meResponse = await api.auth.me();
          if (meResponse?.success && meResponse?.data) {
            fullUser = { ...basicUser, ...meResponse.data };
          }
        } catch {
          // Fall back to basic user data if /me fails
        }

        localStorage.setItem('plantpulse_user', JSON.stringify(fullUser));

        toast.success(t('auth.login.success'));
        if (fullUser.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate(createPageUrl('Dashboard'));
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
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
            <Link to="/">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
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
                {t('auth.login.title')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-slate-500 dark:text-slate-400 mt-2 text-sm"
              >
                {t('auth.login.subtitle')}
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                  {t('auth.login.email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
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
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                  {t('auth.login.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 dark:bg-green-500 hover:bg-emerald-700 dark:hover:bg-green-400 text-white shadow-lg shadow-emerald-200 dark:shadow-green-500/20 h-11 text-base font-semibold transition-all mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('auth.login.submitting')}
                  </>
                ) : (
                  t('auth.login.submit')
                )}
              </Button>

              <div className="text-center pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('auth.login.noAccount')}{' '}
                  <Link
                    to={createPageUrl('Register')}
                    className="text-emerald-600 dark:text-green-400 hover:text-emerald-700 dark:hover:text-green-300 font-semibold transition-colors"
                  >
                    {t('auth.login.register')}
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
