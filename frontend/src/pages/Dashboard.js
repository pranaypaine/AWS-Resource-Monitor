import React, { useState, useEffect } from 'react';
import { ec2Service, s3Service, rdsService, lambdaService } from '../services/api';
import { StatsCard, LoadingSpinner, ErrorAlert, EmptyState, ProgressBar } from '../components/UIComponents';

const Dashboard = () => {
  const [stats, setStats] = useState({
    ec2: { total: 0, running: 0, stopped: 0, regions: {} },
    s3: { total: 0, regions: {} },
    rds: { total: 0, available: 0, stopped: 0, regions: {} },
    lambda: { total: 0, regions: {} }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ec2Response, s3Response, rdsResponse, lambdaResponse] = await Promise.all([
        ec2Service.listInstances(),
        s3Service.listBuckets(),
        rdsService.listInstances(),
        lambdaService.listFunctions()
      ]);

      // Process EC2 stats
      const ec2Data = ec2Response.data;
      const ec2Stats = {
        total: ec2Data.length,
        running: ec2Data.filter(instance => instance.state === 'running').length,
        stopped: ec2Data.filter(instance => instance.state === 'stopped').length,
        regions: {}
      };
      
      ec2Data.forEach(instance => {
        if (instance.region) {
          ec2Stats.regions[instance.region] = (ec2Stats.regions[instance.region] || 0) + 1;
        }
      });

      // Process S3 stats
      const s3Data = s3Response.data;
      const s3Stats = {
        total: s3Data.length,
        regions: {}
      };
      
      s3Data.forEach(bucket => {
        if (bucket.region) {
          s3Stats.regions[bucket.region] = (s3Stats.regions[bucket.region] || 0) + 1;
        }
      });

      // Process RDS stats
      const rdsData = rdsResponse.data;
      const rdsStats = {
        total: rdsData.length,
        available: rdsData.filter(instance => instance.status === 'available').length,
        stopped: rdsData.filter(instance => instance.status === 'stopped').length,
        regions: {}
      };
      
      rdsData.forEach(instance => {
        if (instance.region) {
          rdsStats.regions[instance.region] = (rdsStats.regions[instance.region] || 0) + 1;
        }
      });

      // Process Lambda stats
      const lambdaData = lambdaResponse.data;
      const lambdaStats = {
        total: lambdaData.length,
        regions: {}
      };
      
      lambdaData.forEach(func => {
        if (func.region) {
          lambdaStats.regions[func.region] = (lambdaStats.regions[func.region] || 0) + 1;
        }
      });

      setStats({
        ec2: ec2Stats,
        s3: s3Stats,
        rds: rdsStats,
        lambda: lambdaStats
      });
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const getTotalResources = () => {
    return stats.ec2.total + stats.s3.total + stats.rds.total + stats.lambda.total;
  };

  const getAllRegions = () => {
    const regionCounts = {};
    
    Object.entries(stats.ec2.regions).forEach(([region, count]) => {
      regionCounts[region] = (regionCounts[region] || 0) + count;
    });
    
    Object.entries(stats.s3.regions).forEach(([region, count]) => {
      regionCounts[region] = (regionCounts[region] || 0) + count;
    });
    
    Object.entries(stats.rds.regions).forEach(([region, count]) => {
      regionCounts[region] = (regionCounts[region] || 0) + count;
    });
    
    Object.entries(stats.lambda.regions).forEach(([region, count]) => {
      regionCounts[region] = (regionCounts[region] || 0) + count;
    });
    
    return Object.entries(regionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getHealthScore = () => {
    const totalServices = stats.ec2.total + stats.rds.total;
    const healthyServices = stats.ec2.running + stats.rds.available;
    return totalServices > 0 ? Math.round((healthyServices / totalServices) * 100) : 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-60vh">
        <div className="glass-card text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="title">🚀 AWS Dashboard</h1>
        <p className="subtitle">Monitor and manage your AWS resources across all regions</p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary mt-4"
        >
          {refreshing ? <LoadingSpinner size="sm" /> : '🔄'}
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="EC2 Instances"
          value={stats.ec2.total}
          icon="🖥️"
          trend={stats.ec2.running > 0 ? { positive: true, value: `${stats.ec2.running} running` } : null}
        />
        <StatsCard
          title="S3 Buckets"
          value={stats.s3.total}
          icon="🪣"
          trend={{ positive: true, value: "Storage ready" }}
        />
        <StatsCard
          title="RDS Databases"
          value={stats.rds.total}
          icon="🗄️"
          trend={stats.rds.available > 0 ? { positive: true, value: `${stats.rds.available} available` } : null}
        />
        <StatsCard
          title="Lambda Functions"
          value={stats.lambda.total}
          icon="⚡"
          trend={{ positive: true, value: "Serverless ready" }}
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Health Overview */}
        <div className="glass-card">
          <h3 className="section-title mb-4">💚 System Health</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">{getHealthScore()}%</div>
            <ProgressBar progress={getHealthScore()} className="mb-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-green-400 font-semibold">{stats.ec2.running + stats.rds.available}</div>
                <div className="text-white opacity-70">Healthy</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-semibold">{stats.ec2.stopped + stats.rds.stopped}</div>
                <div className="text-white opacity-70">Stopped</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card">
          <h3 className="section-title mb-4">📊 Quick Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white opacity-80">Total Resources</span>
              <span className="font-bold text-white">{getTotalResources()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white opacity-80">Active Regions</span>
              <span className="font-bold text-white">{getAllRegions().length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white opacity-80">Running Services</span>
              <span className="font-bold text-white">{stats.ec2.running + stats.rds.available}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white opacity-80">Serverless Functions</span>
              <span className="font-bold text-white">{stats.lambda.total}</span>
            </div>
          </div>
        </div>

        {/* Top Regions */}
        <div className="glass-card">
          <h3 className="section-title mb-4">🌍 Top Regions</h3>
          {getAllRegions().length > 0 ? (
            <div className="space-y-3">
              {getAllRegions().map(([region, count], index) => (
                <div key={region} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-white opacity-60">#{index + 1}</span>
                    <span className="text-white">{region}</span>
                  </div>
                  <span className="font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Data"
              description="No regional data available"
              icon="🌍"
            />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card">
        <h3 className="section-title mb-6">🚀 Quick Actions</h3>
        <p className="text-white opacity-80 mb-6 text-center">
          Click on any service below to manage your AWS resources
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/ec2" className="glass-card-small text-center hover:scale-105 transition-transform no-underline">
            <div className="text-4xl mb-3">🖥️</div>
            <h4 className="text-white font-semibold mb-2">EC2 Instances</h4>
            <p className="text-white opacity-70 text-sm">Create and manage virtual machines</p>
          </a>
          <a href="/s3" className="glass-card-small text-center hover:scale-105 transition-transform no-underline">
            <div className="text-4xl mb-3">🪣</div>
            <h4 className="text-white font-semibold mb-2">S3 Buckets</h4>
            <p className="text-white opacity-70 text-sm">Store and manage files in the cloud</p>
          </a>
          <a href="/rds" className="glass-card-small text-center hover:scale-105 transition-transform no-underline">
            <div className="text-4xl mb-3">🗄️</div>
            <h4 className="text-white font-semibold mb-2">RDS Databases</h4>
            <p className="text-white opacity-70 text-sm">Deploy and manage databases</p>
          </a>
          <a href="/lambda" className="glass-card-small text-center hover:scale-105 transition-transform no-underline">
            <div className="text-4xl mb-3">⚡</div>
            <h4 className="text-white font-semibold mb-2">Lambda Functions</h4>
            <p className="text-white opacity-70 text-sm">Run serverless code</p>
          </a>
        </div>
      </div>

      {/* GitHub Integration Promo */}
      <div className="glass-card mt-6">
        <div className="text-center">
          <h3 className="section-title mb-4">🐙 New: GitHub Integration</h3>
          <p className="text-white opacity-80 mb-6">
            Deploy your GitHub repositories directly to AWS services with just a few clicks!
          </p>
          <a href="/github" className="btn btn-primary">
            🚀 Try GitHub Deploy
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
