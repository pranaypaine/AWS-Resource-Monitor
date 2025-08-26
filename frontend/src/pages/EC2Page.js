import React, { useState, useEffect } from 'react';
import { ec2Service } from '../services/api';
import { toast } from 'react-toastify';
import { 
  RegionSelector, 
  LoadingSpinner, 
  ErrorAlert, 
  ResourceCard, 
  SearchFilter,
  StatusBadge
} from '../components/UIComponents';

const EC2Page = () => {
  const [instances, setInstances] = useState([]);
  const [filteredInstances, setFilteredInstances] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [createForm, setCreateForm] = useState({
    instance_type: 't2.micro',
    ami_id: 'ami-0c02fb55956c7d316',
    key_name: '',
    security_groups: [],
    tags: {},
    region: 'us-east-1'
  });

  useEffect(() => {
    fetchRegions();
    fetchInstances();
  }, [selectedRegion]);

  useEffect(() => {
    filterInstances();
  }, [instances, searchTerm]);

  const fetchRegions = async () => {
    try {
      const response = await ec2Service.getRegions();
      setRegions(response.data);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
    }
  };

  const fetchInstances = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ec2Service.listInstances(selectedRegion);
      setInstances(response.data);
    } catch (error) {
      setError('Failed to fetch EC2 instances. Please check your AWS credentials.');
      console.error('EC2 fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInstances = () => {
    if (!searchTerm) {
      setFilteredInstances(instances);
      return;
    }

    const filtered = instances.filter(instance =>
      instance.instance_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.instance_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instance.tags && Object.values(instance.tags).some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
    setFilteredInstances(filtered);
  };

  const handleCreateInstance = async (e) => {
    e.preventDefault();
    try {
      await ec2Service.createInstance(createForm);
      toast.success('EC2 instance creation initiated');
      setShowCreateForm(false);
      setCreateForm({
        instance_type: 't2.micro',
        ami_id: 'ami-0c02fb55956c7d316',
        key_name: '',
        security_groups: [],
        tags: {},
        region: 'us-east-1'
      });
      fetchInstances();
    } catch (error) {
      toast.error('Failed to create EC2 instance');
      console.error('EC2 create error:', error);
    }
  };

  const handleInstanceAction = async (instance, action) => {
    try {
      switch (action) {
        case 'start':
          await ec2Service.startInstance(instance.instance_id, instance.region);
          toast.success('Instance start initiated');
          break;
        case 'stop':
          await ec2Service.stopInstance(instance.instance_id, instance.region);
          toast.success('Instance stop initiated');
          break;
        case 'terminate':
          if (window.confirm('Are you sure you want to terminate this instance?')) {
            await ec2Service.terminateInstance(instance.instance_id, instance.region);
            toast.success('Instance termination initiated');
          }
          break;
        default:
          break;
      }
      fetchInstances();
    } catch (error) {
      toast.error(`Failed to ${action} instance`);
      console.error(`EC2 ${action} error:`, error);
    }
  };

  const getInstanceActions = (instance) => {
    const actions = [];
    
    if (instance.state === 'stopped') {
      actions.push(
        <button
          key="start"
          className="btn btn-success"
          onClick={() => handleInstanceAction(instance, 'start')}
        >
          ▶️ Start
        </button>
      );
    }
    
    if (instance.state === 'running') {
      actions.push(
        <button
          key="stop"
          className="btn btn-warning"
          onClick={() => handleInstanceAction(instance, 'stop')}
        >
          ⏹️ Stop
        </button>
      );
    }
    
    actions.push(
      <button
        key="terminate"
        className="btn btn-danger"
        onClick={() => handleInstanceAction(instance, 'terminate')}
      >
        🗑️ Terminate
      </button>
    );
    
    return actions;
  };

  if (loading && instances.length === 0) {
    return <LoadingSpinner message="Loading EC2 instances..." />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🖥️ EC2 Instances</h1>
        <p className="page-description">Manage your EC2 virtual machines across all regions</p>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '❌ Cancel' : '➕ Create Instance'}
          </button>
          <button
            className="btn btn-primary"
            onClick={fetchInstances}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <RegionSelector
        regions={regions}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        loading={loading}
      />

      <SearchFilter
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search instances by ID, type, state, or tags..."
      />

      {!selectedRegion && instances.length > 0 && (
        <div className="create-form" style={{ marginBottom: '1.5rem' }}>
          <h3>📊 Instances by Region</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            textAlign: 'left'
          }}>
            {Object.entries(
              instances.reduce((acc, instance) => {
                const region = instance.region || 'Unknown';
                acc[region] = (acc[region] || 0) + 1;
                return acc;
              }, {})
            )
              .sort(([,a], [,b]) => b - a)
              .map(([region, count]) => (
                <div 
                  key={region}
                  style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '6px',
                    border: '1px solid #e1e5e9',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setSelectedRegion(region)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#232f3e' }}>{region}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>{count} instances</div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="create-form">
          <h3>🚀 Create New EC2 Instance</h3>
          <form onSubmit={handleCreateInstance}>
            <div className="form-row">
              <div className="form-group">
                <label>Instance Type</label>
                <select
                  className="form-control"
                  value={createForm.instance_type}
                  onChange={(e) => setCreateForm({...createForm, instance_type: e.target.value})}
                >
                  <option value="t2.micro">t2.micro (1 vCPU, 1 GB RAM)</option>
                  <option value="t2.small">t2.small (1 vCPU, 2 GB RAM)</option>
                  <option value="t2.medium">t2.medium (2 vCPU, 4 GB RAM)</option>
                  <option value="t3.micro">t3.micro (2 vCPU, 1 GB RAM)</option>
                  <option value="t3.small">t3.small (2 vCPU, 2 GB RAM)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Region</label>
                <select
                  className="form-control"
                  value={createForm.region}
                  onChange={(e) => setCreateForm({...createForm, region: e.target.value})}
                >
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>AMI ID</label>
              <input
                type="text"
                className="form-control"
                value={createForm.ami_id}
                onChange={(e) => setCreateForm({...createForm, ami_id: e.target.value})}
                placeholder="ami-0c02fb55956c7d316"
              />
              <small>Default: Amazon Linux 2</small>
            </div>
            <div className="form-group">
              <label>Key Pair Name (Optional)</label>
              <input
                type="text"
                className="form-control"
                value={createForm.key_name}
                onChange={(e) => setCreateForm({...createForm, key_name: e.target.value})}
                placeholder="my-key-pair"
              />
            </div>
            <button type="submit" className="btn btn-success">
              🚀 Create Instance
            </button>
          </form>
        </div>
      )}

      {loading && <LoadingSpinner message="Fetching instances..." />}

      <div className="resource-grid">
        {filteredInstances.map((instance) => (
          <ResourceCard
            key={instance.instance_id}
            title={instance.instance_id}
            status={instance.state}
            region={selectedRegion ? null : instance.region} // Only show region tag when viewing all regions
            actions={getInstanceActions(instance)}
          >
            <p><strong>Type:</strong> {instance.instance_type}</p>
            {!selectedRegion && instance.region && (
              <p><strong>Region:</strong> 
                <span className="region-badge" style={{
                  background: '#e3f2fd',
                  color: '#1976d2',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  marginLeft: '0.5rem'
                }}>
                  {instance.region}
                </span>
              </p>
            )}
            {instance.public_ip && (
              <p><strong>Public IP:</strong> {instance.public_ip}</p>
            )}
            {instance.private_ip && (
              <p><strong>Private IP:</strong> {instance.private_ip}</p>
            )}
            {instance.launch_time && (
              <p><strong>Launch Time:</strong> {new Date(instance.launch_time).toLocaleString()}</p>
            )}
            {instance.tags && Object.keys(instance.tags).length > 0 && (
              <div>
                <strong>Tags:</strong>
                <div style={{ marginTop: '0.5rem' }}>
                  {Object.entries(instance.tags).map(([key, value]) => (
                    <span
                      key={key}
                      style={{
                        display: 'inline-block',
                        background: '#e9ecef',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        margin: '0.25rem 0.25rem 0 0'
                      }}
                    >
                      {key}: {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </ResourceCard>
        ))}
      </div>

      {!loading && filteredInstances.length === 0 && (
        <div className="text-center" style={{ padding: '3rem' }}>
          <h3>No EC2 instances found</h3>
          <p>
            {searchTerm
              ? `No instances match "${searchTerm}"`
              : selectedRegion
              ? `No instances in ${selectedRegion}`
              : 'No instances in any region'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default EC2Page;
