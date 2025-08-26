import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import pages
import Dashboard from './pages/Dashboard';
import EC2Page from './pages/EC2Page';
import S3Page from './pages/S3Page';
import RDSPage from './pages/RDSPage';
import LambdaPage from './pages/LambdaPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav className="navbar">
            <div className="nav-brand">
              <h1>AWS Resource Monitor</h1>
            </div>
            <ul className="nav-links">
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/ec2">EC2</Link></li>
              <li><Link to="/s3">S3</Link></li>
              <li><Link to="/rds">RDS</Link></li>
              <li><Link to="/lambda">Lambda</Link></li>
            </ul>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ec2" element={<EC2Page />} />
            <Route path="/s3" element={<S3Page />} />
            <Route path="/rds" element={<RDSPage />} />
            <Route path="/lambda" element={<LambdaPage />} />
          </Routes>
        </main>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
