import React, { useState, useEffect } from 'react';
import { s3Service } from '../services/api';
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

const S3Page = () => {
  const [buckets, setBuckets] = useState([]);
  const [filteredBuckets, setFilteredBuckets] = useState([]);
  const [regions, setRegions] = useState(['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [createForm, setCreateForm] = useState({
    bucket_name: '',
    region: 'us-east-1',
    public_access: false,
    versioning: false,
    encryption: true
  });

  useEffect(() => {
    fetchBuckets();
  }, [selectedRegion]);

  useEffect(() => {
    filterBuckets();
  }, [buckets, searchTerm]);

  const fetchBuckets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await s3Service.listBuckets();
      let bucketData = response.data || [];
      
      // Filter by region if not 'all'
      if (selectedRegion !== 'all') {
        bucketData = bucketData.filter(bucket => bucket.region === selectedRegion);
      }
      
      setBuckets(bucketData);
    } catch (err) {
      setError('Failed to fetch S3 buckets');
      console.error('S3 fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterBuckets = () => {
    let filtered = buckets;
    
    if (searchTerm) {
      filtered = buckets.filter(bucket =>
        bucket.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bucket.region?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredBuckets(filtered);
  };

  const handleCreateBucket = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(prev => ({ ...prev, create: true }));
      setError(null);
      
      const response = await s3Service.createBucket(createForm);
      setSuccess(`S3 bucket "${createForm.bucket_name}" created successfully!`);
      setShowCreateForm(false);
      setCreateForm({
        bucket_name: '',
        region: 'us-east-1',
        public_access: false,
        versioning: false,
        encryption: true
      });
      
      // Refresh buckets list
      setTimeout(() => fetchBuckets(), 2000);
    } catch (err) {
      setError('Failed to create S3 bucket');
      console.error('Create bucket error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, create: false }));
    }
  };

  const handleDeleteBucket = async (bucketName) => {
    if (!window.confirm(`Are you sure you want to delete bucket "${bucketName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [bucketName]: true }));
      setError(null);
      
      await s3Service.deleteBucket(bucketName);
      setSuccess(`Bucket "${bucketName}" deletion initiated`);
      
      // Refresh buckets list
      setTimeout(() => fetchBuckets(), 2000);
    } catch (err) {
      setError(`Failed to delete bucket "${bucketName}"`);
      console.error('Delete bucket error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [bucketName]: false }));
    }
  };

  const getBucketStats = () => {
    const total = buckets.length;
    const public_buckets = buckets.filter(b => b.public_access).length;
    const encrypted = buckets.filter(b => b.encryption_enabled).length;
    const versioned = buckets.filter(b => b.versioning_enabled).length;
    
    return { total, public_buckets, encrypted, versioned };
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const stats = getBucketStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-60vh">
        <div className="glass-card text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4 text-lg">Loading S3 buckets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="title">🪣 S3 Buckets</h1>
        <p className="subtitle">Store and manage your files in the cloud</p>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Total Buckets</h3>
          <div className="text-4xl font-bold text-white mb-3 text-shadow">{stats.total}</div>
        </div>
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Encrypted</h3>
          <div className="text-4xl font-bold text-green-400 mb-3 text-shadow">{stats.encrypted}</div>
        </div>
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Versioned</h3>
          <div className="text-4xl font-bold text-blue-400 mb-3 text-shadow">{stats.versioned}</div>
        </div>
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">🌐</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Public</h3>
          <div className="text-4xl font-bold text-yellow-400 mb-3 text-shadow">{stats.public_buckets}</div>
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
              placeholder="Search buckets..."
              className="flex-1"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary whitespace-nowrap"
          >
            🪣 Create Bucket
          </button>
        </div>
      </div>

      {/* Buckets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuckets.length > 0 ? (
          filteredBuckets.map((bucket) => (
            <div key={bucket.name} className="glass-card-small">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white text-shadow truncate" title={bucket.name}>
                  {bucket.name}
                </h3>
                <div className="flex gap-2">
                  {bucket.public_access && (
                    <Tag variant="warning">Public</Tag>
                  )}
                  {bucket.encryption_enabled && (
                    <Tag variant="success">🔒</Tag>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Region:</span>
                  <span className="font-medium text-white">{bucket.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Created:</span>
                  <span className="font-medium text-white text-sm">
                    {bucket.creation_date ? new Date(bucket.creation_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Objects:</span>
                  <span className="font-medium text-white">{bucket.object_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Size:</span>
                  <span className="font-medium text-white">{formatSize(bucket.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Versioning:</span>
                  <span className={`font-medium ${bucket.versioning_enabled ? 'text-green-400' : 'text-gray-400'}`}>
                    {bucket.versioning_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.open(`https://s3.console.aws.amazon.com/s3/buckets/${bucket.name}`, '_blank')}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  🔗 Open Console
                </button>
                <button
                  onClick={() => handleDeleteBucket(bucket.name)}
                  disabled={actionLoading[bucket.name]}
                  className="btn btn-danger text-sm"
                >
                  {actionLoading[bucket.name] ? <LoadingSpinner size="sm" /> : '🗑️'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="No S3 Buckets Found"
              description={searchTerm ? 
                `No buckets match your search "${searchTerm}". Try adjusting your search terms.` :
                "You don't have any S3 buckets yet. Create your first bucket to start storing files!"
              }
              icon="🪣"
              action={
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary"
                >
                  🪣 Create Your First Bucket
                </button>
              }
            />
          </div>
        )}
      </div>

      {/* Create Bucket Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="🪣 Create New S3 Bucket"
      >
        <form onSubmit={handleCreateBucket} className="space-y-6">
          <FormField label="Bucket Name">
            <input
              type="text"
              className="input"
              placeholder="my-unique-bucket-name"
              value={createForm.bucket_name}
              onChange={(e) => setCreateForm(prev => ({ ...prev, bucket_name: e.target.value.toLowerCase() }))}
              required
              pattern="[a-z0-9.-]+"
              title="Bucket names must be lowercase and contain only letters, numbers, dots, and hyphens"
            />
            <p className="text-white opacity-70 text-sm mt-1">
              Bucket names must be globally unique and follow AWS naming rules
            </p>
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

          <FormField label="Security Settings">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={createForm.encryption}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, encryption: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white">Enable server-side encryption (recommended)</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={createForm.versioning}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, versioning: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white">Enable versioning</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={createForm.public_access}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, public_access: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500 focus:ring-2"
                />
                <span className="text-white">Allow public access (⚠️ use with caution)</span>
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
              {actionLoading.create ? <LoadingSpinner size="sm" /> : '🪣 Create Bucket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default S3Page;
