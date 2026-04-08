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
                <Button variant="ghost" size="icon" className="text-slate-600 hover:text-emerald-600">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">{t('common.ui.switchLanguage')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')} className="cursor-pointer">
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('bg')} className="cursor-pointer">
                    Български
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
