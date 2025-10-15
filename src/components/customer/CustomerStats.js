import React from 'react';
import { Package, ShoppingBag, TrendingUp, Clock, Star, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const CustomerStats = ({ orders }) => {
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  const activeOrders = orders.filter(order => !['delivered', 'cancelled', 'returned'].includes(order.status)).length;
  
  // Calculate average order value
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  
  // Calculate this month's orders and spending
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
  });
  const thisMonthSpending = thisMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Calculate favorite categories
  const categorySpending = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      categorySpending[item.category] = (categorySpending[item.category] || 0) + (item.price * item.quantity);
    });
  });
  const favoriteCategory = Object.keys(categorySpending).reduce((a, b) => 
    categorySpending[a] > categorySpending[b] ? a : b, 'Electronics'
  );

  const stats = [
    {
      name: 'Total Orders',
      value: totalOrders,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      change: `+${thisMonthOrders.length} this month`,
      changeColor: 'text-green-600'
    },
    {
      name: 'Total Spent',
      value: formatCurrency(totalSpent),
      icon: CreditCard,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      change: `${formatCurrency(thisMonthSpending)} this month`,
      changeColor: 'text-green-600'
    },
    {
      name: 'Delivered Orders',
      value: deliveredOrders,
      icon: Star,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      change: `${Math.round((deliveredOrders / totalOrders) * 100)}% success rate`,
      changeColor: 'text-purple-600'
    },
    {
      name: 'Active Orders',
      value: activeOrders,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      change: 'Currently tracking',
      changeColor: 'text-orange-600'
    },
    {
      name: 'Average Order',
      value: formatCurrency(averageOrderValue),
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      change: 'Per order value',
      changeColor: 'text-indigo-600'
    },
    {
      name: 'Favorite Category',
      value: favoriteCategory,
      icon: ShoppingBag,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      change: formatCurrency(categorySpending[favoriteCategory] || 0),
      changeColor: 'text-pink-600'
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Shopping Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white p-6 rounded-lg shadow-sm border ${stat.border} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </p>
                  <p className={`text-sm ${stat.changeColor} font-medium`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Insights */}
      {orders.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Shopping Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round(deliveredOrders / totalOrders * 100)}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Items Ordered</div>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Object.keys(categorySpending).length}
              </div>
              <div className="text-sm text-gray-600">Categories Explored</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerStats;