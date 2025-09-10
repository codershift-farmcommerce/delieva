import React from 'react';
import './spinner.module.css';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
  gifSrc?: string;
  alt?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color = '#3b82f6',
  className = '',
  gifSrc,
  alt = 'Cargando'
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  // If a GIF source is provided, render the GIF instead of CSS spinner
  if (gifSrc) {
    return (
      <div className={`spinner-container ${sizeClasses[size]} ${className}`}>
        <img 
          src={gifSrc} 
          alt={alt}
          className={`spinner-gif ${sizeClasses[size]}`}
          role="status"
          aria-label="Cargando"
        />
      </div>
    );
  }

  // Default CSS spinner
  return (
    <div
      className={`spinner ${sizeClasses[size]} ${className}`}
      style={{ borderTopColor: color }}
      role="status"
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

export default Spinner;
