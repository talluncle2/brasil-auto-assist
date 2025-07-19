import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Wrench, DollarSign, Clock, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Service, Employee } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const ServiceForm = ({ service, onSave, onCancel, employees }: {
  service?: Service;
  onSave: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  employees: Employee[];
}) => {
  const [formData, setFormData] = useState({
    description: service?.description || '',
    value: service?.value || 0,
    estimatedTime: service?.estimatedTime || 1,
    category: service?.category || 'Chapeação',
    responsibleEmployeeId: service?.responsibleEmployeeId || '',
    isActive: service?.isActive ?? true
  });

  const categories = [
    'Chapeação',
    'Pintura',
    'Funilaria',
    'Soldas',
    'Polimento',
    'Mecânica Geral',
    'Elétrica',
    'Outros'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição do Serviço *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          placeholder="Descreva o serviço..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Valor (R$) *</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            min="0"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
            required
            placeholder="0,00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimatedTime">Tempo Estimado (horas) *</Label>
          <Input
            id="estimatedTime"
            type="number"
            step="0.5"
            min="0.5"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: parseFloat(e.target.value) || 1 })}
            required
            placeholder="1.0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="responsibleEmployee">Funcionário Responsável</Label>
          <Select value={formData.responsibleEmployeeId} onValueChange={(value) => setFormData({ ...formData, responsibleEmployeeId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o funcionário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum funcionário</SelectItem>
              {employees.filter(emp => emp.isActive).map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name} - {employee.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>


      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Serviço ativo</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {service ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const EmployeeForm = ({ employee, onSave, onCancel }: {
  employee?: Employee;
  onSave: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    role: employee?.role || '',
    phone: employee?.phone || '',
    isActive: employee?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="employeeName">Nome do Funcionário *</Label>
        <Input
          id="employeeName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Digite o nome do funcionário"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="employeeRole">Função/Especialidade *</Label>
        <Input
          id="employeeRole"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
          placeholder="Ex: Chapeiro, Pintor, Funileiro..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="employeePhone">Telefone</Label>
        <Input
          id="employeePhone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="(00) 00000-0000"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="employeeActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="employeeActive">Funcionário ativo</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {employee ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const Services = () => {
  const [services, setServices] = useLocalStorage<Service[]>('services', []);
  const [employees, setEmployees] = useLocalStorage<Employee[]>('employees', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const { toast } = useToast();

  const categories = [
    'Chapeação',
    'Pintura',
    'Funilaria',
    'Soldas',
    'Polimento',
    'Mecânica Geral',
    'Elétrica',
    'Outros'
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeServices = services.filter(s => s.isActive);
  const avgValue = services.length > 0 ? services.reduce((sum, s) => sum + s.value, 0) / services.length : 0;
  const avgTime = services.length > 0 ? services.reduce((sum, s) => sum + s.estimatedTime, 0) / services.length : 0;

  const handleSave = (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingService) {
      // Update existing service
      const updatedServices = services.map(service =>
        service.id === editingService.id
          ? { ...service, ...serviceData, updatedAt: now }
          : service
      );
      setServices(updatedServices);
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso."
      });
    } else {
      // Create new service
      const newService: Service = {
        id: crypto.randomUUID(),
        ...serviceData,
        createdAt: now,
        updatedAt: now
      };
      setServices([...services, newService]);
      toast({
        title: "Serviço cadastrado",
        description: "Novo serviço foi cadastrado com sucesso."
      });
    }
    
    setIsDialogOpen(false);
    setEditingService(undefined);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleDelete = (service: Service) => {
    if (confirm(`Tem certeza que deseja excluir o serviço "${service.description}"?`)) {
      setServices(services.filter(s => s.id !== service.id));
      toast({
        title: "Serviço excluído",
        description: "Serviço foi removido com sucesso."
      });
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingService(undefined);
  };

  const handleEmployeeSave = (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingEmployee) {
      const updatedEmployees = employees.map(emp =>
        emp.id === editingEmployee.id
          ? { ...emp, ...employeeData, updatedAt: now }
          : emp
      );
      setEmployees(updatedEmployees);
      toast({
        title: "Funcionário atualizado",
        description: "Os dados do funcionário foram atualizados com sucesso."
      });
    } else {
      const newEmployee: Employee = {
        id: crypto.randomUUID(),
        ...employeeData,
        createdAt: now,
        updatedAt: now
      };
      setEmployees([...employees, newEmployee]);
      toast({
        title: "Funcionário cadastrado",
        description: "Novo funcionário foi cadastrado com sucesso."
      });
    }
    
    setIsEmployeeDialogOpen(false);
    setEditingEmployee(undefined);
  };

  const handleEmployeeEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEmployeeDialogOpen(true);
  };

  const handleEmployeeDelete = (employee: Employee) => {
    if (confirm(`Tem certeza que deseja excluir o funcionário "${employee.name}"?`)) {
      setEmployees(employees.filter(e => e.id !== employee.id));
      toast({
        title: "Funcionário excluído",
        description: "Funcionário foi removido com sucesso."
      });
    }
  };

  const handleEmployeeCancel = () => {
    setIsEmployeeDialogOpen(false);
    setEditingEmployee(undefined);
  };

  const getEmployeeName = (employeeId?: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Não atribuído';
  };

  const toggleActive = (service: Service) => {
    const updatedServices = services.map(s =>
      s.id === service.id
        ? { ...s, isActive: !s.isActive, updatedAt: new Date().toISOString() }
        : s
    );
    setServices(updatedServices);
    toast({
      title: service.isActive ? "Serviço desativado" : "Serviço ativado",
      description: `O serviço foi ${service.isActive ? 'desativado' : 'ativado'} com sucesso.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de serviços e funcionários da oficina
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setEditingEmployee(undefined)}>
                <Users className="w-4 h-4 mr-2" />
                Funcionários
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
                </DialogTitle>
                <DialogDescription>
                  {editingEmployee 
                    ? 'Atualize as informações do funcionário.'
                    : 'Cadastre um novo funcionário responsável por serviços.'
                  }
                </DialogDescription>
              </DialogHeader>
              <EmployeeForm
                employee={editingEmployee}
                onSave={handleEmployeeSave}
                onCancel={handleEmployeeCancel}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingService(undefined)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
                <DialogDescription>
                  {editingService 
                    ? 'Atualize as informações do serviço.'
                    : 'Cadastre um novo serviço no catálogo.'
                  }
                </DialogDescription>
              </DialogHeader>
              <ServiceForm
                service={editingService}
                employees={employees}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Employees Section */}
      {employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Funcionários ({employees.filter(e => e.isActive).length} ativos)
            </CardTitle>
            <CardDescription>
              Lista de funcionários responsáveis pelos serviços
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 max-h-48 overflow-y-auto">
              {employees.map((employee) => (
                <div key={employee.id} className={`flex items-center justify-between p-3 rounded-lg border ${!employee.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.role}</p>
                    </div>
                    {!employee.isActive && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmployeeEdit(employee)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmployeeDelete(employee)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Wrench className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{services.length}</p>
                <p className="text-sm text-muted-foreground">Total de Serviços</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Wrench className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{activeServices.length}</p>
                <p className="text-sm text-muted-foreground">Serviços Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <DollarSign className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">
                  R$ {avgValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Valor Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{avgTime.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <div className="grid gap-4">
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum serviço encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory
                  ? 'Nenhum serviço corresponde aos filtros aplicados.'
                  : 'Comece cadastrando o primeiro serviço do catálogo.'
                }
              </p>
              {!searchTerm && !selectedCategory && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Serviço
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className={`transition-all duration-200 hover:shadow-lg ${!service.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{service.description}</h3>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                        {service.category}
                      </span>
                      {!service.isActive && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        R$ {service.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.estimatedTime}h
                      </div>
                      {service.responsibleEmployeeId && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {getEmployeeName(service.responsibleEmployeeId)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(service)}
                      className={service.isActive ? "text-warning hover:text-warning" : "text-success hover:text-success"}
                    >
                      {service.isActive ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service)}
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