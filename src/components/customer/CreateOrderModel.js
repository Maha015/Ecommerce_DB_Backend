import React, { useState } from 'react';
import { X, Plus, Minus, MapPin } from 'lucide-react';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/helpers';

const CreateOrderModal = ({ isOpen, onClose, onSuccess }) => {
  const [orderData, setOrderData] = useState({
    items: [
      { name: '', price: '', quantity: 1, category: '' }
    ],
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    paymentMethod: 'cod',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderData({ ...orderData, items: newItems });
    
    // Clear errors
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`item_${index}_${field}`];
        return newErrors;
      });
    }
  };

  const handleAddressChange = (field, value) => {
    setOrderData({
      ...orderData,
      deliveryAddress: {
        ...orderData.deliveryAddress,
        [field]: value
      }
    });
    
    // Clear errors
    if (errors[`address_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`address_${field}`];
        return newErrors;
      });
    }
  };

  const addItem = () => {
    setOrderData({
      ...orderData,
      items: [...orderData.items, { name: '', price: '', quantity: 1, category: '', image: '' }]
    });
  };

  const removeItem = (index) => {
    if (orderData.items.length > 1) {
      const newItems = orderData.items.filter((_, i) => i !== index);
      setOrderData({ ...orderData, items: newItems });
    }
  };

  const updateQuantity = (index, change) => {
    const newItems = [...orderData.items];
    const newQuantity = Math.max(1, newItems[index].quantity + change);
    newItems[index] = { ...newItems[index], quantity: newQuantity };
    setOrderData({ ...orderData, items: newItems });
  };

  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate items
    orderData.items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item_${index}_name`] = 'Item name is required';
      }
      if (!item.price || parseFloat(item.price) <= 0) {
        newErrors[`item_${index}_price`] = 'Valid price is required';
      }
      if (!item.quantity || parseInt(item.quantity) <= 0) {
        newErrors[`item_${index}_quantity`] = 'Valid quantity is required';
      }
    });

    // Validate delivery address
    if (!orderData.deliveryAddress.street.trim()) {
      newErrors.address_street = 'Street address is required';
    }
    if (!orderData.deliveryAddress.city.trim()) {
      newErrors.address_city = 'City is required';
    }
    if (!orderData.deliveryAddress.state.trim()) {
      newErrors.address_state = 'State is required';
    }
    if (!orderData.deliveryAddress.pincode.trim()) {
      newErrors.address_pincode = 'Pincode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const orderPayload = {
        items: orderData.items.map(item => ({
          name: item.name.trim(),
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          category: item.category.trim() || 'General'
        })),
        total: calculateTotal(),
        deliveryAddress: {
          street: orderData.deliveryAddress.street.trim(),
          city: orderData.deliveryAddress.city.trim(),
          state: orderData.deliveryAddress.state.trim(),
          pincode: orderData.deliveryAddress.pincode.trim()
        },
        paymentMethod: orderData.paymentMethod,
        notes: orderData.notes.trim()
      };

      const response = await apiService.createOrder(orderPayload);

      if (response.success) {
        onSuccess();
        onClose();
        // Reset form
        setOrderData({
          items: [{ name: '', price: '', quantity: 1, category: '' }],
          deliveryAddress: {
            street: '',
            city: '',
            state: '',
            pincode: ''
          },
          paymentMethod: 'cod',
          notes: ''
        });
        setErrors({});
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setErrors({ general: error.message || 'Failed to create order' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {orderData.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                    {orderData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`item_${index}_name`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter item name"
                      />
                      {errors[`item_${index}_name`] && (
                        <p className="text-red-600 text-xs mt-1">{errors[`item_${index}_name`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter category (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`item_${index}_price`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                      {errors[`item_${index}_price`] && (
                        <p className="text-red-600 text-xs mt-1">{errors[`item_${index}_price`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(index, -1)}
                          className="p-1 text-gray-600 hover:text-gray-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(index, 1)}
                          className="p-1 text-gray-600 hover:text-gray-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Item Total */}
                  <div className="mt-3 text-right">
                    <span className="text-sm text-gray-600">Subtotal: </span>
                    <span className="font-medium">
                      {formatCurrency((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Street Address *
                </label>
                <input
                  type="text"
                  value={orderData.deliveryAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.address_street ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter street address"
                />
                {errors.address_street && (
                  <p className="text-red-600 text-xs mt-1">{errors.address_street}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={orderData.deliveryAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.address_city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="City"
                  />
                  {errors.address_city && (
                    <p className="text-red-600 text-xs mt-1">{errors.address_city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={orderData.deliveryAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.address_state ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="State"
                  />
                  {errors.address_state && (
                    <p className="text-red-600 text-xs mt-1">{errors.address_state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    value={orderData.deliveryAddress.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.address_pincode ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Pincode"
                  />
                  {errors.address_pincode && (
                    <p className="text-red-600 text-xs mt-1">{errors.address_pincode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={orderData.paymentMethod === 'cod'}
                  onChange={(e) => setOrderData({ ...orderData, paymentMethod: e.target.value })}
                  className="mr-2"
                />
                <span>Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={orderData.paymentMethod === 'online'}
                  onChange={(e) => setOrderData({ ...orderData, paymentMethod: e.target.value })}
                  className="mr-2"
                />
                <span>Online Payment</span>
              </label>
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              value={orderData.notes}
              onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any special delivery instructions..."
            />
          </div>

          {/* Order Total */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Order Total</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || calculateTotal() === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Order...' : `Create Order - ${formatCurrency(calculateTotal())}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;