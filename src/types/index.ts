// Types for the Oficina Nova Brasil App

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Car {
  id: string;
  clientId: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  color?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  description: string;
  value: number;
  estimatedTime: number; // in hours
  category: string;
  responsibleEmployeeId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOrderItem {
  serviceId: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  description?: string;
}

export interface ServiceOrder {
  id: string;
  clientId: string;
  carId: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  services: ServiceOrderItem[];
  totalValue: number;
  estimatedTime: number;
  observations?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface DashboardStats {
  totalClients: number;
  totalCars: number;
  totalServices: number;
  pendingOrders: number;
  completedOrders: number;
  monthlyRevenue: number;
}