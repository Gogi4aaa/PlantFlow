import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Thermometer, 
  Wind, 
  Droplets, 
  Sun, 
  Power,
  Wifi,
  WifiOff,
  Battery,
  MoreVertical,
  Trash2,
  Edit,
  Leaf
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function DeviceCard({ device, onEdit, onDelete, index }) {
  const isOnline = device.status === 'online';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={cn(
        'border transition-all duration-300 hover:shadow-lg',
        isOnline ? 'border-slate-100' : 'border-slate-200 bg-slate-50/50'
      )}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-14 h-14 rounded-xl bg-cover bg-center',
                !device.plant_image && 'bg-emerald-100 flex items-center justify-center'
              )}
              style={device.plant_image ? { backgroundImage: `url(${device.plant_image})` } : {}}
              >
                {!device.plant_image && <Leaf className="w-6 h-6 text-emerald-600" />}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{device.plant_name || 'Unnamed Plant'}</h3>
                <p className="text-xs text-slate-500">{device.plant_species || 'Unknown Species'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{device.serial_number}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(device)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(device)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={cn(
                  'border',
                  isOnline 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : device.status === 'standby'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                )}
              >
                {isOnline ? (
                  <Wifi className="w-3 h-3 mr-1" />
                ) : (
                  <WifiOff className="w-3 h-3 mr-1" />
                )}
                {device.status}
              </Badge>
              {device.battery_level !== null && device.battery_level !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Battery className={cn(
                    'w-4 h-4',
                    device.battery_level > 50 ? 'text-emerald-500' : 
                    device.battery_level > 20 ? 'text-amber-500' : 'text-red-500'
                  )} />
                  <span className="text-sm font-medium text-slate-600">
                    {device.battery_level}%
                  </span>
                </div>
              )}
            </div>

            {device.location && (
              <p className="text-sm text-slate-500 mb-3">📍 {device.location}</p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <Droplets className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                <p className="text-xs font-medium text-slate-700">{device.soil_moisture || 0}%</p>
                <p className="text-xs text-slate-500">Moisture</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <Thermometer className="w-4 h-4 mx-auto text-red-500 mb-1" />
                <p className="text-xs font-medium text-slate-700">{device.air_temperature || 0}°C</p>
                <p className="text-xs text-slate-500">Temp</p>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <Wind className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                <p className="text-xs font-medium text-slate-700">{device.air_humidity || 0}%</p>
                <p className="text-xs text-slate-500">Humidity</p>
              </div>
              <div className="text-center p-2 bg-amber-50 rounded-lg">
                <Sun className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                <p className="text-xs font-medium text-slate-700">{Math.round((device.light_intensity || 0) / 1000)}k</p>
                <p className="text-xs text-slate-500">Light</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}