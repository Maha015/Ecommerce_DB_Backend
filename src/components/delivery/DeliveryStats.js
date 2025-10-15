import React from 'react';
import { 
  Package, 
  DollarSign, 
  Star, 
  Clock, 
  TrendingUp, 
  Calendar,
  Target,
  Award,
  Truck
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const DeliveryStats = ({ orders, completedOrders, todayEarnings }) => {
  // Calculate various statistics
  const totalDeliveries = completedOrders.length;
  const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.total * 0.1), 0);
  
  // Weekly earnings
  const weeklyEarnings = completedOrders
    .filter(order => {
      const orderDate = new Date(order.deliveryTime || order.orderDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return orderDate >= weekAgo;
    })
    .reduce((sum, order) => sum + (order.total * 0.1), 0);

  // Monthly earnings
  const monthlyEarnings = completedOrders
    .filter(order => {
      const orderDate = new Date(order.deliveryTime || order.orderDate);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return orderDate >= monthAgo;
    })
    .reduce((sum, order) => sum + (order.total * 0.1), 0);

  // Average rating
  const avgRating = completedOrders.length > 0 
    ? completedOrders.reduce((sum, order) => sum + (order.rating || 4.5), 0) / completedOrders.length
    : 0;

  // Average delivery time (mock calculation)
  const avgDeliveryTime = 28; // minutes

  // This week's completed deliveries
  const thisWeekDeliveries = completedOrders.filter(order => {
    const orderDate = new Date(order.deliveryTime || order.orderDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return orderDate >= weekAgo;
  }).length;

  // Daily breakdown for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const dailyStats = last7Days.map(date => {
    const dateString = date.toDateString();
    const dayOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.deliveryTime || order.orderDate);
      return orderDate.toDateString() === dateString;
    });
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      deliveries: dayOrders.length,
      earnings: dayOrders.reduce((sum, order) => sum + (order.total * 0.1), 0)
    };
  });

  // Performance metrics
  const performanceScore = Math.min(100, (avgRating * 20) + (totalDeliveries * 2));
  const onTimeDeliveries = Math.floor(totalDeliveries * 0.92); // 92% on-time rate

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Today's Earnings</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(todayEarnings)}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12% from yesterday</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Weekly Earnings</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(weeklyEarnings)}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-blue-600">
              <span>{thisWeekDeliveries} deliveries this week</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Monthly Earnings</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(monthlyEarnings)}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-purple-600">
              <span>{totalDeliveries} total deliveries</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Earnings</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalEarnings)}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-orange-600">
              <span>Lifetime earnings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 rounded-full p-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Average Rating</p>
                  <p className="text-sm text-gray-500">Based on {completedOrders.length} deliveries</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(avgRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">On-Time Deliveries</p>
                  <p className="text-sm text-gray-500">Delivered within estimated time</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{onTimeDeliveries}</p>
                <p className="text-sm text-green-600">92% success rate</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Avg. Delivery Time</p>
                  <p className="text-sm text-gray-500">From pickup to delivery</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{avgDeliveryTime}</p>
                <p className="text-sm text-gray-500">minutes</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Performance Score</p>
                  <p className="text-sm text-gray-500">Overall performance rating</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{performanceScore.toFixed(0)}</p>
                <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${performanceScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Breakdown (Last 7 Days)</h3>
          <div className="space-y-4">
            {dailyStats.map((day, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">{day.date}</p>
                  <p className="text-sm text-gray-500">{day.deliveries} deliveries</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(day.earnings)}</p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (day.deliveries / Math.max(...dailyStats.map(d => d.deliveries)) * 100))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements & Milestones */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements & Milestones</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg border-2 ${totalDeliveries >= 10 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <div className={`rounded-full p-2 ${totalDeliveries >= 10 ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Package className={`h-5 w-5 ${totalDeliveries >= 10 ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">First 10 Deliveries</p>
                <p className="text-sm text-gray-500">{totalDeliveries}/10 completed</p>
              </div>
            </div>
            {totalDeliveries >= 10 && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Completed
                </span>
              </div>
            )}
          </div>

          <div className={`p-4 rounded-lg border-2 ${avgRating >= 4.5 ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <div className={`rounded-full p-2 ${avgRating >= 4.5 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                <Star className={`h-5 w-5 ${avgRating >= 4.5 ? 'text-yellow-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">4.5+ Star Rating</p>
                <p className="text-sm text-gray-500">Current: {avgRating.toFixed(1)}</p>
              </div>
            </div>
            {avgRating >= 4.5 && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ✓ Achieved
                </span>
              </div>
            )}
          </div>

          <div className={`p-4 rounded-lg border-2 ${totalEarnings >= 1000 ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <div className={`rounded-full p-2 ${totalEarnings >= 1000 ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <DollarSign className={`h-5 w-5 ${totalEarnings >= 1000 ? 'text-purple-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">₹1,000 Earnings</p>
                <p className="text-sm text-gray-500">{formatCurrency(totalEarnings)} earned</p>
              </div>
            </div>
            {totalEarnings >= 1000 && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  ✓ Unlocked
                </span>
              </div>
            )}
          </div>

          <div className={`p-4 rounded-lg border-2 ${thisWeekDeliveries >= 20 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <div className={`rounded-full p-2 ${thisWeekDeliveries >= 20 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Truck className={`h-5 w-5 ${thisWeekDeliveries >= 20 ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Weekly Champion</p>
                <p className="text-sm text-gray-500">{thisWeekDeliveries}/20 this week</p>
              </div>
            </div>
            {thisWeekDeliveries >= 20 && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  ✓ Earned
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Commission Structure</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Base Commission (10%)</span>
                <span className="font-medium">Standard rate</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Premium Delivery Bonus</span>
                <span className="font-medium text-blue-600">+₹20</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Peak Hour Bonus</span>
                <span className="font-medium text-green-600">+₹15</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600">Weekend Bonus</span>
                <span className="font-medium text-purple-600">+25%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Next Milestone</h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">50 Total Deliveries</span>
                  <span className="text-sm font-medium">{totalDeliveries}/50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (totalDeliveries / 50) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Unlock Premium Partner status</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">₹5,000 Monthly Earnings</span>
                  <span className="text-sm font-medium">{formatCurrency(monthlyEarnings)}/₹5,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (monthlyEarnings / 5000) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Qualify for monthly bonus</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryStats;