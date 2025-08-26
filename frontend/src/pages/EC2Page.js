import React, { useState, useEffect } from 'react';
import { ec2Service } from '../services/api';
import { 
  RegionSelector, 
  LoadingSpinner, 
  ErrorAlert, 
  SuccessAlert,
  ResourceCard, 
  SearchFilter,
  Modal,
  FormField,
  Tag,
  EmptyState
} from '../components/UIComponents';

const EC2Page = () => {
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
    instance_type: 't3.micro',
    ami_id: 'ami-0c02fb55956c7d316',
    key_name: '',
    security_groups: ['default'],
    tags: { Name: '', Environment: 'development' },
    region: 'us-east-1'
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
      const response = await ec2Service.listInstances();
      let instanceData = response.data || [];
      
      // Filter by region if not 'all'
      if (selectedRegion !== 'all') {
        instanceData = instanceData.filter(instance => instance.region === selectedRegion);
      }
      
      setInstances(instanceData);
    } catch (err) {
      setError('Failed to fetch EC2 instances');
      console.error('EC2 fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterInstances = () => {
    let filtered = instances;
    
    if (searchTerm) {
      filtered = instances.filter(instance =>
        instance.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.instance_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.instance_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredInstances(filtered);
  };

  const handleCreateInstance = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(prev => ({ ...prev, create: true }));
      setError(null);
      
      const response = await ec2Service.createInstance(createForm);
      setSuccess('EC2 instance creation initiated successfully!');
      setShowCreateForm(false);
      setCreateForm({
        instance_type: 't3.micro',
        ami_id: 'ami-0c02fb55956c7d316',
        key_name: '',
        security_groups: ['default'],
        tags: { Name: '', Environment: 'development' },
        region: 'us-east-1'
      });
      
      // Refresh instances list
      setTimeout(() => fetchInstances(), 2000);
    } catch (err) {
      setError('Failed to create EC2 instance');
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
        await ec2Service.startInstance(instanceId);
        setSuccess(`Instance ${instanceId} start initiated`);
      } else if (action === 'stop') {
        await ec2Service.stopInstance(instanceId);
        setSuccess(`Instance ${instanceId} stop initiated`);
      } else if (action === 'terminate') {
        if (window.confirm('Are you sure you want to terminate this instance? This action cannot be undone.')) {
          await ec2Service.terminateInstance(instanceId);
          setSuccess(`Instance ${instanceId} termination initiated`);
        } else {
          return;
        }
      }
      
      // Refresh instances list
      setTimeout(() => fetchInstances(), 2000);
    } catch (err) {
      setError(`Failed to ${action} instance ${instanceId}`);
      console.error(`${action} instance error:`, err);
    } finally {
      setActionLoading(prev => ({ ...prev, [instanceId]: false }));
    }
  };

  const getStatusColor = (state) => {
    switch (state?.toLowerCase()) {
      case 'running': return 'success';
      case 'stopped': return 'error';
      case 'pending': return 'warning';
      case 'stopping': return 'warning';
      case 'terminated': return 'error';
      default: return 'default';
    }
  };

  const getInstanceStats = () => {
    const total = instances.length;
    const running = instances.filter(i => i.state === 'running').length;
    const stopped = instances.filter(i => i.state === 'stopped').length;
    const pending = instances.filter(i => i.state === 'pending').length;
    
    return { total, running, stopped, pending };
  };

  const stats = getInstanceStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-60vh">
        <div className="glass-card text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4 text-lg">Loading EC2 instances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="title">🖥️ EC2 Instances</h1>
        <p className="subtitle">Manage your virtual machines in the cloud</p>
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
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Running</h3>
          <div className="text-4xl font-bold text-green-400 mb-3 text-shadow">{stats.running}</div>
        </div>
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">⏸️</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Stopped</h3>
          <div className="text-4xl font-bold text-red-400 mb-3 text-shadow">{stats.stopped}</div>
        </div>
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">⏳</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Pending</h3>
          <div className="text-4xl font-bold text-yellow-400 mb-3 text-shadow">{stats.pending}</div>
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
              placeholder="Search instances..."
              className="flex-1"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary whitespace-nowrap"
          >
            🚀 Launch Instance
          </button>
        </div>
      </div>

      {/* Instances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstances.length > 0 ? (
          filteredInstances.map((instance) => (
            <div key={instance.instance_id} className="glass-card-small">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white text-shadow">
                  {instance.name || instance.instance_id}
                </h3>
                <Tag variant={getStatusColor(instance.state)}>
                  {instance.state}
                </Tag>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Instance Type:</span>
                  <span className="font-medium text-white">{instance.instance_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Region:</span>
                  <span className="font-medium text-white">{instance.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Launch Time:</span>
                  <span className="font-medium text-white text-sm">
                    {instance.launch_time ? new Date(instance.launch_time).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {instance.public_ip && (
                  <div className="flex justify-between">
                    <span className="text-white opacity-80">Public IP:</span>
                    <span className="font-medium text-white font-mono text-sm">{instance.public_ip}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {instance.state === 'stopped' && (
                  <button
                    onClick={() => handleInstanceAction(instance.instance_id, 'start')}
                    disabled={actionLoading[instance.instance_id]}
                    className="btn btn-success flex-1 text-sm"
                  >
                    {actionLoading[instance.instance_id] ? <LoadingSpinner size="sm" /> : '▶️ Start'}
                  </button>
                )}
                {instance.state === 'running' && (
                  <button
                    onClick={() => handleInstanceAction(instance.instance_id, 'stop')}
                    disabled={actionLoading[instance.instance_id]}
                    className="btn btn-secondary flex-1 text-sm"
                  >
                    {actionLoading[instance.instance_id] ? <LoadingSpinner size="sm" /> : '⏸️ Stop'}
                  </button>
                )}
                <button
                  onClick={() => handleInstanceAction(instance.instance_id, 'terminate')}
                  disabled={actionLoading[instance.instance_id]}
                  className="btn btn-danger flex-1 text-sm"
                >
                  {actionLoading[instance.instance_id] ? <LoadingSpinner size="sm" /> : '🗑️ Terminate'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="No EC2 Instances Found"
              description={searchTerm ? 
                `No instances match your search "${searchTerm}". Try adjusting your search terms.` :
                "You don't have any EC2 instances yet. Launch your first instance to get started!"
              }
              icon="🖥️"
              action={
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary"
                >
                  🚀 Launch Your First Instance
                </button>
              }
            />
          </div>
        )}
      </div>

      {/* Create Instance Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="🚀 Launch New EC2 Instance"
      >
        <form onSubmit={handleCreateInstance} className="space-y-6">
          <FormField label="Instance Name">
            <input
              type="text"
              className="input"
              placeholder="Enter instance name"
              value={createForm.tags.Name}
              onChange={(e) => setCreateForm(prev => ({
                ...prev,
                tags: { ...prev.tags, Name: e.target.value }
              }))}
              required
            />
          </FormField>

          <FormField label="Instance Type">
            <select
              className="select"
              value={createForm.instance_type}
              onChange={(e) => setCreateForm(prev => ({ ...prev, instance_type: e.target.value }))}
            >
              <option value="t3.nano">t3.nano (0.5 GB RAM)</option>
              <option value="t3.micro">t3.micro (1 GB RAM)</option>
              <option value="t3.small">t3.small (2 GB RAM)</option>
              <option value="t3.medium">t3.medium (4 GB RAM)</option>
              <option value="t3.large">t3.large (8 GB RAM)</option>
            </select>
          </FormField>

          <FormField label="AMI ID">
            <input
              type="text"
              className="input"
              placeholder="ami-0c02fb55956c7d316"
              value={createForm.ami_id}
              onChange={(e) => setCreateForm(prev => ({ ...prev, ami_id: e.target.value }))}
              required
            />
          </FormField>

          <FormField label="Key Pair Name">
            <input
              type="text"
              className="input"
              placeholder="Enter your key pair name"
              value={createForm.key_name}
              onChange={(e) => setCreateForm(prev => ({ ...prev, key_name: e.target.value }))}
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

          <FormField label="Environment">
            <select
              className="select"
              value={createForm.tags.Environment}
              onChange={(e) => setCreateForm(prev => ({
                ...prev,
                tags: { ...prev.tags, Environment: e.target.value }
              }))}
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
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
              {actionLoading.create ? <LoadingSpinner size="sm" /> : '🚀 Launch Instance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EC2Page;
