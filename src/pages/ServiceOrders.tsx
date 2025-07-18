import { useState } from 'react';
import { Plus, Search, Edit, Trash2, FileText, User, Car as CarIcon, Eye, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ServiceOrder, ServiceOrderItem, Client, Car, Service } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const OrderForm = ({ order, onSave, onCancel }: {
  order?: ServiceOrder;
  onSave: (order: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) => {
  const [clients] = useLocalStorage<Client[]>('clients', []);
  const [cars] = useLocalStorage<Car[]>('cars', []);
  const [services] = useLocalStorage<Service[]>('services', []);
  
  const [formData, setFormData] = useState({
    clientId: order?.clientId || '',
    carId: order?.carId || '',
    date: order?.date ? order.date.split('T')[0] : new Date().toISOString().split('T')[0],
    status: order?.status || 'pending' as const,
    services: order?.services || [] as ServiceOrderItem[],
    observations: order?.observations || ''
  });

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState(1);

  const clientCars = cars.filter(car => car.clientId === formData.clientId);
  const activeServices = services.filter(service => service.isActive);

  const totalValue = formData.services.reduce((sum, item) => sum + item.totalValue, 0);
  const estimatedTime = formData.services.reduce((sum, item) => {
    const service = services.find(s => s.id === item.serviceId);
    return sum + (service?.estimatedTime || 0) * item.quantity;
  }, 0);

  const addService = () => {
    if (!selectedServiceId) return;
    
    const service = services.find(s => s.id === selectedServiceId);
    if (!service) return;

    const existingIndex = formData.services.findIndex(item => item.serviceId === selectedServiceId);
    
    if (existingIndex >= 0) {
      // Update existing service
      const updatedServices = [...formData.services];
      updatedServices[existingIndex] = {
        ...updatedServices[existingIndex],
        quantity: updatedServices[existingIndex].quantity + serviceQuantity,
        totalValue: (updatedServices[existingIndex].quantity + serviceQuantity) * service.value
      };
      setFormData({ ...formData, services: updatedServices });
    } else {
      // Add new service
      const newItem: ServiceOrderItem = {
        serviceId: selectedServiceId,
        quantity: serviceQuantity,
        unitValue: service.value,
        totalValue: service.value * serviceQuantity,
        description: service.description
      };
      setFormData({ ...formData, services: [...formData.services, newItem] });
    }

    setSelectedServiceId('');
    setServiceQuantity(1);
  };

  const removeService = (serviceId: string) => {
    setFormData({
      ...formData,
      services: formData.services.filter(item => item.serviceId !== serviceId)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      totalValue,
      estimatedTime
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">Cliente *</Label>
          <Select 
            value={formData.clientId} 
            onValueChange={(value) => setFormData({ ...formData, clientId: value, carId: '' })}
          >
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

        <div className="space-y-2">
          <Label htmlFor="carId">Veículo *</Label>
          <Select 
            value={formData.carId} 
            onValueChange={(value) => setFormData({ ...formData, carId: value })}
            disabled={!formData.clientId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o veículo" />
            </SelectTrigger>
            <SelectContent>
              {clientCars.map((car) => (
                <SelectItem key={car.id} value={car.id}>
                  {car.plate} - {car.brand} {car.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Services Section */}
      <div className="space-y-4">
        <Label>Serviços</Label>
        
        {/* Add Service */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione um serviço" />
            </SelectTrigger>
            <SelectContent>
              {activeServices.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.description} - R$ {service.value.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min="1"
            value={serviceQuantity}
            onChange={(e) => setServiceQuantity(parseInt(e.target.value) || 1)}
            className="w-20"
            placeholder="Qtd"
          />
          <Button type="button" onClick={addService} disabled={!selectedServiceId}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Services List */}
        {formData.services.length > 0 && (
          <div className="border rounded-lg p-4 space-y-2">
            {formData.services.map((item) => {
              const service = services.find(s => s.id === item.serviceId);
              return (
                <div key={item.serviceId} className="flex justify-between items-center p-2 bg-muted rounded">
                  <div className="flex-1">
                    <p className="font-medium">{service?.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity}x R$ {item.unitValue.toFixed(2)} = R$ {item.totalValue.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeService(item.serviceId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total: R$ {totalValue.toFixed(2)}</span>
              <span>Tempo: {estimatedTime.toFixed(1)}h</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          placeholder="Observações sobre a ordem de serviço..."
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={formData.services.length === 0}>
          {order ? 'Atualizar' : 'Criar OS'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, any> = {
    pending: { variant: "secondary", label: "Pendente" },
    in_progress: { variant: "default", label: "Em Andamento" },
    completed: { variant: "secondary", label: "Concluído" },
    cancelled: { variant: "destructive", label: "Cancelado" }
  };
  
  const config = variants[status] || variants.pending;
  return <Badge variant={config.variant} className={
    status === 'completed' ? 'bg-success text-success-foreground' :
    status === 'in_progress' ? 'bg-warning text-warning-foreground' : ''
  }>{config.label}</Badge>;
};

export const ServiceOrders = () => {
  const [orders, setOrders] = useLocalStorage<ServiceOrder[]>('service_orders', []);
  const [clients] = useLocalStorage<Client[]>('clients', []);
  const [cars] = useLocalStorage<Car[]>('cars', []);
  const [services] = useLocalStorage<Service[]>('services', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | undefined>();
  const [viewingOrder, setViewingOrder] = useState<ServiceOrder | undefined>();
  const { toast } = useToast();

  const filteredOrders = orders.filter(order => {
    const client = clients.find(c => c.id === order.clientId);
    const car = cars.find(c => c.id === order.carId);
    
    const matchesSearch = 
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car?.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const canCreateOrder = clients.length > 0 && cars.length > 0 && services.filter(s => s.isActive).length > 0;

  const handleSave = (orderData: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingOrder) {
      // Update existing order
      const updatedOrders = orders.map(order =>
        order.id === editingOrder.id
          ? { 
              ...order, 
              ...orderData, 
              updatedAt: now,
              completedAt: orderData.status === 'completed' && order.status !== 'completed' ? now : order.completedAt
            }
          : order
      );
      setOrders(updatedOrders);
      toast({
        title: "OS atualizada",
        description: "A ordem de serviço foi atualizada com sucesso."
      });
    } else {
      // Create new order
      const newOrder: ServiceOrder = {
        id: `OS-${Date.now()}`,
        ...orderData,
        createdAt: now,
        updatedAt: now,
        completedAt: orderData.status === 'completed' ? now : undefined
      };
      setOrders([...orders, newOrder]);
      toast({
        title: "OS criada",
        description: "Nova ordem de serviço foi criada com sucesso."
      });
    }
    
    setIsDialogOpen(false);
    setEditingOrder(undefined);
  };

  const handleEdit = (order: ServiceOrder) => {
    setEditingOrder(order);
    setIsDialogOpen(true);
  };

  const handleDelete = (order: ServiceOrder) => {
    if (confirm(`Tem certeza que deseja excluir a OS ${order.id}?`)) {
      setOrders(orders.filter(o => o.id !== order.id));
      toast({
        title: "OS excluída",
        description: "Ordem de serviço foi removida com sucesso."
      });
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingOrder(undefined);
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Cliente não encontrado';
  };

  const getCarInfo = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    return car ? `${car.plate} - ${car.brand} ${car.model}` : 'Veículo não encontrado';
  };

  const printOrder = (order: ServiceOrder) => {
    // Simple print functionality
    const client = clients.find(c => c.id === order.clientId);
    const car = cars.find(c => c.id === order.carId);
    
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Ordem de Serviço ${order.id}</h1>
        <p><strong>Data:</strong> ${new Date(order.date).toLocaleDateString('pt-BR')}</p>
        <p><strong>Cliente:</strong> ${client?.name}</p>
        <p><strong>Veículo:</strong> ${getCarInfo(order.carId)}</p>
        <p><strong>Status:</strong> ${getStatusBadge(order.status)}</p>
        <h3>Serviços:</h3>
        <ul>
          ${order.services.map(item => `
            <li>${item.description} - Qtd: ${item.quantity} - Valor: R$ ${item.totalValue.toFixed(2)}</li>
          `).join('')}
        </ul>
        <p><strong>Valor Total:</strong> R$ ${order.totalValue.toFixed(2)}</p>
        ${order.observations ? `<p><strong>Observações:</strong> ${order.observations}</p>` : ''}
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const monthlyRevenue = orders
    .filter(o => {
      const orderDate = new Date(o.date);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && 
             orderDate.getFullYear() === now.getFullYear() &&
             o.status === 'completed';
    })
    .reduce((sum, o) => sum + o.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ordens de Serviço</h1>
          <p className="text-muted-foreground">
            Gerencie as ordens de serviço da oficina
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingOrder(undefined)}
              disabled={!canCreateOrder}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova OS
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
              </DialogTitle>
              <DialogDescription>
                {editingOrder 
                  ? 'Atualize as informações da ordem de serviço.'
                  : 'Crie uma nova ordem de serviço.'
                }
              </DialogDescription>
            </DialogHeader>
            <OrderForm
              order={editingOrder}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!canCreateOrder && (
        <Card className="border-warning">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-warning" />
              <div>
                <h3 className="font-semibold">Requisitos não atendidos</h3>
                <p className="text-sm text-muted-foreground">
                  Para criar ordens de serviço é necessário ter pelo menos: 1 cliente, 1 veículo e 1 serviço ativo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por cliente, veículo ou número da OS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-sm text-muted-foreground">Total de OS</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{pendingOrders}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{completedOrders}</p>
                <p className="text-sm text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">
                  R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Receita Mensal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma OS encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter
                  ? 'Nenhuma ordem de serviço corresponde aos filtros aplicados.'
                  : 'Comece criando a primeira ordem de serviço.'
                }
              </p>
              {!searchTerm && !statusFilter && canCreateOrder && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira OS
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredOrders
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((order) => (
              <Card key={order.id} className="transition-all duration-200 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{order.id}</h3>
                        {getStatusBadge(order.status)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="w-4 h-4 mr-2" />
                          {getClientName(order.clientId)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CarIcon className="w-4 h-4 mr-2" />
                          {getCarInfo(order.carId)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <FileText className="w-4 h-4 mr-2" />
                          {order.services.length} serviço(s) • R$ {order.totalValue.toFixed(2)} • {order.estimatedTime.toFixed(1)}h
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printOrder(order)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(order)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(order)}
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

      {/* View Order Dialog */}
      <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(undefined)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ordem de Serviço {viewingOrder?.id}</DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cliente</Label>
                  <p className="font-medium">{getClientName(viewingOrder.clientId)}</p>
                </div>
                <div>
                  <Label>Veículo</Label>
                  <p className="font-medium">{getCarInfo(viewingOrder.carId)}</p>
                </div>
                <div>
                  <Label>Data</Label>
                  <p className="font-medium">{new Date(viewingOrder.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(viewingOrder.status)}</div>
                </div>
              </div>
              
              <div>
                <Label>Serviços</Label>
                <div className="mt-2 space-y-2">
                  {viewingOrder.services.map((item) => (
                    <div key={item.serviceId} className="flex justify-between p-2 bg-muted rounded">
                      <span>{item.description}</span>
                      <span>{item.quantity}x R$ {item.unitValue.toFixed(2)} = R$ {item.totalValue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>R$ {viewingOrder.totalValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {viewingOrder.observations && (
                <div>
                  <Label>Observações</Label>
                  <p className="mt-1 text-sm">{viewingOrder.observations}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewingOrder(undefined)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};