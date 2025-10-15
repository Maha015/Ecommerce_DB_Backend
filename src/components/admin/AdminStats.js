import React from 'react';
import {
  Users,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  ShoppingCart
} from 'lucide-react';

const AdminStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: '+12%',
      changeType: 'increase',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Customers',
      value: stats?.activeCustomers || 0,
      change: '+8%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Delivery Agents',
      value: stats?.totalAgents || 0,
      change: '+3%',
      changeType: 'increase',
      icon: Truck,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toLocaleString() || '0'}`,
      change: '+15%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      change: '-5%',
      changeType: 'decrease',
      icon: ShoppingCart,
      color: 'bg-orange-500'
    },
    {
      title: 'Completion Rate',
      value: `${stats?.completionRate || 0}%`,
      change: '+2%',
      changeType: 'increase',
      icon: Activity,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const isIncrease = stat.changeType === 'increase';
        
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                isIncrease ? 'text-green-600' : 'text-red-600'
              }`}>
                {isIncrease ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStats;