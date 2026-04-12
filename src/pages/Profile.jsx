import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Save, Loader2, Eye, EyeOff, Camera, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/api/api';
import { toast } from 'sonner';

// Resize an image file to max 200x200 and return base64 data URL
function resizeImage(file, maxSize = 200) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

export default function Profile() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        profile_picture: undefined,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await api.auth.me();
            if (response && response.success) {
                const { full_name, email, profile_picture } = response.data;
                setFormData(prev => ({
                    ...prev,
                    full_name: full_name || '',
                    email: email || '',
                }));
                if (profile_picture) setAvatarPreview(profile_picture);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error(t('profile.messages.loadError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        const base64 = await resizeImage(file, 200);
        setAvatarPreview(base64);
        setFormData(prev => ({ ...prev, profile_picture: base64 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error(t('auth.register.passwordsMismatch'));
            return;
        }

        try {
            setIsSaving(true);
            const updateData = {
                full_name: formData.full_name,
                email: formData.email,
            };

            if (formData.password) updateData.password = formData.password;
            if (formData.profile_picture !== undefined) {
                updateData.profile_picture = formData.profile_picture;
            }

            const response = await api.auth.updateProfile(updateData);

            if (response && response.success) {
                toast.success(t('profile.messages.success'));
                // Update local storage so TopBar/Sidebar reflect new avatar immediately
                const currentUser = JSON.parse(localStorage.getItem('plantpulse_user') || '{}');
                const updatedUser = {
                    ...currentUser,
                    ...response.data,
                    full_name: response.data.full_name || formData.full_name,
                    profile_picture: response.data.profile_picture ?? avatarPreview,
                };
                localStorage.setItem('plantpulse_user', JSON.stringify(updatedUser));
                window.dispatchEvent(new CustomEvent('plantflow:profileUpdate'));

                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.message || t('profile.messages.error'));
        } finally {
            setIsSaving(false);
        }
    };

    // Initials fallback
    const initials = formData.full_name
        ? formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 dark:text-green-400" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-green-400 transition-colors group cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Dashboard
            </button>

            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('profile.header.title')}</h1>
                <p className="text-slate-500 dark:text-slate-400">{t('profile.header.subtitle')}</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07] shadow-sm dark:shadow-none">
                    <CardHeader>
                        <CardTitle className="text-slate-800 dark:text-white">{t('profile.personalInfo.title')}</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">{t('profile.personalInfo.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Avatar Upload */}
                            <div className="flex items-center gap-5">
                                <div className="relative group">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Profile"
                                            className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-100 dark:ring-green-500/20 shadow-md"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-emerald-100 dark:ring-green-500/20">
                                            {initials}
                                        </div>
                                    )}
                                    {/* Camera overlay */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    >
                                        <Camera className="w-6 h-6 text-white" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Photo</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Click the photo to upload a new one</p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-2 text-xs text-emerald-600 dark:text-green-400 hover:text-emerald-700 dark:hover:text-green-300 font-medium underline underline-offset-2 cursor-pointer"
                                    >
                                        Change photo
                                    </button>
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">{t('profile.personalInfo.fullName')}</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
                                    <Input
                                        id="fullName"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="pl-9 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-300 dark:focus:border-green-500/40"
                                        placeholder={t('profile.personalInfo.fullNamePlaceholder')}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">{t('profile.personalInfo.email')}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-9 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-300 dark:focus:border-green-500/40"
                                        placeholder={t('profile.personalInfo.emailPlaceholder')}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                                <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-4">{t('profile.personalInfo.changePassword')}</h3>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword" className="text-slate-700 dark:text-slate-300">{t('profile.personalInfo.newPassword')}</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
                                            <Input
                                                id="newPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="pl-9 pr-9 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-300 dark:focus:border-green-500/40"
                                                placeholder={t('profile.personalInfo.passwordPlaceholder')}
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

                                    {formData.password && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2"
                                        >
                                            <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">{t('profile.personalInfo.confirmNewPassword')}</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    className="pl-9 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-300 dark:focus:border-green-500/40"
                                                    placeholder={t('profile.personalInfo.confirmNewPasswordPlaceholder')}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-emerald-600 dark:bg-green-500 hover:bg-emerald-700 dark:hover:bg-green-400 text-white shadow-lg shadow-emerald-200 dark:shadow-green-500/20 cursor-pointer"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t('profile.buttons.saving')}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            {t('profile.buttons.save')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
