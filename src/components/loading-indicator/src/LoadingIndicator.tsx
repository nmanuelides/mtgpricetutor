import React from 'react';
import '../styles/desktop.scss';
import '../styles/mobile.scss';

interface LoadingIndicatorProps {
  isLoading: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoading }: LoadingIndicatorProps) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-indicator">
      <div className="circle red"></div>
      <div className="circle black"></div>
      <div className="circle blue"></div>
      <div className="circle white"></div>
      <div className="circle green"></div>
    </div>
  );
};

export default LoadingIndicator;
