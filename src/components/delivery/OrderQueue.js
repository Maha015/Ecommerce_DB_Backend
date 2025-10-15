import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Phone, 
  Navigation, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  Camera,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../utils/constants';

const OrderQueue = ({ orders, onUpdateStatus }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pickup, delivery
  
  // Separate orders by status
  const pendingPickup = orders.filter(order => 
    ['confirmed', 'preparing', 'ready_for_pickup'].includes(order.status)
  );
  
  const inProgress = orders.filter(order => 
    ['picked_up', 'in_transit', 'out_for_delivery'].includes(order.status)
  );

  const filteredOrders = filter === 'pickup' ? pendingPickup : 
                         filter === 'delivery' ? inProgress : 
                         orders;

  const handleStatusUpdate = (orderId, newStatus) => {
    onUpdateStatus(orderId, newStatus);
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'confirmed': ORDER_STATUSES.PICKED_UP,
      'preparing': ORDER_STATUSES.PICKED_UP,
      'ready_for_pickup': ORDER_STATUSES.PICKED_UP,
      'picked_up': ORDER_STATUSES.IN_TRANSIT,
      'in_transit': ORDER_STATUSES.OUT_FOR_DELIVERY,
      'out_for_delivery': ORDER_STATUSES.DELIVERED
    };
    return statusFlow[currentStatus];
  };

  const getActionText = (status) => {
    const actions = {
      'confirmed': 'Pick Up',
      'preparing': 'Pick Up',
      'ready_for_pickup': 'Pick Up',
      'picked_up': 'Start Delivery',
      'in_transit': 'Out for Delivery',
      'out_for_delivery': 'Mark Delivered'
    };
    return actions[status] || 'Update Status';
  };

  const calculateEarnings = (orderTotal) => {
    return orderTotal * 0.1; // 10% commission
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pickup')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            filter === 'pickup'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending Pickup ({pendingPickup.length})
        </button>
        <button
          onClick={() => setFilter('delivery')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            filter === 'delivery'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          In Progress ({inProgress.length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Order Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(order.orderDate)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Earn: {formatCurrency(calculateEarnings(order.total))}
                  </div>
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="mt-2 text-gray-400 hover:text-gray-600"
                  >
                    {expandedOrder === order.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{order.customerAddress}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>ETA: {formatDate(order.expectedDelivery)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {order.status !== 'delivered' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status))}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>{getActionText(order.status)}</span>
                  </button>
                )}
                
                <a
                  href={`tel:${order.customerPhone}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Customer</span>
                </a>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions</span>
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedOrder === order.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-100 rounded p-2">
                              <Package className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">
                                {item.category} • Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Delivery Info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Customer Details</h4>
                      <div className="bg-white rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="font-medium">{order.customerName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="font-medium">{order.customerPhone}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <span className="text-sm text-gray-600">Address:</span>
                          <p className="font-medium mt-1">{order.customerAddress}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Delivery Instructions</h4>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          {order.specialInstructions || 'No special instructions provided'}
                        </p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                      <div className="bg-white rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Payment Method:</span>
                          <span className="font-medium">{order.paymentMethod}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Order Total:</span>
                          <span className="font-medium">{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex items-center justify-between border-t pt-2">
                          <span className="text-sm text-gray-600">Your Commission:</span>
                          <span className="font-medium text-green-600">{formatCurrency(calculateEarnings(order.total))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Actions */}
                {order.status === 'out_for_delivery' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Delivery Confirmation</h4>
                    <div className="flex flex-wrap gap-3">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <Camera className="h-4 w-4" />
                        <span>Take Photo</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>Get Signature</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, ORDER_STATUSES.DELIVERED)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Confirm Delivery</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Order Timeline</h4>
                  <div className="space-y-3">
                    {[
                      { status: 'confirmed', label: 'Order Confirmed', time: order.orderDate },
                      { status: 'ready_for_pickup', label: 'Ready for Pickup', time: order.orderDate },
                      { status: 'picked_up', label: 'Picked Up', time: order.pickupTime },
                      { status: 'in_transit', label: 'In Transit', time: order.transitTime },
                      { status: 'out_for_delivery', label: 'Out for Delivery', time: order.deliveryStartTime },
                      { status: 'delivered', label: 'Delivered', time: order.deliveryTime }
                    ].map((step, index) => {
                      const isCompleted = [
                        'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 
                        'in_transit', 'out_for_delivery', 'delivered'
                      ].indexOf(order.status) >= [
                        'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 
                        'in_transit', 'out_for_delivery', 'delivered'
                      ].indexOf(step.status);
                      
                      const isCurrent = order.status === step.status;
                      
                      return (
                        <div key={index} className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            isCompleted 
                              ? 'bg-green-500' 
                              : isCurrent 
                                ? 'bg-blue-500' 
                                : 'bg-gray-300'
                          }`} />
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {step.label}
                            </p>
                            {step.time && isCompleted && (
                              <p className="text-xs text-gray-500">
                                {formatDate(step.time)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'pickup' 
              ? "You don't have any orders ready for pickup right now." 
              : filter === 'delivery'
                ? "You don't have any active deliveries at the moment."
                : "You don't have any assigned orders currently."
            }
          </p>
          <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-blue-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Pro Tip</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Check back regularly for new orders, or contact your dispatch team if you're available for more deliveries.
            </p>
          </div>
        </div>
      )}

      {/* Action Summary */}
      {filteredOrders.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Today's Summary</h3>
              <p className="text-sm text-blue-700 mt-1">
                {pendingPickup.length} orders ready for pickup • {inProgress.length} active deliveries
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-blue-900">
                Potential Earnings: {formatCurrency(
                  filteredOrders.reduce((sum, order) => sum + calculateEarnings(order.total), 0)
                )}
              </p>
              <p className="text-sm text-blue-700">
                From {filteredOrders.length} orders
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button className="flex flex-col items-center space-y-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <MapPin className="h-6 w-6 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Update Location</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Clock className="h-6 w-6 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Break Time</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Truck className="h-6 w-6 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Vehicle Issue</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <MessageCircle className="h-6 w-6 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Contact Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderQueue;