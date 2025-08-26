import React from 'react';

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4         <div className={`glass-card max-w-2xl w-full max-h-90vh overflow-y-auto ${className}`}>-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${className}`}></div>
  );
};

// Error Alert Component
export const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="glass-card-small status-error mb-4 flex items-center justify-between">
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-current hover:opacity-80 ml-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Success Alert Component
export const SuccessAlert = ({ message, onClose }) => {
  return (
    <div className="glass-card-small status-success mb-4 flex items-center justify-between">
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-current hover:opacity-80 ml-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Region Selector Component
export const RegionSelector = ({ value, onChange, regions, className = '' }) => {
  const regionDisplayNames = {
    'us-east-1': 'US East (N. Virginia)',
    'us-west-2': 'US West (Oregon)',
    'us-west-1': 'US West (N. California)',
    'eu-west-1': 'Europe (Ireland)',
    'eu-central-1': 'Europe (Frankfurt)',
    'ap-southeast-1': 'Asia Pacific (Singapore)',
    'ap-northeast-1': 'Asia Pacific (Tokyo)',
    'ap-south-1': 'Asia Pacific (Mumbai)',
    'ca-central-1': 'Canada (Central)',
    'sa-east-1': 'South America (São Paulo)',
    'all': 'All Regions'
  };

  return (
    <div className={`form-field ${className}`}>
      <label className="label">AWS Region</label>
      <select 
        className="select"
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        {regions.map(region => (
          <option key={region} value={region}>
            {regionDisplayNames[region] || region}
          </option>
        ))}
      </select>
    </div>
  );
};

// Search Filter Component
export const SearchFilter = ({ value, onChange, placeholder = "Search...", className = '' }) => {
  return (
    <div className={`form-field ${className}`}>
      <label className="label">Search</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-white opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="input pl-10"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

// Resource Card Component
export const ResourceCard = ({ title, children, status, onClick, className = '' }) => {
  const statusClass = status ? `status-${status}` : '';
  
  return (
    <div 
      className={`glass-card-small cursor-pointer transition-all duration-300 hover:scale-105 ${className} ${onClick ? 'hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title text-lg">{title}</h3>
        {status && (
          <span className={`status-badge ${statusClass}`}>
            {status}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

// Stats Card Component
export const StatsCard = ({ title, value, icon, trend, className = '' }) => {
  return (
    <div className={`glass-card-small text-center hover:scale-105 transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-center mb-4">
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
      <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">{title}</h3>
      <div className="text-4xl font-bold text-white mb-3 text-shadow">{value}</div>
      {trend && (
        <div className={`text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm ${
          trend.positive 
            ? 'text-green-300 bg-green-500/20 border border-green-500/30' 
            : 'text-red-300 bg-red-500/20 border border-red-500/30'
        }`}>
          {trend.positive ? '↗' : '↘'} {trend.value}
        </div>
      )}
    </div>
  );
};

// Modal Component
export const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="section-title">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Form Field Component
export const FormField = ({ label, children, error, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="label">{label}</label>}
      {children}
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

// Tag Component
export const Tag = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'status-info',
    success: 'status-success',
    warning: 'status-warning',
    error: 'status-error'
  };

  return (
    <span className={`status-badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Progress Bar Component
export const ProgressBar = ({ progress, className = '' }) => {
  return (
    <div className={`w-full bg-white bg-opacity-20 rounded-full h-2 ${className}`}>
      <div 
        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

// Notification Badge Component
export const NotificationBadge = ({ count, className = '' }) => {
  if (count === 0) return null;

  return (
    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

// Empty State Component
export const EmptyState = ({ title, description, icon, action, className = '' }) => {
  return (
    <div className={`glass-card text-center py-12 ${className}`}>
      {icon && (
        <div className="text-6xl mb-6 opacity-60">
          {icon}
        </div>
      )}
      <h3 className="text-2xl font-semibold text-white mb-4 text-shadow">{title}</h3>
      {description && (
        <p className="text-white text-lg opacity-80 mb-8 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
};
