import React from 'react';

export const RegionSelector = ({ regions, selectedRegion, onRegionChange, loading = false }) => {
  return (
    <div className="region-selector">
      <label htmlFor="region-select">AWS Region:</label>
      <select
        id="region-select"
        className="form-control region-select"
        value={selectedRegion || 'all'}
        onChange={(e) => onRegionChange(e.target.value === 'all' ? null : e.target.value)}
        disabled={loading}
      >
        <option value="all">All Regions</option>
        {regions.map(region => (
          <option key={region} value={region}>
            {getRegionDisplayName(region)}
          </option>
        ))}
      </select>
    </div>
  );
};

export const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <span>{message}</span>
  </div>
);

export const ErrorAlert = ({ message, onDismiss }) => (
  <div className="error-alert">
    <div className="error-content">
      <span className="error-icon">⚠️</span>
      <span className="error-message">{message}</span>
      {onDismiss && (
        <button className="error-dismiss" onClick={onDismiss}>×</button>
      )}
    </div>
  </div>
);

export const StatusBadge = ({ status, type = "default" }) => {
  const getStatusClass = (status, type) => {
    const baseClass = `status-badge status-${type}`;
    
    switch (status?.toLowerCase()) {
      case 'running':
      case 'available':
      case 'active':
        return `${baseClass} status-success`;
      case 'stopped':
      case 'inactive':
        return `${baseClass} status-danger`;
      case 'pending':
      case 'starting':
      case 'stopping':
      case 'creating':
      case 'deleting':
        return `${baseClass} status-warning`;
      default:
        return `${baseClass} status-info`;
    }
  };

  return (
    <span className={getStatusClass(status, type)}>
      {status}
    </span>
  );
};

export const ResourceCard = ({ 
  title, 
  children, 
  actions, 
  status, 
  region, 
  className = "" 
}) => (
  <div className={`resource-card-enhanced ${className}`}>
    <div className="card-header">
      <div className="card-title">
        <h3>{title}</h3>
        {region && <span className="region-tag">{getRegionDisplayName(region)}</span>}
      </div>
      {status && <StatusBadge status={status} />}
    </div>
    <div className="card-content">
      {children}
    </div>
    {actions && (
      <div className="card-actions">
        {actions}
      </div>
    )}
  </div>
);

export const SearchFilter = ({ value, onChange, placeholder = "Search resources..." }) => (
  <div className="search-filter">
    <input
      type="text"
      className="search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
    <span className="search-icon">🔍</span>
  </div>
);

export const StatsCard = ({ icon, title, value, subtitle, color = "blue" }) => (
  <div className={`stats-card stats-${color}`}>
    <div className="stats-icon">{icon}</div>
    <div className="stats-content">
      <div className="stats-value">{value}</div>
      <div className="stats-title">{title}</div>
      {subtitle && <div className="stats-subtitle">{subtitle}</div>}
    </div>
  </div>
);

// Helper function to get human-readable region names
const getRegionDisplayName = (region) => {
  const regionNames = {
    'us-east-1': 'US East (N. Virginia)',
    'us-east-2': 'US East (Ohio)',
    'us-west-1': 'US West (N. California)',
    'us-west-2': 'US West (Oregon)',
    'eu-west-1': 'Europe (Ireland)',
    'eu-west-2': 'Europe (London)',
    'eu-west-3': 'Europe (Paris)',
    'eu-central-1': 'Europe (Frankfurt)',
    'eu-north-1': 'Europe (Stockholm)',
    'ap-south-1': 'Asia Pacific (Mumbai)',
    'ap-northeast-1': 'Asia Pacific (Tokyo)',
    'ap-northeast-2': 'Asia Pacific (Seoul)',
    'ap-southeast-1': 'Asia Pacific (Singapore)',
    'ap-southeast-2': 'Asia Pacific (Sydney)',
    'ca-central-1': 'Canada (Central)',
    'sa-east-1': 'South America (São Paulo)',
    'af-south-1': 'Africa (Cape Town)',
    'me-south-1': 'Middle East (Bahrain)',
    'ap-east-1': 'Asia Pacific (Hong Kong)',
    'eu-south-1': 'Europe (Milan)',
    'ap-northeast-3': 'Asia Pacific (Osaka)'
  };
  
  return regionNames[region] || region;
};
