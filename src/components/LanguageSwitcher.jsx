import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LanguageSwitcher() {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">{t('common.ui.switchLanguage')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#1E293B] border-slate-100 dark:border-white/[0.08]">
                <DropdownMenuItem onClick={() => changeLanguage('en')} className="cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] focus:bg-slate-50 dark:focus:bg-white/[0.06]">
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('bg')} className="cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] focus:bg-slate-50 dark:focus:bg-white/[0.06]">
                    Български
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
