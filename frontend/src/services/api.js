import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// EC2 Services
export const ec2Service = {
  getRegions: () => api.get('/ec2/regions'),
  listInstances: (region = null) => api.get('/ec2/instances', { params: region ? { region } : {} }),
  createInstance: (data) => api.post('/ec2/instances', data),
  terminateInstance: (instanceId, region = null) => 
    api.delete(`/ec2/instances/${instanceId}`, { params: region ? { region } : {} }),
  startInstance: (instanceId, region = null) => 
    api.post(`/ec2/instances/${instanceId}/start`, {}, { params: region ? { region } : {} }),
  stopInstance: (instanceId, region = null) => 
    api.post(`/ec2/instances/${instanceId}/stop`, {}, { params: region ? { region } : {} }),
};

// S3 Services
export const s3Service = {
  listBuckets: () => api.get('/s3/buckets'),
  createBucket: (data) => api.post('/s3/buckets', data),
  deleteBucket: (bucketName) => api.delete(`/s3/buckets/${bucketName}`),
  listObjects: (bucketName) => api.get(`/s3/buckets/${bucketName}/objects`),
};

// RDS Services
export const rdsService = {
  listInstances: () => api.get('/rds/instances'),
  createInstance: (data) => api.post('/rds/instances', data),
  deleteInstance: (dbInstanceId) => api.delete(`/rds/instances/${dbInstanceId}`),
  startInstance: (dbInstanceId) => api.post(`/rds/instances/${dbInstanceId}/start`),
  stopInstance: (dbInstanceId) => api.post(`/rds/instances/${dbInstanceId}/stop`),
};

// Lambda Services
export const lambdaService = {
  listFunctions: () => api.get('/lambda/functions'),
  createFunction: (data) => api.post('/lambda/functions', data),
  deleteFunction: (functionName) => api.delete(`/lambda/functions/${functionName}`),
  invokeFunction: (functionName, payload) => api.post(`/lambda/functions/${functionName}/invoke`, payload),
  getFunction: (functionName) => api.get(`/lambda/functions/${functionName}`),
};

export default api;
