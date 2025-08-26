import React, { useState, useEffect } from 'react';
import { ec2Service, s3Service, rdsService, lambdaService } from '../services/api';
import { StatsCard, LoadingSpinner, ErrorAlert } from '../components/UIComponents';

const Dashboard = () => {
  const [stats, setStats] = useState({
    ec2: { total: 0, running: 0, stopped: 0, regions: {} },
    s3: { total: 0, regions: {} },
    rds: { total: 0, available: 0, stopped: 0, regions: {} },
    lambda: { total: 0, regions: {} }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError('Failed to fetch dashboard data. Please check your AWS credentials and try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalResources = () => {
    return stats.ec2.total + stats.s3.total + stats.rds.total + stats.lambda.total;
  };

  const getTopRegions = () => {
    const regionCounts = {};
    
    // Combine all region data
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
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onDismiss={() => setError(null)} />;
  }

  const topRegions = getTopRegions();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏠 AWS Resource Dashboard</h1>
        <p className="page-description">
          Overview of your AWS resources across all regions and services
        </p>
        <button
          className="btn btn-primary"
          onClick={fetchStats}
          disabled={loading}
        >
          🔄 Refresh Data
        </button>
      </div>

      <div className="dashboard-stats">
        <StatsCard
          icon="🖥️"
          title="EC2 Instances"
          value={stats.ec2.total}
          subtitle={`${stats.ec2.running} running, ${stats.ec2.stopped} stopped`}
          color="blue"
        />
        <StatsCard
          icon="🪣"
          title="S3 Buckets"
          value={stats.s3.total}
          subtitle="Storage buckets"
          color="green"
        />
        <StatsCard
          icon="🗄️"
          title="RDS Instances"
          value={stats.rds.total}
          subtitle={`${stats.rds.available} available, ${stats.rds.stopped} stopped`}
          color="orange"
        />
        <StatsCard
          icon="⚡"
          title="Lambda Functions"
          value={stats.lambda.total}
          subtitle="Serverless functions"
          color="purple"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="create-form">
          <h3>📊 Quick Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left' }}>
            <div>
              <p><strong>Total Resources:</strong> {getTotalResources()}</p>
              <p><strong>Active Regions:</strong> {topRegions.length}</p>
            </div>
            <div>
              <p><strong>Running Services:</strong> {stats.ec2.running + stats.rds.available}</p>
              <p><strong>Serverless Functions:</strong> {stats.lambda.total}</p>
            </div>
          </div>
        </div>

        <div className="create-form">
          <h3>🌍 Top Regions</h3>
          {topRegions.length > 0 ? (
            <div style={{ textAlign: 'left' }}>
              {topRegions.map(([region, count]) => (
                <div key={region} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>{region}</span>
                  <span style={{ fontWeight: 'bold' }}>{count} resources</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>No regional data available</p>
          )}
        </div>
      </div>

      <div className="create-form">
        <h3>🚀 Quick Actions</h3>
        <p style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          Use the navigation menu above to manage specific AWS services:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
            <h4>🖥️ EC2 Instances</h4>
            <p>Create and manage virtual machines</p>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
            <h4>🪣 S3 Buckets</h4>
            <p>Store and manage files in the cloud</p>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
            <h4>🗄️ RDS Databases</h4>
            <p>Deploy and manage databases</p>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
            <h4>⚡ Lambda Functions</h4>
            <p>Run serverless code</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
