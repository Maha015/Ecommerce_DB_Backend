// src/components/common/LoadingScreen.js - SMOOTH LOADING COMPONENT
import React from 'react';

const LoadingScreen = ({ message = 'Loading...', fullScreen = true }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50 animate-fade-in">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium animate-pulse">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 animate-fade-in">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;