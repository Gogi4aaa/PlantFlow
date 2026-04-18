import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function usePageTitle(key) {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        document.title = `${t(key)} — PlantFlow`;
    }, [key, i18n.language]);
}
