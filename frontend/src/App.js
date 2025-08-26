import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import pages
import Dashboard from './pages/Dashboard';
import EC2Page from './pages/EC2Page';
import S3Page from './pages/S3Page';
import RDSPage from './pages/RDSPage';
import LambdaPage from './pages/LambdaPage';
import GitHubPage from './pages/GitHubPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav className="navbar">
            <div className="nav-brand">
              <h1>☁️ AWS Resource Monitor</h1>
            </div>
            <ul className="nav-links">
              <li><NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>🏠 Dashboard</NavLink></li>
              <li><NavLink to="/ec2" className={({isActive}) => isActive ? 'active' : ''}>🖥️ EC2</NavLink></li>
              <li><NavLink to="/s3" className={({isActive}) => isActive ? 'active' : ''}>🪣 S3</NavLink></li>
              <li><NavLink to="/rds" className={({isActive}) => isActive ? 'active' : ''}>🗄️ RDS</NavLink></li>
              <li><NavLink to="/lambda" className={({isActive}) => isActive ? 'active' : ''}>⚡ Lambda</NavLink></li>
              <li><NavLink to="/github" className={({isActive}) => isActive ? 'active' : ''}>🐙 GitHub</NavLink></li>
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
            <Route path="/github" element={<GitHubPage />} />
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
