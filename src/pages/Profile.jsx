import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, Loader2, Eye, EyeOff, Camera } from 'lucide-react';
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
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t('profile.header.title')}</h1>
                    <p className="text-slate-500">{t('profile.header.subtitle')}</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="max-w-2xl border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>{t('profile.personalInfo.title')}</CardTitle>
                        <CardDescription>{t('profile.personalInfo.subtitle')}</CardDescription>
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
                                            className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-100 shadow-md"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-emerald-100">
                                            {initials}
                                        </div>
                                    )}
                                    {/* Camera overlay */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
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
                                    <p className="text-sm font-medium text-slate-700">Profile Photo</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Click the photo to upload a new one</p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
                                    >
                                        Change photo
                                    </button>
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName">{t('profile.personalInfo.fullName')}</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="fullName"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="pl-9"
                                        placeholder={t('profile.personalInfo.fullNamePlaceholder')}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('profile.personalInfo.email')}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-9"
                                        placeholder={t('profile.personalInfo.emailPlaceholder')}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-medium text-slate-800 mb-4">{t('profile.personalInfo.changePassword')}</h3>
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">{t('profile.personalInfo.newPassword')}</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="newPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="pl-9 pr-9"
                                                placeholder={t('profile.personalInfo.passwordPlaceholder')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                                            <Label htmlFor="confirmPassword">{t('profile.personalInfo.confirmNewPassword')}</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    className="pl-9"
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
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
