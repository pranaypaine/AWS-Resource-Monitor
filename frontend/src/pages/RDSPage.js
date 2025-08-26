import React, { useState, useEffect } from 'react';
import { rdsService } from '../services/api';
import { 
  RegionSelector, 
  LoadingSpinner, 
  ErrorAlert, 
  SuccessAlert,
  SearchFilter,
  Modal,
  FormField,
  Tag,
  EmptyState
} from '../components/UIComponents';

const RDSPage = () => {
  const [instances, setInstances] = useState([]);
  const [filteredInstances, setFilteredInstances] = useState([]);
  const [regions, setRegions] = useState(['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [createForm, setCreateForm] = useState({
    db_instance_identifier: '',
    db_instance_class: 'db.t3.micro',
    engine: 'mysql',
    engine_version: '8.0',
    master_username: 'admin',
    master_user_password: '',
    allocated_storage: 20,
    storage_type: 'gp2',
    region: 'us-east-1',
    multi_az: false,
    publicly_accessible: false,
    backup_retention_period: 7
  });

  useEffect(() => {
    fetchInstances();
  }, [selectedRegion]);

  useEffect(() => {
    filterInstances();
  }, [instances, searchTerm]);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rdsService.listInstances();
      let instanceData = response.data || [];
      
      // Filter by region if not 'all'
      if (selectedRegion !== 'all') {
        instanceData = instanceData.filter(instance => instance.region === selectedRegion);
      }
      
      setInstances(instanceData);
    } catch (err) {
      setError('Failed to fetch RDS instances');
      console.error('RDS fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterInstances = () => {
    let filtered = instances;
    
    if (searchTerm) {
      filtered = instances.filter(instance =>
        instance.db_instance_identifier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.engine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.db_instance_class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.db_instance_status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredInstances(filtered);
  };

  const handleCreateInstance = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(prev => ({ ...prev, create: true }));
      setError(null);
      
      const response = await rdsService.createInstance(createForm);
      setSuccess(`RDS instance "${createForm.db_instance_identifier}" creation initiated!`);
      setShowCreateForm(false);
      setCreateForm({
        db_instance_identifier: '',
        db_instance_class: 'db.t3.micro',
        engine: 'mysql',
        engine_version: '8.0',
        master_username: 'admin',
        master_user_password: '',
        allocated_storage: 20,
        storage_type: 'gp2',
        region: 'us-east-1',
        multi_az: false,
        publicly_accessible: false,
        backup_retention_period: 7
      });
      
      // Refresh instances list
      setTimeout(() => fetchInstances(), 2000);
    } catch (err) {
      setError('Failed to create RDS instance');
      console.error('Create instance error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, create: false }));
    }
  };

  const handleInstanceAction = async (instanceId, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [instanceId]: true }));
      setError(null);
      
      if (action === 'start') {
        await rdsService.startInstance(instanceId);
        setSuccess(`RDS instance ${instanceId} start initiated`);
      } else if (action === 'stop') {
        await rdsService.stopInstance(instanceId);
        setSuccess(`RDS instance ${instanceId} stop initiated`);
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this database instance? This action cannot be undone.')) {
          await rdsService.deleteInstance(instanceId);
          setSuccess(`RDS instance ${instanceId} deletion initiated`);
        } else {
          return;
        }
      }
      
      // Refresh instances list
      setTimeout(() => fetchInstances(), 2000);
    } catch (err) {
      setError(`Failed to ${action} RDS instance ${instanceId}`);
      console.error(`${action} instance error:`, err);
    } finally {
      setActionLoading(prev => ({ ...prev, [instanceId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'success';
      case 'stopped': return 'error';
      case 'creating': return 'warning';
      case 'starting': return 'warning';
      case 'stopping': return 'warning';
      case 'deleting': return 'error';
      default: return 'default';
    }
  };

  const getInstanceStats = () => {
    const total = instances.length;
    const available = instances.filter(i => i.db_instance_status === 'available').length;
    const stopped = instances.filter(i => i.db_instance_status === 'stopped').length;
    const creating = instances.filter(i => i.db_instance_status === 'creating').length;
    
    return { total, available, stopped, creating };
  };

  const formatStorage = (storage) => {
    return `${storage} GB`;
  };

  const stats = getInstanceStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-60vh">
        <div className="glass-card text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4 text-lg">Loading RDS instances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="title">🗄️ RDS Databases</h1>
        <p className="subtitle">Manage your relational databases in the cloud</p>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Total</h3>
          <div className="text-4xl font-bold text-white mb-3 text-shadow">{stats.total}</div>
        </div>
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Available</h3>
          <div className="text-4xl font-bold text-green-400 mb-3 text-shadow">{stats.available}</div>
        </div>
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">⏸️</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Stopped</h3>
          <div className="text-4xl font-bold text-red-400 mb-3 text-shadow">{stats.stopped}</div>
        </div>
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">⚙️</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Creating</h3>
          <div className="text-4xl font-bold text-yellow-400 mb-3 text-shadow">{stats.creating}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card mb-8">
        <div className="controls-row">
          <div className="controls-inputs">
            <RegionSelector
              value={selectedRegion}
              onChange={setSelectedRegion}
              regions={['all', ...regions]}
              className="flex-1"
            />
            <SearchFilter
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search databases..."
              className="flex-1"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary whitespace-nowrap"
          >
            🗄️ Create Database
          </button>
        </div>
      </div>

      {/* Instances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstances.length > 0 ? (
          filteredInstances.map((instance) => (
            <div key={instance.db_instance_identifier} className="glass-card-small">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white text-shadow truncate" title={instance.db_instance_identifier}>
                  {instance.db_instance_identifier}
                </h3>
                <Tag variant={getStatusColor(instance.db_instance_status)}>
                  {instance.db_instance_status}
                </Tag>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Engine:</span>
                  <span className="font-medium text-white">
                    {instance.engine} {instance.engine_version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Class:</span>
                  <span className="font-medium text-white">{instance.db_instance_class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Storage:</span>
                  <span className="font-medium text-white">
                    {formatStorage(instance.allocated_storage)} ({instance.storage_type})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Region:</span>
                  <span className="font-medium text-white">{instance.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Multi-AZ:</span>
                  <span className={`font-medium ${instance.multi_az ? 'text-green-400' : 'text-gray-400'}`}>
                    {instance.multi_az ? 'Yes' : 'No'}
                  </span>
                </div>
                {instance.endpoint && (
                  <div className="flex justify-between">
                    <span className="text-white opacity-80">Endpoint:</span>
                    <span className="font-medium text-white text-xs truncate" title={instance.endpoint}>
                      {instance.endpoint}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {instance.db_instance_status === 'stopped' && (
                  <button
                    onClick={() => handleInstanceAction(instance.db_instance_identifier, 'start')}
                    disabled={actionLoading[instance.db_instance_identifier]}
                    className="btn btn-success flex-1 text-sm"
                  >
                    {actionLoading[instance.db_instance_identifier] ? <LoadingSpinner size="sm" /> : '▶️ Start'}
                  </button>
                )}
                {instance.db_instance_status === 'available' && (
                  <button
                    onClick={() => handleInstanceAction(instance.db_instance_identifier, 'stop')}
                    disabled={actionLoading[instance.db_instance_identifier]}
                    className="btn btn-secondary flex-1 text-sm"
                  >
                    {actionLoading[instance.db_instance_identifier] ? <LoadingSpinner size="sm" /> : '⏸️ Stop'}
                  </button>
                )}
                <button
                  onClick={() => handleInstanceAction(instance.db_instance_identifier, 'delete')}
                  disabled={actionLoading[instance.db_instance_identifier]}
                  className="btn btn-danger text-sm"
                >
                  {actionLoading[instance.db_instance_identifier] ? <LoadingSpinner size="sm" /> : '🗑️'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="No RDS Databases Found"
              description={searchTerm ? 
                `No databases match your search "${searchTerm}". Try adjusting your search terms.` :
                "You don't have any RDS databases yet. Create your first database to get started!"
              }
              icon="🗄️"
              action={
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary"
                >
                  🗄️ Create Your First Database
                </button>
              }
            />
          </div>
        )}
      </div>

      {/* Create Database Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="🗄️ Create New RDS Database"
      >
        <form onSubmit={handleCreateInstance} className="space-y-6">
          <FormField label="Database Instance Identifier">
            <input
              type="text"
              className="input"
              placeholder="my-database-instance"
              value={createForm.db_instance_identifier}
              onChange={(e) => setCreateForm(prev => ({ ...prev, db_instance_identifier: e.target.value }))}
              required
              pattern="[a-zA-Z0-9-]+"
              title="Only letters, numbers, and hyphens allowed"
            />
          </FormField>

          <FormField label="Database Engine">
            <select
              className="select"
              value={createForm.engine}
              onChange={(e) => setCreateForm(prev => ({ ...prev, engine: e.target.value }))}
            >
              <option value="mysql">MySQL</option>
              <option value="postgres">PostgreSQL</option>
              <option value="mariadb">MariaDB</option>
              <option value="oracle-ee">Oracle</option>
              <option value="sqlserver-ex">SQL Server</option>
            </select>
          </FormField>

          <FormField label="Instance Class">
            <select
              className="select"
              value={createForm.db_instance_class}
              onChange={(e) => setCreateForm(prev => ({ ...prev, db_instance_class: e.target.value }))}
            >
              <option value="db.t3.micro">db.t3.micro (1 vCPU, 1 GB RAM)</option>
              <option value="db.t3.small">db.t3.small (2 vCPU, 2 GB RAM)</option>
              <option value="db.t3.medium">db.t3.medium (2 vCPU, 4 GB RAM)</option>
              <option value="db.r5.large">db.r5.large (2 vCPU, 16 GB RAM)</option>
              <option value="db.r5.xlarge">db.r5.xlarge (4 vCPU, 32 GB RAM)</option>
            </select>
          </FormField>

          <FormField label="Master Username">
            <input
              type="text"
              className="input"
              placeholder="admin"
              value={createForm.master_username}
              onChange={(e) => setCreateForm(prev => ({ ...prev, master_username: e.target.value }))}
              required
            />
          </FormField>

          <FormField label="Master Password">
            <input
              type="password"
              className="input"
              placeholder="Enter a strong password"
              value={createForm.master_user_password}
              onChange={(e) => setCreateForm(prev => ({ ...prev, master_user_password: e.target.value }))}
              required
              minLength="8"
            />
            <p className="text-white opacity-70 text-sm mt-1">
              Password must be at least 8 characters long
            </p>
          </FormField>

          <FormField label="Allocated Storage (GB)">
            <input
              type="number"
              className="input"
              min="20"
              max="1000"
              value={createForm.allocated_storage}
              onChange={(e) => setCreateForm(prev => ({ ...prev, allocated_storage: parseInt(e.target.value) }))}
              required
            />
          </FormField>

          <FormField label="Region">
            <select
              className="select"
              value={createForm.region}
              onChange={(e) => setCreateForm(prev => ({ ...prev, region: e.target.value }))}
            >
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Advanced Settings">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={createForm.multi_az}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, multi_az: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white">Multi-AZ deployment (for high availability)</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={createForm.publicly_accessible}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, publicly_accessible: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500 focus:ring-2"
                />
                <span className="text-white">Publicly accessible (⚠️ use with caution)</span>
              </label>
            </div>
          </FormField>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading.create}
              className="btn btn-primary flex-1"
            >
              {actionLoading.create ? <LoadingSpinner size="sm" /> : '🗄️ Create Database'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RDSPage;
