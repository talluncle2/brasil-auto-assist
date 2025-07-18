import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Car as CarIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Car, Client } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CarForm = ({ car, onSave, onCancel }: {
  car?: Car;
  onSave: (car: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) => {
  const [clients] = useLocalStorage<Client[]>('clients', []);
  const [formData, setFormData] = useState({
    clientId: car?.clientId || '',
    plate: car?.plate || '',
    model: car?.model || '',
    brand: car?.brand || '',
    year: car?.year || new Date().getFullYear(),
    color: car?.color || '',
    observations: car?.observations || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clientId">Cliente *</Label>
        <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plate">Placa *</Label>
          <Input
            id="plate"
            value={formData.plate}
            onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
            required
            placeholder="ABC-1234"
            maxLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Marca *</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            required
            placeholder="Toyota, Honda, Ford..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Modelo *</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            required
            placeholder="Corolla, Civic, Focus..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Ano *</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            required
            min={1900}
            max={new Date().getFullYear() + 1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Cor</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="Branco, Preto, Prata..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          placeholder="Observações sobre o veículo..."
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {car ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const Cars = () => {
  const [cars, setCars] = useLocalStorage<Car[]>('cars', []);
  const [clients] = useLocalStorage<Client[]>('clients', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | undefined>();
  const { toast } = useToast();

  const filteredCars = cars.filter(car => {
    const client = clients.find(c => c.id === car.clientId);
    return (
      car.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.year.toString().includes(searchTerm) ||
      (client?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleSave = (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingCar) {
      // Update existing car
      const updatedCars = cars.map(car =>
        car.id === editingCar.id
          ? { ...car, ...carData, updatedAt: now }
          : car
      );
      setCars(updatedCars);
      toast({
        title: "Veículo atualizado",
        description: "Os dados do veículo foram atualizados com sucesso."
      });
    } else {
      // Create new car
      const newCar: Car = {
        id: crypto.randomUUID(),
        ...carData,
        createdAt: now,
        updatedAt: now
      };
      setCars([...cars, newCar]);
      toast({
        title: "Veículo cadastrado",
        description: "Novo veículo foi cadastrado com sucesso."
      });
    }
    
    setIsDialogOpen(false);
    setEditingCar(undefined);
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setIsDialogOpen(true);
  };

  const handleDelete = (car: Car) => {
    if (confirm(`Tem certeza que deseja excluir o veículo ${car.plate}?`)) {
      setCars(cars.filter(c => c.id !== car.id));
      toast({
        title: "Veículo excluído",
        description: "Veículo foi removido com sucesso."
      });
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingCar(undefined);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Veículos</h1>
          <p className="text-muted-foreground">
            Gerencie os veículos dos clientes
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingCar(undefined)}
              disabled={clients.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingCar ? 'Editar Veículo' : 'Novo Veículo'}
              </DialogTitle>
              <DialogDescription>
                {editingCar 
                  ? 'Atualize as informações do veículo.'
                  : 'Cadastre um novo veículo para um cliente.'
                }
              </DialogDescription>
            </DialogHeader>
            <CarForm
              car={editingCar}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      {clients.length === 0 && (
        <Card className="border-warning">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-warning" />
              <div>
                <h3 className="font-semibold">Nenhum cliente cadastrado</h3>
                <p className="text-sm text-muted-foreground">
                  É necessário ter pelo menos um cliente cadastrado para adicionar veículos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar por placa, modelo, marca, ano ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <CarIcon className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{cars.length}</p>
                <p className="text-sm text-muted-foreground">Total de Veículos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{new Set(cars.map(c => c.clientId)).size}</p>
                <p className="text-sm text-muted-foreground">Clientes com Veículos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <CarIcon className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {cars.length > 0 ? Math.round(cars.reduce((sum, car) => sum + car.year, 0) / cars.length) : 0}
                </p>
                <p className="text-sm text-muted-foreground">Ano Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cars List */}
      <div className="grid gap-4">
        {filteredCars.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum veículo encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Nenhum veículo corresponde aos critérios de busca.'
                  : 'Comece cadastrando o primeiro veículo.'
                }
              </p>
              {!searchTerm && clients.length > 0 && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Veículo
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCars.map((car) => (
            <Card key={car.id} className="transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{car.plate}</h3>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                        {car.year}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        <strong>{car.brand} {car.model}</strong>
                        {car.color && ` • ${car.color}`}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2" />
                        {getClientName(car.clientId)}
                      </div>
                      {car.observations && (
                        <p className="text-sm text-muted-foreground italic">
                          {car.observations}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(car)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(car)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};