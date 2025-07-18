import { useEffect, useState } from 'react';
import { Users, Car, Wrench, FileText, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/types';
import { getFromLocalStorage } from '@/hooks/useLocalStorage';

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  description: string; 
  icon: any; 
  trend?: string 
}) => (
  <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <p className="text-xs text-muted-foreground">
        {description}
      </p>
      {trend && (
        <div className="flex items-center mt-2 text-xs text-success">
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend}
        </div>
      )}
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalCars: 0,
    totalServices: 0,
    pendingOrders: 0,
    completedOrders: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    // Calculate stats from localStorage data
    const clients = getFromLocalStorage('clients', []);
    const cars = getFromLocalStorage('cars', []);
    const services = getFromLocalStorage('services', []);
    const orders = getFromLocalStorage('service_orders', []);

    const pendingOrders = orders.filter((order: any) => 
      order.status === 'pending' || order.status === 'in_progress'
    ).length;

    const completedOrders = orders.filter((order: any) => 
      order.status === 'completed'
    ).length;

    // Calculate monthly revenue (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = orders
      .filter((order: any) => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear &&
               order.status === 'completed';
      })
      .reduce((total: number, order: any) => total + (order.totalValue || 0), 0);

    setStats({
      totalClients: clients.length,
      totalCars: cars.length,
      totalServices: services.length,
      pendingOrders,
      completedOrders,
      monthlyRevenue
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da Oficina Nova Brasil - Chapeação
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Clientes"
          value={stats.totalClients}
          description="Clientes cadastrados"
          icon={Users}
          trend={stats.totalClients > 0 ? "+2 este mês" : undefined}
        />
        <StatCard
          title="Veículos Cadastrados"
          value={stats.totalCars}
          description="Veículos na base"
          icon={Car}
        />
        <StatCard
          title="Serviços Disponíveis"
          value={stats.totalServices}
          description="Serviços cadastrados"
          icon={Wrench}
        />
        <StatCard
          title="Ordens Pendentes"
          value={stats.pendingOrders}
          description="Aguardando execução"
          icon={Clock}
        />
        <StatCard
          title="Ordens Concluídas"
          value={stats.completedOrders}
          description="Finalizadas com sucesso"
          icon={FileText}
          trend={stats.completedOrders > 0 ? `${stats.completedOrders} este mês` : undefined}
        />
        <StatCard
          title="Receita Mensal"
          value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Faturamento do mês"
          icon={TrendingUp}
          trend={stats.monthlyRevenue > 0 ? "+15% vs mês anterior" : undefined}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 bg-gradient-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Novo Cliente</h3>
                <p className="text-sm opacity-90">Cadastrar cliente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 bg-gradient-accent text-accent-foreground">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Car className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Novo Veículo</h3>
                <p className="text-sm opacity-90">Cadastrar veículo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 bg-success text-success-foreground">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Wrench className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Novo Serviço</h3>
                <p className="text-sm opacity-90">Cadastrar serviço</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 bg-warning text-warning-foreground">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Nova OS</h3>
                <p className="text-sm opacity-90">Criar ordem de serviço</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};