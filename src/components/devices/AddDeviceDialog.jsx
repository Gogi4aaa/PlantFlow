import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

export default function AddDeviceDialog({ open, onOpenChange, onSubmit, isLoading, editDevice }) {
  const [formData, setFormData] = useState(editDevice || {
    plant_name: '',
    plant_species: '',
    plant_image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=400&fit=crop',
    serial_number: '',
    location: '',
    firmware_version: '2.4.1',
    status: 'online',
    battery_level: 95,
    soil_moisture: 65,
    air_temperature: 24,
    air_humidity: 60,
    light_intensity: 8500,
    pump_status: 'off',
    health_status: 'good'
  });

  React.useEffect(() => {
    if (editDevice) {
      setFormData(editDevice);
    } else {
      setFormData({
        plant_name: '',
        plant_species: '',
        plant_image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=400&fit=crop',
        serial_number: '',
        location: '',
        firmware_version: '2.4.1',
        status: 'online',
        battery_level: 95,
        soil_moisture: 65,
        air_temperature: 24,
        air_humidity: 60,
        light_intensity: 8500,
        pump_status: 'off',
        health_status: 'good'
      });
    }
  }, [editDevice, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editDevice ? 'Редактиране на растение' : 'Добавяне на ново растение'}</DialogTitle>
          <DialogDescription>
            {editDevice
              ? 'Актуализирайте информацията за растението и устройството по-долу.'
              : 'Добавете ново IoT устройство за наблюдение на вашето растение.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="plant_name">Име на растението</Label>
              <Input
                id="plant_name"
                placeholder="напр. Монстера"
                value={formData.plant_name}
                onChange={(e) => setFormData({ ...formData, plant_name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plant_species">Вид на растението</Label>
              <Input
                id="plant_species"
                placeholder="напр. Swiss Cheese Plant"
                value={formData.plant_species}
                onChange={(e) => setFormData({ ...formData, plant_species: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serial_number">Сериен номер на устройството</Label>
              <Input
                id="serial_number"
                placeholder="напр. PP-2024-A7B3C9D2"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Местоположение</Label>
              <Input
                id="location"
                placeholder="напр. Хол, Градина"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Отказ
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editDevice ? 'Актуализиране' : 'Добави устройство'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}