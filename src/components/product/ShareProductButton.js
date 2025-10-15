// src/components/product/ShareProductButton.js
import React, { useState } from 'react';
import { Share2, Copy, MessageCircle, Mail, X } from 'lucide-react';

const ShareProductButton = ({ product, className = '', size = 'md' }) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const productUrl = `${window.location.origin}/products/${product._id}`;
  const shareText = `Check out this amazing product: ${product.name}`;

  // Handle native sharing
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl,
        });
        setShowModal(false);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      setShowModal(true);
    }
  };

  // Copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Social media sharing functions
  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${productUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    setShowModal(false);
  };

  const shareOnEmail = () => {
    const subject = encodeURIComponent(`Check out this product: ${product.name}`);
    const body = encodeURIComponent(`${shareText}\n\n${productUrl}\n\nPrice: ₹${product.price}`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    setShowModal(false);
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
    window.open(twitterUrl, '_blank');
    setShowModal(false);
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
    window.open(facebookUrl, '_blank');
    setShowModal(false);
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  return (
    <>
      {/* Share Button */}
      <button
        onClick={handleNativeShare}
        className={`inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-colors ${buttonSizeClasses[size]} ${className}`}
        title="Share this product"
      >
        <Share2 className={sizeClasses[size]} />
      </button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Share Product</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Preview */}
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <img
                  src={product.image || '/api/placeholder/60/60'}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/60/60';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-600">₹{product.price}</p>
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="p-4">
              {/* Copy Link */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={productUrl}
                    readOnly
                    className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      copied
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Social Share Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Share via
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={shareOnWhatsApp}
                    className="flex items-center space-x-2 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">WhatsApp</span>
                  </button>

                  <button
                    onClick={shareOnEmail}
                    className="flex items-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">Email</span>
                  </button>

                  <button
                    onClick={shareOnTwitter}
                    className="flex items-center space-x-2 p-3 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span className="font-medium">Twitter</span>
                  </button>

                  <button
                    onClick={shareOnFacebook}
                    className="flex items-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="font-medium">Facebook</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareProductButton;