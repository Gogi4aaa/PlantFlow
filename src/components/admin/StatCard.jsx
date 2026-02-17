import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, icon: Icon, trend, color = 'emerald', isLoading = false }) {
    const colorClasses = {
        emerald: {
            bg: 'from-emerald-100 to-green-100',
            icon: 'text-emerald-600',
            border: 'border-emerald-100'
        },
        blue: {
            bg: 'from-blue-100 to-sky-100',
            icon: 'text-blue-600',
            border: 'border-blue-100'
        },
        amber: {
            bg: 'from-amber-100 to-yellow-100',
            icon: 'text-amber-600',
            border: 'border-amber-100'
        },
        red: {
            bg: 'from-red-100 to-rose-100',
            icon: 'text-red-600',
            border: 'border-red-100'
        },
        purple: {
            bg: 'from-purple-100 to-violet-100',
            icon: 'text-purple-600',
            border: 'border-purple-100'
        }
    };

    const colors = colorClasses[color] || colorClasses.emerald;

    if (isLoading) {
        return (
            <Card className={cn('hover:shadow-md transition-shadow', colors.border)}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-24 mb-3 animate-pulse" />
                            <div className="h-8 bg-slate-200 rounded w-16 animate-pulse" />
                        </div>
                        <div className={cn('p-4 bg-gradient-to-br rounded-2xl', colors.bg)}>
                            <div className="w-8 h-8 bg-slate-200 rounded animate-pulse" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn('hover:shadow-md transition-shadow', colors.border)}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 mb-1">{title}</p>
                            <div className="flex items-baseline gap-2">
                                <motion.p
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-3xl font-bold text-slate-800"
                                >
                                    {value}
                                </motion.p>
                                {trend && (
                                    <span className={cn(
                                        'text-xs font-medium',
                                        trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-slate-400'
                                    )}>
                                        {trend > 0 ? '+' : ''}{trend}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className={cn('p-4 bg-gradient-to-br rounded-2xl', colors.bg)}>
                            <Icon className={cn('w-8 h-8', colors.icon)} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
