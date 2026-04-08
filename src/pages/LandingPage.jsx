import { Link } from 'react-router-dom';
import { ArrowRight, Check, Leaf, Shield, Smartphone, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import heroBg from '../assets/station_in_field.png';
import productShot from '../assets/product_sensor_closeup.png';

export default function LandingPage() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Leaf className="h-8 w-8 text-emerald-600" />
                            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-500">
                                PlantFlow
                            </span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-slate-600 hover:text-emerald-600 transition-colors">{t('landing.nav.features')}</a>
                            <a href="#pricing" className="text-slate-600 hover:text-emerald-600 transition-colors">{t('landing.nav.pricing')}</a>
                            <a href="#testimonials" className="text-slate-600 hover:text-emerald-600 transition-colors">{t('landing.nav.testimonials')}</a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <LanguageSwitcher />
                            <Link to="/signin" className="text-slate-600 hover:text-emerald-600 font-medium">
                                {t('landing.nav.login')}
                            </Link>
                            <Link
                                to="/register"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center"
                            >
                                {t('landing.nav.getStarted')}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroBg}
                        alt="Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium text-sm mb-8 animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                        {t('landing.hero.earlyAccess')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-slate-900 leading-tight">
                        {t('landing.hero.title')}
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
                        {t('landing.hero.subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center transform hover:-translate-y-1"
                        >
                            {t('landing.hero.cta')} <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <a
                            href="#product"
                            className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                        >
                            {t('landing.hero.learnMore')}
                        </a>
                    </div>
                </div>
            </section>

            {/* Product Info Section */}
            <section id="product" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl opacity-20 blur-2xl"></div>
                            <img
                                src={productShot}
                                alt="PlantFlow Sensor"
                                className="relative rounded-2xl shadow-2xl border border-white/50 w-full transform hover:scale-[1.02] transition-transform duration-500"
                            />
                        </div>
                        <div className="order-1 lg:order-2">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
                                {t('landing.product.title')}
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                {t('landing.product.description')}
                            </p>

                            <ul className="space-y-4">
                                {[0, 1, 2, 3].map((index) => (
                                    <li key={index} className="flex items-center text-slate-700">
                                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                                            <Check className="h-4 w-4 text-emerald-600" />
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
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('landing.features.title')}</h2>
                        <p className="text-xl text-slate-600">{t('landing.features.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Smartphone className="h-8 w-8 text-white" />,
                                title: t('landing.features.remote.title'),
                                desc: t('landing.features.remote.desc')
                            },
                            {
                                icon: <Zap className="h-8 w-8 text-white" />,
                                title: t('landing.features.automation.title'),
                                desc: t('landing.features.automation.desc')
                            },
                            {
                                icon: <Shield className="h-8 w-8 text-white" />,
                                title: t('landing.features.protection.title'),
                                desc: t('landing.features.protection.desc')
                            }
                        ].map((feature, index) => (
                            <div key={index} className="bg-slate-50 p-8 rounded-2xl hover:shadow-xl transition-shadow border border-slate-100 group">
                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 bg-emerald-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 V 50 Q 25 25 50 50 T 100 50 V 100 Z" fill="white" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.testimonials.title')}</h2>
                        <p className="text-emerald-200 text-lg">{t('landing.testimonials.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[0, 1, 2].map((index) => (
                            <div key={index} className="bg-emerald-800/50 backdrop-blur-sm p-8 rounded-2xl border border-emerald-700">
                                <div className="flex text-emerald-400 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                                    ))}
                                </div>
                                <p className="text-lg mb-6 leading-relaxed">"{t(`landing.testimonials.${index}.quote`)}"</p>
                                <div>
                                    <p className="font-bold">{t(`landing.testimonials.${index}.author`)}</p>
                                    <p className="text-emerald-300 text-sm">{t(`landing.testimonials.${index}.role`)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing
            <section id="pricing" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('landing.pricing.title')}</h2>
                        <p className="text-xl text-slate-600">{t('landing.pricing.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        Starter
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('landing.pricing.starter.title')}</h3>
                            <div className="text-4xl font-bold text-slate-900 mb-6">25 €<span className="text-lg text-slate-500 font-normal">/мес</span></div>
                            <p className="text-slate-600 mb-8">{t('landing.pricing.starter.desc')}</p>

                            <ul className="space-y-4 mb-8 flex-1">
                                {[0, 1, 2, 3].map((index) => (
                                    <li key={index} className="flex items-center text-slate-700">
                                        <Check className="h-5 w-5 text-emerald-500 mr-3" />
                                        {t(`landing.pricing.starter.features.${index}`)}
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full py-3 px-6 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                                {t('landing.pricing.starter.cta')}
                            </button>
                        </div>

                        Pro
                        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-emerald-500 relative flex flex-col transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">{t('landing.pricing.pro.badge')}</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('landing.pricing.pro.title')}</h3>
                            <div className="text-4xl font-bold text-slate-900 mb-6">50 €<span className="text-lg text-slate-500 font-normal">/мес</span></div>
                            <p className="text-slate-600 mb-8">{t('landing.pricing.pro.desc')}</p>

                            <ul className="space-y-4 mb-8 flex-1">
                                {[0, 1, 2, 3, 4].map((index) => (
                                    <li key={index} className="flex items-center text-slate-700">
                                        <Check className="h-5 w-5 text-emerald-500 mr-3" />
                                        {t(`landing.pricing.pro.features.${index}`)}
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full py-3 px-6 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-500/30">
                                {t('landing.pricing.pro.cta')}
                            </button>
                        </div>

                        Enterprise
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('landing.pricing.enterprise.title')}</h3>
                            <div className="text-4xl font-bold text-slate-900 mb-6">200 €<span className="text-lg text-slate-500 font-normal">/мес</span></div>
                            <p className="text-slate-600 mb-8">{t('landing.pricing.enterprise.desc')}</p>

                            <ul className="space-y-4 mb-8 flex-1">
                                {[0, 1, 2, 3, 4].map((index) => (
                                    <li key={index} className="flex items-center text-slate-700">
                                        <Check className="h-5 w-5 text-emerald-500 mr-3" />
                                        {t(`landing.pricing.enterprise.features.${index}`)}
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full py-3 px-6 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                                {t('landing.pricing.enterprise.cta')}
                            </button>
                        </div>
                    </div>
                </div>
            </section> */}

            {/* CTA Section */}
            <section className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-emerald-600 to-green-500 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900 opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

                        <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">{t('landing.cta.title')}</h2>
                        <p className="text-emerald-50 text-xl mb-10 max-w-2xl mx-auto relative z-10">
                            {t('landing.cta.subtitle')}
                        </p>
                        <Link
                            to="/register"
                            className="inline-block px-10 py-5 bg-white text-emerald-600 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 relative z-10"
                        >
                            {t('landing.cta.button')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                            <Leaf className="h-6 w-6 text-emerald-500" />
                            <span className="ml-2 text-xl font-bold text-white">PlantFlow</span>
                        </div>
                        <div className="text-sm">
                            {t('landing.footer.copyright', { year: new Date().getFullYear() })}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
