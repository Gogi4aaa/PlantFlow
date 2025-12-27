import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Droplets, Sun, Thermometer, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

export default function PlantCard({ plant, index }) {
  const healthColors = {
    excellent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    good: 'bg-green-100 text-green-700 border-green-200',
    moderate: 'bg-amber-100 text-amber-700 border-amber-200',
    poor: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={createPageUrl('PlantDetails') + `?id=${plant.id}`}>
        <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-100/50 hover:border-emerald-200 hover:-translate-y-1">
          {/* Plant Image */}
          <div className="relative h-40 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50">
            <img 
              src={plant.image} 
              alt={plant.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Badge 
              className={cn(
                'absolute top-3 right-3 border',
                healthColors[plant.health]
              )}
            >
              <Heart className="w-3 h-3 mr-1" />
              {plant.health}
            </Badge>
          </div>
          
          {/* Plant Info */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">
                {plant.name}
              </h3>
              <p className="text-sm text-slate-400">{plant.species}</p>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
              <div className="text-center">
                <Droplets className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                <p className="text-xs text-slate-500">{plant.moisture}%</p>
              </div>
              <div className="text-center">
                <Sun className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                <p className="text-xs text-slate-500">{plant.light} lux</p>
              </div>
              <div className="text-center">
                <Thermometer className="w-4 h-4 mx-auto text-red-400 mb-1" />
                <p className="text-xs text-slate-500">{plant.temp}°C</p>
              </div>
            </div>
            
            {/* Water Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Soil Moisture</span>
                <span className={cn(
                  'font-medium',
                  plant.moisture >= 60 ? 'text-emerald-600' : 
                  plant.moisture >= 30 ? 'text-amber-600' : 'text-red-600'
                )}>
                  {plant.moisture}%
                </span>
              </div>
              <Progress 
                value={plant.moisture} 
                className="h-1.5 bg-slate-100"
              />
            </div>
          </div>
          
          {/* Hover indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>
      </Link>
    </motion.div>
  );
}