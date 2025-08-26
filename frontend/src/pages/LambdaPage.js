import React, { useState, useEffect } from 'react';
import { lambdaService } from '../services/api';
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

const LambdaPage = () => {
  const [functions, setFunctions] = useState([]);
  const [filteredFunctions, setFilteredFunctions] = useState([]);
  const [regions, setRegions] = useState(['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [createForm, setCreateForm] = useState({
    function_name: '',
    runtime: 'python3.9',
    handler: 'lambda_function.lambda_handler',
    role: '',
    code: `def lambda_handler(event, context):
    return {
        'statusCode': 200,
        'body': 'Hello from Lambda!'
    }`,
    description: '',
    timeout: 15,
    memory_size: 128,
    region: 'us-east-1',
    environment_variables: {}
  });

  useEffect(() => {
    fetchFunctions();
  }, [selectedRegion]);

  useEffect(() => {
    filterFunctions();
  }, [functions, searchTerm]);

  const fetchFunctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await lambdaService.listFunctions();
      let functionData = response.data || [];
      
      // Filter by region if not 'all'
      if (selectedRegion !== 'all') {
        functionData = functionData.filter(func => func.region === selectedRegion);
      }
      
      setFunctions(functionData);
    } catch (err) {
      setError('Failed to fetch Lambda functions');
      console.error('Lambda fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterFunctions = () => {
    let filtered = functions;
    
    if (searchTerm) {
      filtered = functions.filter(func =>
        func.function_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.runtime?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredFunctions(filtered);
  };

  const handleCreateFunction = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(prev => ({ ...prev, create: true }));
      setError(null);
      
      const response = await lambdaService.createFunction(createForm);
      setSuccess(`Lambda function "${createForm.function_name}" created successfully!`);
      setShowCreateForm(false);
      setCreateForm({
        function_name: '',
        runtime: 'python3.9',
        handler: 'lambda_function.lambda_handler',
        role: '',
        code: `def lambda_handler(event, context):
    return {
        'statusCode': 200,
        'body': 'Hello from Lambda!'
    }`,
        description: '',
        timeout: 15,
        memory_size: 128,
        region: 'us-east-1',
        environment_variables: {}
      });
      
      // Refresh functions list
      setTimeout(() => fetchFunctions(), 2000);
    } catch (err) {
      setError('Failed to create Lambda function');
      console.error('Create function error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, create: false }));
    }
  };

  const handleFunctionAction = async (functionName, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [functionName]: true }));
      setError(null);
      
      if (action === 'invoke') {
        const response = await lambdaService.invokeFunction(functionName, {});
        setSuccess(`Function ${functionName} invoked successfully`);
        console.log('Invocation result:', response.data);
      } else if (action === 'delete') {
        if (window.confirm(`Are you sure you want to delete function "${functionName}"? This action cannot be undone.`)) {
          await lambdaService.deleteFunction(functionName);
          setSuccess(`Function ${functionName} deleted successfully`);
          // Refresh functions list
          setTimeout(() => fetchFunctions(), 1000);
        } else {
          return;
        }
      }
    } catch (err) {
      setError(`Failed to ${action} function ${functionName}`);
      console.error(`${action} function error:`, err);
    } finally {
      setActionLoading(prev => ({ ...prev, [functionName]: false }));
    }
  };

  const getFunctionStats = () => {
    const total = functions.length;
    const python = functions.filter(f => f.runtime?.includes('python')).length;
    const nodejs = functions.filter(f => f.runtime?.includes('nodejs')).length;
    const java = functions.filter(f => f.runtime?.includes('java')).length;
    
    return { total, python, nodejs, java };
  };

  const formatMemory = (memory) => {
    return `${memory} MB`;
  };

  const formatTimeout = (timeout) => {
    return `${timeout}s`;
  };

  const getRuntimeIcon = (runtime) => {
    if (runtime?.includes('python')) return '🐍';
    if (runtime?.includes('nodejs')) return '🟨';
    if (runtime?.includes('java')) return '☕';
    if (runtime?.includes('dotnet')) return '🔷';
    if (runtime?.includes('go')) return '🐹';
    return '⚡';
  };

  const stats = getFunctionStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-60vh">
        <div className="glass-card text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4 text-lg">Loading Lambda functions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="title">⚡ Lambda Functions</h1>
        <p className="subtitle">Run serverless code without managing servers</p>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Total Functions</h3>
          <div className="text-4xl font-bold text-white mb-3 text-shadow">{stats.total}</div>
        </div>
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">🐍</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Python</h3>
          <div className="text-4xl font-bold text-blue-400 mb-3 text-shadow">{stats.python}</div>
        </div>
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">🟨</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Node.js</h3>
          <div className="text-4xl font-bold text-yellow-400 mb-3 text-shadow">{stats.nodejs}</div>
        </div>
        <div className="glass-card-small text-center">
          <div className="text-4xl mb-3">☕</div>
          <h3 className="text-white text-sm uppercase tracking-wide mb-3 font-semibold opacity-90">Java</h3>
          <div className="text-4xl font-bold text-orange-400 mb-3 text-shadow">{stats.java}</div>
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
              placeholder="Search functions..."
              className="flex-1"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary whitespace-nowrap"
          >
            ⚡ Create Function
          </button>
        </div>
      </div>

      {/* Functions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFunctions.length > 0 ? (
          filteredFunctions.map((func) => (
            <div key={func.function_name} className="glass-card-small">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white text-shadow truncate" title={func.function_name}>
                  {func.function_name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getRuntimeIcon(func.runtime)}</span>
                  <Tag variant="info">{func.runtime}</Tag>
                </div>
              </div>
              
              {func.description && (
                <p className="text-white opacity-80 text-sm mb-4 line-clamp-2">
                  {func.description}
                </p>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Handler:</span>
                  <span className="font-medium text-white text-sm font-mono">{func.handler}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Memory:</span>
                  <span className="font-medium text-white">{formatMemory(func.memory_size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Timeout:</span>
                  <span className="font-medium text-white">{formatTimeout(func.timeout)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Region:</span>
                  <span className="font-medium text-white">{func.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white opacity-80">Last Modified:</span>
                  <span className="font-medium text-white text-sm">
                    {func.last_modified ? new Date(func.last_modified).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {func.code_size && (
                  <div className="flex justify-between">
                    <span className="text-white opacity-80">Code Size:</span>
                    <span className="font-medium text-white text-sm">
                      {(func.code_size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleFunctionAction(func.function_name, 'invoke')}
                  disabled={actionLoading[func.function_name]}
                  className="btn btn-success flex-1 text-sm"
                >
                  {actionLoading[func.function_name] ? <LoadingSpinner size="sm" /> : '▶️ Invoke'}
                </button>
                <button
                  onClick={() => window.open(`https://console.aws.amazon.com/lambda/home?region=${func.region}#/functions/${func.function_name}`, '_blank')}
                  className="btn btn-secondary text-sm"
                >
                  🔗
                </button>
                <button
                  onClick={() => handleFunctionAction(func.function_name, 'delete')}
                  disabled={actionLoading[func.function_name]}
                  className="btn btn-danger text-sm"
                >
                  {actionLoading[func.function_name] ? <LoadingSpinner size="sm" /> : '🗑️'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="No Lambda Functions Found"
              description={searchTerm ? 
                `No functions match your search "${searchTerm}". Try adjusting your search terms.` :
                "You don't have any Lambda functions yet. Create your first serverless function to get started!"
              }
              icon="⚡"
              action={
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary"
                >
                  ⚡ Create Your First Function
                </button>
              }
            />
          </div>
        )}
      </div>

      {/* Create Function Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="⚡ Create New Lambda Function"
      >
        <form onSubmit={handleCreateFunction} className="space-y-6">
          <FormField label="Function Name">
            <input
              type="text"
              className="input"
              placeholder="my-lambda-function"
              value={createForm.function_name}
              onChange={(e) => setCreateForm(prev => ({ ...prev, function_name: e.target.value }))}
              required
              pattern="[a-zA-Z0-9-_]+"
              title="Only letters, numbers, hyphens, and underscores allowed"
            />
          </FormField>

          <FormField label="Runtime">
            <select
              className="select"
              value={createForm.runtime}
              onChange={(e) => setCreateForm(prev => ({ ...prev, runtime: e.target.value }))}
            >
              <option value="python3.9">Python 3.9</option>
              <option value="python3.8">Python 3.8</option>
              <option value="nodejs18.x">Node.js 18.x</option>
              <option value="nodejs16.x">Node.js 16.x</option>
              <option value="java11">Java 11</option>
              <option value="java8">Java 8</option>
              <option value="dotnet6">NET 6</option>
              <option value="go1.x">Go 1.x</option>
            </select>
          </FormField>

          <FormField label="Handler">
            <input
              type="text"
              className="input"
              placeholder="lambda_function.lambda_handler"
              value={createForm.handler}
              onChange={(e) => setCreateForm(prev => ({ ...prev, handler: e.target.value }))}
              required
            />
            <p className="text-white opacity-70 text-sm mt-1">
              Format: filename.function_name (e.g., lambda_function.lambda_handler)
            </p>
          </FormField>

          <FormField label="Description">
            <input
              type="text"
              className="input"
              placeholder="Describe what this function does"
              value={createForm.description}
              onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </FormField>

          <FormField label="Function Code">
            <textarea
              className="input min-h-200px font-mono text-sm"
              value={createForm.code}
              onChange={(e) => setCreateForm(prev => ({ ...prev, code: e.target.value }))}
              required
              placeholder="Enter your function code here..."
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Memory (MB)">
              <select
                className="select"
                value={createForm.memory_size}
                onChange={(e) => setCreateForm(prev => ({ ...prev, memory_size: parseInt(e.target.value) }))}
              >
                <option value={128}>128 MB</option>
                <option value={256}>256 MB</option>
                <option value={512}>512 MB</option>
                <option value={1024}>1024 MB</option>
                <option value={2048}>2048 MB</option>
                <option value={3008}>3008 MB</option>
              </select>
            </FormField>

            <FormField label="Timeout (seconds)">
              <input
                type="number"
                className="input"
                min="1"
                max="900"
                value={createForm.timeout}
                onChange={(e) => setCreateForm(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                required
              />
            </FormField>
          </div>

          <FormField label="IAM Role ARN">
            <input
              type="text"
              className="input"
              placeholder="arn:aws:iam::123456789012:role/lambda-execution-role"
              value={createForm.role}
              onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
              required
            />
            <p className="text-white opacity-70 text-sm mt-1">
              The Lambda function needs an IAM role with permission to execute
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
              {actionLoading.create ? <LoadingSpinner size="sm" /> : '⚡ Create Function'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LambdaPage;
