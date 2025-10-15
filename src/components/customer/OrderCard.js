// src/components/customer/OrderCard.js - Order Display Component
import React from 'react';
import { Package, Calendar, MapPin, Eye, MoreVertical } from 'lucide-react';

const OrderCard = ({ order, onViewDetails, statusConfig }) => {
  if (!order) return null;

  const orderId = order._id || order.id;
  const status = (order.status || 'pending').toLowerCase();
  const StatusIcon = statusConfig[status]?.icon || Package;
  const statusColor = statusConfig[status]?.color || 'bg-gray-100 text-gray-800';

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get order items summary
  const getItemsSummary = () => {
    if (!order.items || !Array.isArray(order.items)) {
      return 'No items';
    }

    if (order.items.length === 1) {
      return order.items[0].name || 'Unknown item';
    } else if (order.items.length === 2) {
      return `${order.items[0].name || 'Item'} and ${order.items[1].name || 'Item'}`;
    } else {
      return `${order.items[0].name || 'Item'} and ${order.items.length - 1} other${order.items.length > 2 ? 's' : ''}`;
    }
  };

  // Calculate total items count
  const getTotalItemsCount = () => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Order Header */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{orderId ? orderId.slice(-6) : 'N/A'}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">
                {getItemsSummary()}
              </p>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(order.createdAt)}
                </div>
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-1" />
                  {getTotalItemsCount()} item{getTotalItemsCount() !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Order Amount */}
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-gray-900">
              ₹{parseFloat(order.total || 0).toFixed(2)}
            </div>
            {order.paymentMethod && (
              <p className="text-sm text-gray-500 mt-1">
                via {order.paymentMethod}
              </p>
            )}
          </div>
        </div>

        {/* Order Items Preview */}
        {order.items && order.items.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex-shrink-0 flex items-center space-x-2 bg-gray-50 rounded-lg p-3 min-w-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name || 'Product'}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name || 'Unknown item'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity || 1} × ₹{parseFloat(item.price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="flex-shrink-0 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  +{order.items.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery Information */}
        {order.deliveryAddress && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Delivery Address</p>
                <p className="text-sm text-gray-600 line-clamp-2">{order.deliveryAddress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            {/* Estimated Delivery */}
            {order.estimatedDelivery && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Est. delivery: </span>
                {formatDate(order.estimatedDelivery)}
              </div>
            )}
            
            {/* Tracking Info */}
            {order.trackingNumber && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Tracking: </span>
                <span className="font-mono">{order.trackingNumber}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Status-specific actions */}
            {status === 'delivered' && (
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 hover:bg-blue-50 rounded">
                Review Products
              </button>
            )}
            
            {status === 'shipped' && (
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 hover:bg-blue-50 rounded">
                Track Order
              </button>
            )}
            
            {(status === 'pending' || status === 'confirmed') && (
              <button className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1 hover:bg-red-50 rounded">
                Cancel Order
              </button>
            )}

            {/* View Details Button */}
            <button
              onClick={() => onViewDetails(order)}
              className="flex items-center text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </button>
          </div>
        </div>

        {/* Order Progress Indicator */}
        {status !== 'cancelled' && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Order Placed</span>
              <span>Confirmed</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-1"></div>
              </div>
              <div className="relative flex justify-between">
                {['pending', 'confirmed', 'shipped', 'delivered'].map((stepStatus, index) => {
                  const isCompleted = ['confirmed', 'shipped', 'delivered'].includes(status) && 
                                    ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(status) >= index;
                  const isCurrent = status === stepStatus;
                  
                  return (
                    <div
                      key={stepStatus}
                      className={`w-3 h-3 rounded-full border-2 ${
                        isCompleted || isCurrent
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300'
                      }`}
                    ></div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;