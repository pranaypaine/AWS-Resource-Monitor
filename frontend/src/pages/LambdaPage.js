import React, { useState, useEffect } from 'react';
import { lambdaService } from '../services/api';
import { toast } from 'react-toastify';

const LambdaPage = () => {
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    function_name: '',
    runtime: 'python3.9',
    handler: 'lambda_function.lambda_handler',
    role: '',
    code: `def lambda_handler(event, context):
    return {
        'statusCode': 200,
        'body': 'Hello from Lambda!'
    }`
  });

  const fetchFunctions = async () => {
    try {
      setLoading(true);
      const response = await lambdaService.listFunctions();
      setFunctions(response.data);
    } catch (error) {
      toast.error('Failed to fetch Lambda functions');
      console.error('Lambda fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunctions();
  }, []);

  const handleCreateFunction = async (e) => {
    e.preventDefault();
    try {
      await lambdaService.createFunction(createForm);
      toast.success('Lambda function created successfully');
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
    }`
      });
      fetchFunctions();
    } catch (error) {
      toast.error('Failed to create Lambda function');
      console.error('Lambda create error:', error);
    }
  };

  const handleDeleteFunction = async (functionName) => {
    if (window.confirm(`Are you sure you want to delete function "${functionName}"?`)) {
      try {
        await lambdaService.deleteFunction(functionName);
        toast.success('Lambda function deleted successfully');
        fetchFunctions();
      } catch (error) {
        toast.error('Failed to delete Lambda function');
        console.error('Lambda delete error:', error);
      }
    }
  };

  const handleInvokeFunction = async (functionName) => {
    try {
      const response = await lambdaService.invokeFunction(functionName, {});
      toast.success('Lambda function invoked successfully');
      console.log('Lambda response:', response.data);
    } catch (error) {
      toast.error('Failed to invoke Lambda function');
      console.error('Lambda invoke error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading Lambda functions...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Lambda Functions</h1>
        <p className="page-description">Manage your serverless Lambda functions</p>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Function'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form">
          <h3>Create New Lambda Function</h3>
          <form onSubmit={handleCreateFunction}>
            <div className="form-row">
              <div className="form-group">
                <label>Function Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={createForm.function_name}
                  onChange={(e) => setCreateForm({...createForm, function_name: e.target.value})}
                  placeholder="my-function"
                  required
                />
              </div>
              <div className="form-group">
                <label>Runtime</label>
                <select
                  className="form-control"
                  value={createForm.runtime}
                  onChange={(e) => setCreateForm({...createForm, runtime: e.target.value})}
                >
                  <option value="python3.9">Python 3.9</option>
                  <option value="python3.8">Python 3.8</option>
                  <option value="nodejs18.x">Node.js 18.x</option>
                  <option value="nodejs16.x">Node.js 16.x</option>
                  <option value="java11">Java 11</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Handler</label>
                <input
                  type="text"
                  className="form-control"
                  value={createForm.handler}
                  onChange={(e) => setCreateForm({...createForm, handler: e.target.value})}
                  placeholder="lambda_function.lambda_handler"
                  required
                />
              </div>
              <div className="form-group">
                <label>IAM Role ARN</label>
                <input
                  type="text"
                  className="form-control"
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                  placeholder="arn:aws:iam::123456789012:role/lambda-role"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Function Code</label>
              <textarea
                className="form-control"
                value={createForm.code}
                onChange={(e) => setCreateForm({...createForm, code: e.target.value})}
                rows="10"
                style={{ fontFamily: 'monospace' }}
                required
              />
            </div>
            <button type="submit" className="btn btn-success">
              Create Function
            </button>
          </form>
        </div>
      )}

      <div className="resource-grid">
        {functions.map((func) => (
          <div key={func.function_name} className="resource-card">
            <h3>{func.function_name}</h3>
            <p><strong>Runtime:</strong> {func.runtime}</p>
            <p><strong>Handler:</strong> {func.handler}</p>
            <p><strong>Code Size:</strong> {func.code_size ? `${func.code_size} bytes` : 'N/A'}</p>
            {func.last_modified && (
              <p><strong>Last Modified:</strong> {new Date(func.last_modified).toLocaleString()}</p>
            )}
            
            <div className="resource-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleInvokeFunction(func.function_name)}
              >
                Invoke
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteFunction(func.function_name)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {functions.length === 0 && (
        <div className="loading">No Lambda functions found</div>
      )}
    </div>
  );
};

export default LambdaPage;
