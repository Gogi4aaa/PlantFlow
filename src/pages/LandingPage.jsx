import { Link } from 'react-router-dom';
import { ArrowRight, Check, Shield, Smartphone, Zap, Sprout, Wifi, Activity, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import heroBg from '../assets/station_in_field.png';
import productShot from '../assets/product_sensor_closeup.png';

export default function LandingPage() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-sans">

            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                                <Sprout className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">PlantFlow</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-green-400 transition-colors text-sm font-medium">{t('landing.nav.features')}</a>
                            <a href="#pricing" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-green-400 transition-colors text-sm font-medium">{t('landing.nav.pricing')}</a>
                            <a href="#testimonials" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-green-400 transition-colors text-sm font-medium">{t('landing.nav.testimonials')}</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <LanguageSwitcher />
                            <Link to="/signin" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium text-sm transition-colors">
                                {t('landing.nav.login')}
                            </Link>
                            <Link
                                to="/register"
                                className="bg-emerald-600 dark:bg-green-500 hover:bg-emerald-700 dark:hover:bg-green-400 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 dark:shadow-green-500/20 flex items-center gap-1.5"
                            >
                                {t('landing.nav.getStarted')}
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/[0.04] dark:bg-green-500/[0.06] rounded-full blur-3xl" />
                </div>
                <div className="absolute inset-0 z-0">
                    <img src={heroBg} alt="" className="w-full h-full object-cover opacity-10 dark:opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 dark:from-[#0F172A]/60 via-white/80 dark:via-[#0F172A]/80 to-white dark:to-[#0F172A]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 dark:bg-green-500/10 border border-emerald-100 dark:border-green-500/20 text-emerald-700 dark:text-green-400 font-medium text-sm mb-8">
                        <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 dark:bg-green-400" />
                        </span>
                        {t('landing.hero.earlyAccess')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-slate-900 dark:text-white">
                        {t('landing.hero.title')}
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                        {t('landing.hero.subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-emerald-600 dark:bg-green-500 hover:bg-emerald-700 dark:hover:bg-green-400 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/20 dark:shadow-green-500/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            {t('landing.hero.cta')}
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <a
                            href="#product"
                            className="px-8 py-4 bg-white dark:bg-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-lg transition-all flex items-center justify-center"
                        >
                            {t('landing.hero.learnMore')}
                        </a>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap justify-center gap-8 mt-16">
                        {[
                            { icon: Wifi, value: '99.9%', label: 'Uptime' },
                            { icon: Activity, value: '<5s', label: 'Real-time latency' },
                            { icon: Sprout, value: '500+', label: 'Plants monitored' },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-green-500/10 border border-emerald-100 dark:border-green-500/20">
                                    <stat.icon className="w-4 h-4 text-emerald-600 dark:text-green-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-slate-900 dark:text-white font-bold text-lg leading-none">{stat.value}</p>
                                    <p className="text-slate-500 dark:text-slate-500 text-xs mt-0.5">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product Info */}
            <section id="product" className="py-24 bg-slate-50 dark:bg-[#0B1120]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl blur-2xl" />
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] shadow-2xl">
                                <img
                                    src={productShot}
                                    alt="PlantFlow Sensor"
                                    className="w-full hover:scale-[1.02] transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-50/40 dark:from-[#0B1120]/40 to-transparent" />
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-green-500/10 border border-emerald-100 dark:border-green-500/20 text-emerald-700 dark:text-green-400 text-sm font-medium mb-6">
                                <Leaf className="w-3.5 h-3.5" />
                                Smart Sensor Hardware
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
                                {t('landing.product.title')}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                {t('landing.product.description')}
                            </p>
                            <ul className="space-y-3">
                                {[0, 1, 2, 3].map((index) => (
                                    <li key={index} className="flex items-center text-slate-700 dark:text-slate-300 gap-3">
                                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-100 dark:bg-green-500/10 border border-emerald-200 dark:border-green-500/20 flex items-center justify-center">
                                            <Check className="h-3 w-3 text-emerald-600 dark:text-green-400" />
                                        </div>
                                        {t(`landing.product.list.${index}`)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-white dark:bg-[#0F172A]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('landing.features.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">{t('landing.features.subtitle')}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: <Smartphone className="h-6 w-6 text-emerald-600 dark:text-green-400" />, title: t('landing.features.remote.title'), desc: t('landing.features.remote.desc') },
                            { icon: <Zap className="h-6 w-6 text-blue-500 dark:text-blue-400" />, title: t('landing.features.automation.title'), desc: t('landing.features.automation.desc') },
                            { icon: <Shield className="h-6 w-6 text-purple-500 dark:text-purple-400" />, title: t('landing.features.protection.title'), desc: t('landing.features.protection.desc') },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-slate-50 dark:bg-[#1E293B]/60 p-8 rounded-2xl border border-slate-100 dark:border-white/[0.07] hover:border-slate-200 dark:hover:border-white/[0.12] hover:shadow-xl transition-all duration-300 cursor-default"
                            >
                                <div className="h-12 w-12 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 bg-emerald-900 dark:bg-[#0B1120] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/5 dark:bg-green-500/[0.03] rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.testimonials.title')}</h2>
                        <p className="text-emerald-200 dark:text-slate-400 text-lg">{t('landing.testimonials.subtitle')}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[0, 1, 2].map((index) => (
                            <div
                                key={index}
                                className="bg-emerald-800/50 dark:bg-[#1E293B]/50 backdrop-blur-sm p-8 rounded-2xl border border-emerald-700 dark:border-white/[0.07] hover:border-emerald-600 dark:hover:border-green-500/20 transition-all duration-300"
                            >
                                <div className="flex text-emerald-400 dark:text-green-400 mb-5 gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-emerald-100 dark:text-slate-300 leading-relaxed mb-6 text-sm">"{t(`landing.testimonials.${index}.quote`)}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {t(`landing.testimonials.${index}.author`).charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white text-sm">{t(`landing.testimonials.${index}.author`)}</p>
                                        <p className="text-emerald-300 dark:text-slate-500 text-xs">{t(`landing.testimonials.${index}.role`)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-white dark:bg-[#0F172A]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-green-500 dark:border dark:border-green-500/20 dark:bg-gradient-to-br dark:from-green-500/10 dark:to-emerald-600/5 p-12 md:p-16 text-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900 dark:bg-green-500 opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">{t('landing.cta.title')}</h2>
                            <p className="text-emerald-50 dark:text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                                {t('landing.cta.subtitle')}
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 px-10 py-4 bg-white dark:bg-green-500 text-emerald-600 dark:text-white hover:bg-emerald-50 dark:hover:bg-green-400 rounded-xl font-bold text-lg shadow-xl transition-all group"
                            >
                                {t('landing.cta.button')}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 dark:bg-[#0B1120] border-t border-slate-800 dark:border-white/[0.06] py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <Sprout className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-white text-base">PlantFlow</span>
                        </div>
                        <div className="text-sm text-slate-500">
                            {t('landing.footer.copyright', { year: new Date().getFullYear() })}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
