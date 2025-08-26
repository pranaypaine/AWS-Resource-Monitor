import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { SearchFilter, LoadingSpinner, ErrorAlert, Modal, FormField, Tag, EmptyState } from '../components/UIComponents';

const GitHubPage = () => {
  const [accessToken, setAccessToken] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [deploymentTemplates, setDeploymentTemplates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeploymentForm, setShowDeploymentForm] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState({
    aws_service: 'lambda',
    environment: 'dev',
    region: 'us-east-1',
    runtime: 'python3.9',
    environment_variables: {}
  });

  useEffect(() => {
    fetchDeploymentTemplates();
    fetchDeployments();
  }, []);

  const fetchDeploymentTemplates = async () => {
    try {
      const response = await fetch('/api/github/deployment-templates');
      const data = await response.json();
      setDeploymentTemplates(data);
    } catch (error) {
      console.error('Failed to fetch deployment templates:', error);
    }
  };

  const fetchDeployments = async () => {
    try {
      const response = await fetch('/api/github/deployments');
      const data = await response.json();
      setDeployments(data);
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
    }
  };

  const connectGitHub = async () => {
    if (!accessToken.trim()) {
      setError('Please enter your GitHub access token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/github/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepositories(data);
      toast.success(`Connected! Found ${data.length} repositories`);
    } catch (error) {
      setError(error.message);
      toast.error('Failed to connect to GitHub');
    } finally {
      setLoading(false);
    }
  };

  const createDeployment = async () => {
    if (!selectedRepo) {
      toast.error('Please select a repository');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/github/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          config: {
            repository_name: selectedRepo.full_name,
            branch: selectedRepo.default_branch,
            ...deploymentConfig
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create deployment');
      }

      const deployment = await response.json();
      setDeployments(prev => [deployment, ...prev]);
      setShowDeploymentForm(false);
      toast.success('Deployment started successfully!');
    } catch (error) {
      toast.error(`Deployment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    const statusVariants = {
      pending: 'warning',
      building: 'info',
      success: 'success',
      failed: 'error'
    };

    return (
      <Tag variant={statusVariants[status] || 'default'}>
        {status}
      </Tag>
    );
  };

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="title">GitHub Integration</h1>
        <p className="subtitle">Connect your GitHub repositories and deploy to AWS services</p>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* GitHub Connection */}
      {repositories.length === 0 && (
        <div className="glass-card">
          <h2 className="section-title mb-6">🔗 Connect to GitHub</h2>
          <div className="space-y-6">
            <FormField label="GitHub Personal Access Token">
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="input"
              />
              <p className="text-white opacity-70 text-sm mt-2">
                📝 Generate a token at: GitHub Settings → Developer settings → Personal access tokens
              </p>
            </FormField>
            <button
              onClick={connectGitHub}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? <LoadingSpinner size="sm" /> : '🚀'}
              Connect to GitHub
            </button>
          </div>
        </div>
      )}

      {/* Repositories */}
      {repositories.length > 0 && (
        <div className="glass-card mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">📂 Your Repositories</h2>
            <button
              onClick={() => setShowDeploymentForm(true)}
              className="btn btn-success"
              disabled={!selectedRepo}
            >
              🚀 Deploy Selected
            </button>
          </div>

          <SearchFilter
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search repositories..."
            className="mb-6"
          />

          {filteredRepositories.length === 0 ? (
            <EmptyState
              title="No repositories found"
              description="Try adjusting your search terms"
              icon="🔍"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRepositories.map((repo) => (
                <div
                  key={repo.id}
                  className={`glass-card-small cursor-pointer transition-all duration-300 ${
                    selectedRepo?.id === repo.id
                      ? 'ring-2 ring-blue-400 bg-blue-50 bg-opacity-10'
                      : 'hover:scale-105'
                  }`}
                  onClick={() => setSelectedRepo(repo)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white truncate text-lg">{repo.name}</h3>
                    <div className="flex gap-2 ml-2">
                      {repo.private && (
                        <Tag variant="warning">🔒 Private</Tag>
                      )}
                      {selectedRepo?.id === repo.id && (
                        <Tag variant="success">✓ Selected</Tag>
                      )}
                    </div>
                  </div>
                  <p className="text-white opacity-70 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                    {repo.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-white opacity-60">
                    <span className="flex items-center gap-1">
                      🔧 {repo.language || 'Unknown'}
                    </span>
                    <span>📅 {new Date(repo.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deployment Form Modal */}
      <Modal
        isOpen={showDeploymentForm}
        onClose={() => setShowDeploymentForm(false)}
        title={`🚀 Deploy ${selectedRepo?.name}`}
      >
        <div className="space-y-6">
          <FormField label="AWS Service">
            <select
              value={deploymentConfig.aws_service}
              onChange={(e) => setDeploymentConfig(prev => ({ ...prev, aws_service: e.target.value }))}
              className="select"
            >
              {Object.entries(deploymentTemplates).map(([key, template]) => (
                <option key={key} value={key}>{template.name}</option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Environment">
              <select
                value={deploymentConfig.environment}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, environment: e.target.value }))}
                className="select"
              >
                <option value="dev">🛠️ Development</option>
                <option value="staging">🎭 Staging</option>
                <option value="prod">🌟 Production</option>
              </select>
            </FormField>

            <FormField label="AWS Region">
              <select
                value={deploymentConfig.region}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, region: e.target.value }))}
                className="select"
              >
                <option value="us-east-1">🇺🇸 US East (N. Virginia)</option>
                <option value="us-west-2">🇺🇸 US West (Oregon)</option>
                <option value="eu-west-1">🇪🇺 Europe (Ireland)</option>
                <option value="ap-southeast-1">🌏 Asia Pacific (Singapore)</option>
              </select>
            </FormField>
          </div>

          {deploymentConfig.aws_service === 'lambda' && (
            <FormField label="Runtime">
              <select
                value={deploymentConfig.runtime}
                onChange={(e) => setDeploymentConfig(prev => ({ ...prev, runtime: e.target.value }))}
                className="select"
              >
                <option value="python3.9">🐍 Python 3.9</option>
                <option value="python3.8">🐍 Python 3.8</option>
                <option value="nodejs16.x">💚 Node.js 16</option>
                <option value="nodejs14.x">💚 Node.js 14</option>
                <option value="java11">☕ Java 11</option>
              </select>
            </FormField>
          )}

          <div className="flex justify-end space-x-3 pt-6">
            <button
              onClick={() => setShowDeploymentForm(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={createDeployment}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? <LoadingSpinner size="sm" /> : '🚀'}
              Deploy Now
            </button>
          </div>
        </div>
      </Modal>

      {/* Deployments */}
      {deployments.length > 0 && (
        <div className="glass-card">
          <h2 className="section-title mb-6">📊 Recent Deployments</h2>
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <div key={deployment.id} className="glass-card-small">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-white">{deployment.repository_name}</h3>
                    {getStatusBadge(deployment.status)}
                  </div>
                  <span className="text-sm text-white opacity-60">
                    📅 {new Date(deployment.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="text-white opacity-80">
                    <span className="block opacity-60">Service:</span>
                    <span className="font-medium">{deployment.aws_service}</span>
                  </div>
                  <div className="text-white opacity-80">
                    <span className="block opacity-60">Branch:</span>
                    <span className="font-medium">{deployment.branch}</span>
                  </div>
                  <div className="text-white opacity-80">
                    <span className="block opacity-60">Environment:</span>
                    <span className="font-medium">{deployment.environment || 'dev'}</span>
                  </div>
                  <div className="text-white opacity-80">
                    <span className="block opacity-60">Region:</span>
                    <span className="font-medium">{deployment.region || 'us-east-1'}</span>
                  </div>
                </div>

                {deployment.deployment_url && (
                  <div className="mb-3">
                    <a
                      href={deployment.deployment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary text-sm"
                    >
                      🔗 View Deployment
                    </a>
                  </div>
                )}

                {deployment.logs && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-white opacity-80 hover:opacity-100 mb-2 flex items-center gap-2">
                      📝 View Deployment Logs
                    </summary>
                    <pre className="mt-2 p-4 bg-black bg-opacity-30 rounded-lg text-xs overflow-x-auto text-green-400 font-mono">
                      {deployment.logs}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubPage;
