import React, { useState, useEffect } from 'react';
import { rdsService } from '../services/api';
import { toast } from 'react-toastify';

const RDSPage = () => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    db_instance_identifier: '',
    db_instance_class: 'db.t3.micro',
    engine: 'mysql',
    master_username: '',
    master_password: '',
    allocated_storage: 20
  });

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const response = await rdsService.listInstances();
      setInstances(response.data);
    } catch (error) {
      toast.error('Failed to fetch RDS instances');
      console.error('RDS fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const handleCreateInstance = async (e) => {
    e.preventDefault();
    try {
      await rdsService.createInstance(createForm);
      toast.success('RDS instance creation initiated');
      setShowCreateForm(false);
      setCreateForm({
        db_instance_identifier: '',
        db_instance_class: 'db.t3.micro',
        engine: 'mysql',
        master_username: '',
        master_password: '',
        allocated_storage: 20
      });
      fetchInstances();
    } catch (error) {
      toast.error('Failed to create RDS instance');
      console.error('RDS create error:', error);
    }
  };

  const handleInstanceAction = async (dbInstanceId, action) => {
    try {
      switch (action) {
        case 'start':
          await rdsService.startInstance(dbInstanceId);
          toast.success('RDS instance start initiated');
          break;
        case 'stop':
          await rdsService.stopInstance(dbInstanceId);
          toast.success('RDS instance stop initiated');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this RDS instance?')) {
            await rdsService.deleteInstance(dbInstanceId);
            toast.success('RDS instance deletion initiated');
          }
          break;
        default:
          break;
      }
      fetchInstances();
    } catch (error) {
      toast.error(`Failed to ${action} RDS instance`);
      console.error(`RDS ${action} error:`, error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'stopped':
        return 'status-stopped';
      case 'creating':
      case 'starting':
      case 'stopping':
      case 'deleting':
        return 'status-pending';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading RDS instances...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">RDS Instances</h1>
        <p className="page-description">Manage your RDS database instances</p>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Instance'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form">
          <h3>Create New RDS Instance</h3>
          <form onSubmit={handleCreateInstance}>
            <div className="form-row">
              <div className="form-group">
                <label>DB Instance Identifier</label>
                <input
                  type="text"
                  className="form-control"
                  value={createForm.db_instance_identifier}
                  onChange={(e) => setCreateForm({...createForm, db_instance_identifier: e.target.value})}
                  placeholder="my-database"
                  required
                />
              </div>
              <div className="form-group">
                <label>Instance Class</label>
                <select
                  className="form-control"
                  value={createForm.db_instance_class}
                  onChange={(e) => setCreateForm({...createForm, db_instance_class: e.target.value})}
                >
                  <option value="db.t3.micro">db.t3.micro</option>
                  <option value="db.t3.small">db.t3.small</option>
                  <option value="db.t3.medium">db.t3.medium</option>
                  <option value="db.r5.large">db.r5.large</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Engine</label>
                <select
                  className="form-control"
                  value={createForm.engine}
                  onChange={(e) => setCreateForm({...createForm, engine: e.target.value})}
                >
                  <option value="mysql">MySQL</option>
                  <option value="postgres">PostgreSQL</option>
                  <option value="mariadb">MariaDB</option>
                </select>
              </div>
              <div className="form-group">
                <label>Allocated Storage (GB)</label>
                <input
                  type="number"
                  className="form-control"
                  value={createForm.allocated_storage}
                  onChange={(e) => setCreateForm({...createForm, allocated_storage: parseInt(e.target.value)})}
                  min="20"
                  max="1000"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Master Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={createForm.master_username}
                  onChange={(e) => setCreateForm({...createForm, master_username: e.target.value})}
                  placeholder="admin"
                  required
                />
              </div>
              <div className="form-group">
                <label>Master Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={createForm.master_password}
                  onChange={(e) => setCreateForm({...createForm, master_password: e.target.value})}
                  placeholder="password"
                  required
                  minLength="8"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success">
              Create Instance
            </button>
          </form>
        </div>
      )}

      <div className="resource-grid">
        {instances.map((instance) => (
          <div key={instance.db_instance_identifier} className="resource-card">
            <h3>{instance.db_instance_identifier}</h3>
            <p><strong>Engine:</strong> {instance.engine}</p>
            <p><strong>Class:</strong> {instance.db_instance_class}</p>
            <p><strong>Status:</strong> 
              <span className={`resource-status ${getStatusClass(instance.status)}`}>
                {instance.status}
              </span>
            </p>
            {instance.endpoint && (
              <p><strong>Endpoint:</strong> {instance.endpoint}</p>
            )}
            {instance.port && (
              <p><strong>Port:</strong> {instance.port}</p>
            )}
            {instance.allocated_storage && (
              <p><strong>Storage:</strong> {instance.allocated_storage} GB</p>
            )}
            
            <div className="resource-actions">
              {instance.status === 'stopped' && (
                <button
                  className="btn btn-success"
                  onClick={() => handleInstanceAction(instance.db_instance_identifier, 'start')}
                >
                  Start
                </button>
              )}
              {instance.status === 'available' && (
                <button
                  className="btn btn-warning"
                  onClick={() => handleInstanceAction(instance.db_instance_identifier, 'stop')}
                >
                  Stop
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={() => handleInstanceAction(instance.db_instance_identifier, 'delete')}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {instances.length === 0 && (
        <div className="loading">No RDS instances found</div>
      )}
    </div>
  );
};

export default RDSPage;
