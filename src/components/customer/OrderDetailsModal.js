// src/components/customer/OrderDetailsModal.js - Order Details View
import React from 'react';
import { X, Package, Calendar, MapPin, CreditCard, Truck, Phone, Mail } from 'lucide-react';

const OrderDetailsModal = ({ order, isOpen, onClose, statusConfig }) => {
  if (!isOpen || !order) return null;

  const orderId = order._id || order.id;
  const status = (order.status || 'pending').toLowerCase();
  const StatusIcon = statusConfig[status]?.icon || Package;
  const statusColor = statusConfig[status]?.color || 'bg-gray-100 text-gray-800';

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Calculate totals
  const calculateSubtotal = () => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (price * quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = parseFloat(order.shippingCost) || 0;
  const tax = parseFloat(order.tax) || 0;
  const discount = parseFloat(order.discount) || 0;
  const total = parseFloat(order.total) || subtotal + shipping + tax - discount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Order Details
              </h2>
              <p className="text-sm text-gray-500">
                Order #{orderId ? orderId.slice(-8) : 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Status and Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                    <StatusIcon className="w-4 h-4 mr-2" />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Order placed:</span>
                    <span className="ml-2 font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                  
                  {order.updatedAt && order.updatedAt !== order.createdAt && (
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">Last updated:</span>
                      <span className="ml-2 font-medium">{formatDate(order.updatedAt)}</span>
                    </div>
                  )}
                  
                  {order.estimatedDelivery && (
                    <div className="flex items-center text-sm">
                      <Truck className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">Estimated delivery:</span>
                      <span className="ml-2 font-medium">{formatDate(order.estimatedDelivery)}</span>
                    </div>
                  )}
                  
                  {order.trackingNumber && (
                    <div className="flex items-center text-sm">
                      <Package className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">Tracking number:</span>
                      <span className="ml-2 font-mono font-medium">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium">₹{shipping.toFixed(2)}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">₹{tax.toFixed(2)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              {order.items && order.items.length > 0 ? (
                <div className="divide-y">
                  {order.items.map((item, index) => (
                    <div key={index} className="p-4 flex items-center space-x-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name || 'Product'}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-medium text-gray-900 mb-1">
                          {item.name || 'Unknown item'}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Quantity: {item.quantity || 1}</span>
                          <span>Price: ₹{parseFloat(item.price || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          ₹{(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No items found in this order</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          {order.deliveryAddress && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                    <p className="text-gray-600 whitespace-pre-line">{order.deliveryAddress}</p>
                  </div>
                </div>
                
                {order.deliveryInstructions && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Instructions</h4>
                    <p className="text-gray-600">{order.deliveryInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium text-gray-900">
                      {order.paymentMethod || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${
                      order.paymentStatus === 'paid' ? 'bg-green-500' :
                      order.paymentStatus === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {order.paymentStatus || 'pending'}
                    </p>
                  </div>
                </div>
              </div>
              
              {order.transactionId && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-mono text-sm text-gray-900">{order.transactionId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {(order.customerEmail || order.customerPhone) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.customerEmail && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{order.customerEmail}</p>
                      </div>
                    </div>
                  )}
                  
                  {order.customerPhone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{order.customerPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Notes */}
          {order.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 whitespace-pre-line">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Order Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            {status === 'pending' || status === 'confirmed' ? (
              <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                Cancel Order
              </button>
            ) : null}
            
            {status === 'shipped' && (
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Track Package
              </button>
            )}
            
            {status === 'delivered' && (
              <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Leave Review
              </button>
            )}
            
            <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
              Download Invoice
            </button>
            
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;