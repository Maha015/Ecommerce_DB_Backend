import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProduct } from '../contexts/ProductContext';
import {
  CreditCard,
  Package,
  MapPin,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Truck,
  Clock,
  X,
  Lock,
  Zap,
  Star,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getCartTotal, clearCart } = useProduct();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');

  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    if (location.state?.product) {
      const product = location.state.product;
      const buyNowItem = {
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        quantity: location.state.quantity || 1,
        image: product.image || product.images?.[0],
        category: product.category,
        description: product.description
      };
      setCheckoutItems([buyNowItem]);
      setIsBuyNow(true);
    } else if (cart && cart.length > 0) {
      setCheckoutItems(cart);
      setIsBuyNow(false);
    }
  }, [location.state, cart]);

  const calculateSubtotal = () => {
    const total = checkoutItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    return parseFloat(total.toFixed(2));
  };

  const subtotal = calculateSubtotal();
  const tax = parseFloat((subtotal * 0.18).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  const validateDeliveryDetails = () => {
    const { fullName, phone, email, address, city, state, pincode } = deliveryDetails;
    if (!fullName || !phone || !email || !address || !city || !state || !pincode) {
      setError('Please fill in all delivery details');
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1 && validateDeliveryDetails()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (paymentMethod === 'razorpay') {
        handleRazorpayPayment();
      } else {
        handlePlaceOrder();
      }
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleRazorpayPayment = () => {
    setLoading(true);
    setError('');

    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag",
      amount: Math.round(total * 100),
      currency: "INR",
      name: "E-Commerce Store",
      description: `Order Payment - ${checkoutItems.length} item(s)`,
      image: "/logo.png",
      handler: function (response) {
        console.log('✅ Razorpay Payment Success:', response);
        handlePlaceOrder(response.razorpay_payment_id);
      },
      prefill: {
        name: deliveryDetails.fullName,
        email: deliveryDetails.email,
        contact: deliveryDetails.phone
      },
      notes: {
        address: deliveryDetails.address
      },
      theme: {
        color: "#0f172a"
      },
      modal: {
        ondismiss: function() {
          setLoading(false);
          setError('Payment cancelled. Please try again.');
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', function (response) {
      setLoading(false);
      setError(`Payment failed: ${response.error.description}`);
    });

    razorpay.open();
  };

  const handlePlaceOrder = async (razorpayPaymentId = null) => {
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: checkoutItems.map(item => ({
          productId: item.productId || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        deliveryAddress: `${deliveryDetails.address}, ${deliveryDetails.city}, ${deliveryDetails.state} - ${deliveryDetails.pincode}`,
        deliveryDetails,
        paymentMethod,
        paymentDetails: paymentMethod !== 'cod' ? {
          razorpayPaymentId: razorpayPaymentId || undefined
        } : undefined,
        subtotal,
        tax,
        total,
        orderType: isBuyNow ? 'buy-now' : 'cart'
      };

      const response = await api.createOrder(orderData);

      if (response.success) {
        const newOrderId = response.data._id || 'ORDER_' + Date.now();
        setOrderId(newOrderId);
        
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 6);
        setExpectedDelivery(deliveryDate.toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }));
        
        setOrderPlaced(true);
        if (!isBuyNow) await clearCart();
      } else {
        throw new Error(response.error || 'Failed to place order');
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 pt-20">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-12 text-center max-w-md border border-gray-100">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Package className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">No Items to Checkout</h2>
          <p className="text-gray-600 mb-8 font-medium">
            {location.state?.product
              ? 'Product information missing. Please try again.'
              : 'Your cart is empty. Add items to proceed!'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-3 rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all transform hover:scale-105 font-bold shadow-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4 pt-20">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-12 text-center max-w-lg w-full border border-green-200">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-700 mb-3">
            Thank you, <span className="font-bold text-slate-900">{deliveryDetails.fullName}</span>!
          </p>
          <p className="text-gray-600 mb-10">
            Order ID: <span className="font-mono font-black text-slate-900 text-lg">#{orderId.slice(-8).toUpperCase()}</span>
          </p>
          
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-7 mb-8 text-left border-2 border-slate-200 space-y-5">
            <div className="flex items-center gap-4 pb-5 border-b-2 border-slate-200">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Expected Delivery</p>
                <p className="font-black text-gray-900 text-lg">{expectedDelivery}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 pb-5 border-b-2 border-slate-200">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Delivery Address</p>
                <p className="font-semibold text-gray-800 text-sm mt-1">
                  {deliveryDetails.address}<br/>
                  {deliveryDetails.city}, {deliveryDetails.state} - {deliveryDetails.pincode}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Total Amount Paid</p>
                <p className="font-black text-gray-900 text-2xl">₹{total.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-3 rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all transform hover:scale-105 w-full font-bold shadow-lg"
            >
              Track Your Order
            </button>
            <button
              onClick={() => navigate('/')}
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-2xl hover:bg-slate-50 transition-all w-full font-bold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-700 hover:text-slate-900 transition-colors mb-6 group font-bold"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900">Secure Checkout</h1>
              {isBuyNow && (
                <p className="text-slate-700 text-sm mt-3 flex items-center gap-2 font-bold">
                  <Zap className="w-4 h-4 text-slate-900" />
                  Express Checkout
                </p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 bg-green-100 px-5 py-3 rounded-2xl border-2 border-green-200">
              <ShieldCheck className="w-5 h-5 text-green-700" />
              <span className="text-sm font-black text-green-900">100% Secure</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black transition-all text-sm ${
                currentStep >= 1 ? 'bg-slate-900 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <span className="text-xs mt-3 font-bold text-gray-700 uppercase tracking-widest">Delivery</span>
            </div>
            
            <div className={`flex-1 h-2 mx-5 transition-all rounded-full ${
              currentStep >= 2 ? 'bg-slate-900 shadow-md' : 'bg-gray-200'
            }`}></div>
            
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black transition-all text-sm ${
                currentStep >= 2 ? 'bg-slate-900 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="text-xs mt-3 font-bold text-gray-700 uppercase tracking-widest">Payment</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-50 border-2 border-red-300 p-5 rounded-2xl flex items-start gap-4 shadow-lg">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-black">Error</p>
              <p className="text-red-800 text-sm font-medium mt-1">{error}</p>
            </div>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-6 h-6 text-red-600 hover:text-red-700" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1 - Delivery Details */}
            {currentStep === 1 && (
              <div className="bg-white/80 backdrop-blur-xl shadow-lg rounded-3xl p-10 border border-gray-100">
                <div className="flex items-center mb-8">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mr-5">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Delivery Details</h2>
                    <p className="text-sm text-gray-600 font-medium">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-gray-700 mb-3 block uppercase tracking-widest">Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={deliveryDetails.fullName}
                        onChange={e => setDeliveryDetails({ ...deliveryDetails, fullName: e.target.value })}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-700 mb-3 block uppercase tracking-widest">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={deliveryDetails.phone}
                        onChange={e => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-3 block uppercase tracking-widest">Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={deliveryDetails.email}
                      onChange={e => setDeliveryDetails({ ...deliveryDetails, email: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-700 mb-3 block uppercase tracking-widest">Street Address</label>
                    <textarea
                      placeholder="House No., Area, Landmark"
                      rows="3"
                      value={deliveryDetails.address}
                      onChange={e => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none resize-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs font-black text-gray-700 mb-3 block uppercase tracking-widest">City</label>
                      <input
                        type="text"
                        placeholder="Mumbai"
                        value={deliveryDetails.city}
                        onChange={e => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-700 mb-3 block uppercase tracking-widest">State</label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={deliveryDetails.state}
                        onChange={e => setDeliveryDetails({ ...deliveryDetails, state: e.target.value })}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-700 mb-3 block uppercase tracking-widest">Pincode</label>
                      <input
                        type="text"
                        placeholder="400001"
                        value={deliveryDetails.pincode}
                        onChange={e => setDeliveryDetails({ ...deliveryDetails, pincode: e.target.value })}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="mt-10 w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-5 rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all font-black text-lg shadow-lg transform hover:scale-105 duration-300"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2 - Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white/80 backdrop-blur-xl shadow-lg rounded-3xl p-10 border border-gray-100">
                <div className="flex items-center mb-8">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mr-5">
                    <CreditCard className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Payment Method</h2>
                    <p className="text-sm text-gray-600 font-medium">Choose your preferred payment option</p>
                  </div>
                </div>

                <div className="space-y-5 mb-10">
                  {/* Razorpay Option */}
                  <label
                    className={`relative flex items-center p-7 border-2 rounded-2xl cursor-pointer transition-all transform hover:scale-102 ${
                      paymentMethod === 'razorpay'
                        ? 'border-slate-900 bg-slate-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-6 h-6 text-slate-900 mr-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Lock className="w-5 h-5 text-slate-900" />
                        <span className="font-black text-gray-900">Razorpay Payment Gateway</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium mb-3">
                        Card, UPI, Netbanking & More - All methods supported
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full font-black">
                          Test Mode
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          Card: 4111 1111 1111 1111
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    className={`relative flex items-center p-7 border-2 rounded-2xl cursor-pointer transition-all transform hover:scale-102 ${
                      paymentMethod === 'cod'
                        ? 'border-green-600 bg-green-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-6 h-6 text-green-600 mr-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="w-5 h-5 text-green-700" />
                        <span className="font-black text-gray-900">Cash on Delivery</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        Pay with cash when your order is delivered
                      </p>
                    </div>
                  </label>
                </div>

                {/* Trust Badges */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-7 mb-10 border-2 border-slate-200">
                  <div className="flex flex-wrap items-center justify-center gap-8">
                    <div className="flex items-center gap-3 text-gray-700">
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                      <span className="font-black">Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Lock className="w-6 h-6 text-slate-900" />
                      <span className="font-black">SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                      <span className="font-black">100% Safe</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all font-black"
                  >
                    Back to Delivery
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 px-6 rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all font-black disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 duration-300"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5 animate-spin" />
                        Processing...
                      </span>
                    ) : paymentMethod === 'razorpay' ? (
                      'Proceed to Pay'
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl shadow-lg rounded-3xl p-8 sticky top-32 border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <Package className="w-6 h-6 text-slate-900" />
                Order Summary
              </h2>

              <div className="space-y-5 mb-8 max-h-72 overflow-y-auto pr-3">
                {checkoutItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-gray-200">
                    <img
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-600 mt-2 font-semibold">Qty: <span className="text-slate-900">{item.quantity}</span></p>
                      <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 mt-2">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between text-gray-700 font-semibold">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-black">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-semibold">
                  <span>Tax (18%)</span>
                  <span className="text-gray-900 font-black">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                  <span className="text-xl font-black text-gray-900">Total</span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Truck className="w-5 h-5 text-green-700 flex-shrink-0" />
                  <span className="font-black">Free delivery on all orders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;