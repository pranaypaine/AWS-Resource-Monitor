import React, { useState, useEffect } from 'react';
import { s3Service } from '../services/api';
import { toast } from 'react-toastify';
import { 
  LoadingSpinner, 
  ErrorAlert, 
  ResourceCard, 
  SearchFilter 
} from '../components/UIComponents';

const S3Page = () => {
  const [buckets, setBuckets] = useState([]);
  const [filteredBuckets, setFilteredBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [error, setError] = useState(null);
  const [createForm, setCreateForm] = useState({
    bucket_name: '',
    region: 'us-east-1'
  });

  const regions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
    'ap-south-1', 'ap-northeast-1', 'ap-southeast-1', 'ap-southeast-2'
  ];

  useEffect(() => {
    fetchBuckets();
  }, []);

  useEffect(() => {
    filterBuckets();
  }, [buckets, searchTerm, selectedRegion]);

  const fetchBuckets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await s3Service.listBuckets();
      setBuckets(response.data);
    } catch (error) {
      setError('Failed to fetch S3 buckets. Please check your AWS credentials.');
      console.error('S3 fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBuckets = () => {
    let filtered = buckets;

    // Filter by region
    if (selectedRegion) {
      filtered = filtered.filter(bucket => bucket.region === selectedRegion);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bucket =>
        bucket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bucket.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBuckets(filtered);
  };

  const handleCreateBucket = async (e) => {
    e.preventDefault();
    try {
      await s3Service.createBucket(createForm);
      toast.success('S3 bucket created successfully');
      setShowCreateForm(false);
      setCreateForm({
        bucket_name: '',
        region: 'us-east-1'
      });
      fetchBuckets();
    } catch (error) {
      toast.error('Failed to create S3 bucket');
      console.error('S3 create error:', error);
    }
  };

  const handleDeleteBucket = async (bucketName) => {
    if (window.confirm(`Are you sure you want to delete bucket "${bucketName}"? This will delete all objects in the bucket.`)) {
      try {
        await s3Service.deleteBucket(bucketName);
        toast.success('S3 bucket deleted successfully');
        fetchBuckets();
      } catch (error) {
        toast.error('Failed to delete S3 bucket');
        console.error('S3 delete error:', error);
      }
    }
  };

  const getBucketsByRegion = () => {
    return buckets.reduce((acc, bucket) => {
      const region = bucket.region || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});
  };

  if (loading && buckets.length === 0) {
    return <LoadingSpinner message="Loading S3 buckets..." />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🪣 S3 Buckets</h1>
        <p className="page-description">Manage your S3 storage buckets across all regions</p>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '❌ Cancel' : '➕ Create Bucket'}
          </button>
          <button
            className="btn btn-primary"
            onClick={fetchBuckets}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="region-selector">
        <label>Filter by Region:</label>
        <select
          className="region-select"
          value={selectedRegion || 'all'}
          onChange={(e) => setSelectedRegion(e.target.value === 'all' ? null : e.target.value)}
        >
          <option value="all">All Regions</option>
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      <SearchFilter
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search buckets by name or region..."
      />

      {!selectedRegion && buckets.length > 0 && (
        <div className="create-form" style={{ marginBottom: '1.5rem' }}>
          <h3>📊 Buckets by Region</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            textAlign: 'left'
          }}>
            {Object.entries(getBucketsByRegion())
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
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>{count} buckets</div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="create-form">
          <h3>🚀 Create New S3 Bucket</h3>
          <form onSubmit={handleCreateBucket}>
            <div className="form-row">
              <div className="form-group">
                <label>Bucket Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={createForm.bucket_name}
                  onChange={(e) => setCreateForm({...createForm, bucket_name: e.target.value})}
                  placeholder="my-unique-bucket-name"
                  required
                />
                <small>Bucket names must be globally unique and follow S3 naming rules</small>
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
            <button type="submit" className="btn btn-success">
              🚀 Create Bucket
            </button>
          </form>
        </div>
      )}

      {loading && <LoadingSpinner message="Fetching buckets..." />}

      <div className="resource-grid">
        {filteredBuckets.map((bucket) => (
          <ResourceCard
            key={bucket.name}
            title={bucket.name}
            region={!selectedRegion ? bucket.region : null}
            actions={[
              <button
                key="console"
                className="btn btn-primary"
                onClick={() => window.open(`https://s3.console.aws.amazon.com/s3/buckets/${bucket.name}`, '_blank')}
              >
                🌐 View in Console
              </button>,
              <button
                key="delete"
                className="btn btn-danger"
                onClick={() => handleDeleteBucket(bucket.name)}
              >
                🗑️ Delete
              </button>
            ]}
          >
            {!selectedRegion && bucket.region && (
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
                  {bucket.region}
                </span>
              </p>
            )}
            {bucket.creation_date && (
              <p><strong>Created:</strong> {new Date(bucket.creation_date).toLocaleString()}</p>
            )}
          </ResourceCard>
        ))}
      </div>

      {!loading && filteredBuckets.length === 0 && (
        <div className="text-center" style={{ padding: '3rem' }}>
          <h3>No S3 buckets found</h3>
          <p>
            {searchTerm
              ? `No buckets match "${searchTerm}"`
              : selectedRegion
              ? `No buckets in ${selectedRegion}`
              : 'No buckets in any region'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default S3Page;
