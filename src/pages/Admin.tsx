import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Users, User, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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

export const Admin = () => {
  const [employees, setEmployees] = useLocalStorage<Employee[]>('employees', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const { toast } = useToast();

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeEmployees = employees.filter(e => e.isActive);

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

  const toggleEmployeeActive = (employee: Employee) => {
    const updatedEmployees = employees.map(e =>
      e.id === employee.id
        ? { ...e, isActive: !e.isActive, updatedAt: new Date().toISOString() }
        : e
    );
    setEmployees(updatedEmployees);
    toast({
      title: employee.isActive ? "Funcionário desativado" : "Funcionário ativado",
      description: `O funcionário foi ${employee.isActive ? 'desativado' : 'ativado'} com sucesso.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Shield className="w-8 h-8 mr-3 text-primary" />
            Administração
          </h1>
          <p className="text-muted-foreground">
            Gerencie funcionários e configurações do sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Funcionários</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          {/* Employee Management Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Funcionários</h2>
              <p className="text-muted-foreground">
                Gerencie a equipe de funcionários da oficina
              </p>
            </div>
            
            <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingEmployee(undefined)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Funcionário
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
                      : 'Cadastre um novo funcionário da oficina.'
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
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar funcionário por nome ou função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{employees.length}</p>
                    <p className="text-sm text-muted-foreground">Total de Funcionários</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-success" />
                  <div>
                    <p className="text-2xl font-bold">{activeEmployees.length}</p>
                    <p className="text-sm text-muted-foreground">Funcionários Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employees List */}
          <div className="grid gap-4">
            {filteredEmployees.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum funcionário encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? 'Nenhum funcionário corresponde aos filtros aplicados.'
                      : 'Comece cadastrando o primeiro funcionário da oficina.'
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsEmployeeDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeiro Funcionário
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredEmployees.map((employee) => (
                <Card key={employee.id} className={`transition-all duration-200 hover:shadow-lg ${!employee.isActive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-foreground">{employee.name}</h3>
                            {!employee.isActive && (
                              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                                Inativo
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground font-medium">{employee.role}</p>
                          {employee.phone && (
                            <p className="text-sm text-muted-foreground">{employee.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleEmployeeActive(employee)}
                          className={employee.isActive ? "text-warning hover:text-warning" : "text-success hover:text-success"}
                        >
                          {employee.isActive ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmployeeEdit(employee)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmployeeDelete(employee)}
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
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Configure as preferências gerais da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Configurações em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Esta seção será expandida com mais opções de configuração em futuras versões.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};