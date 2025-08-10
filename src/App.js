import React, { useState } from 'react';
import CompanyInputs from './CompanyInputs';
import MetricEncyclopedia from './MetricEncyclopedia';
import FinalBreakdown from './FinalBreakdown';
import UserModifiedBudget from './UserModifiedBudget';
import brainLogo from './brain-logo.png';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('final-breakdown');

  const renderContent = () => {
    switch(activeSection) {
      case 'company-input':
        return <CompanyInputs />;
      case 'metric-encyclopedia':
        return <MetricEncyclopedia />;
      case 'final-breakdown':
        return <FinalBreakdown />;
      case 'user-modified-budget':
        return <UserModifiedBudget />;
      default:
        return <FinalBreakdown />;
    }
  };

  const handleLogoClick = () => {
    setActiveSection('final-breakdown');
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="navigation">
          <div className="logo-section" onClick={handleLogoClick} style={{cursor: 'pointer'}}>
            <img src={brainLogo} className="logo-image" alt="Brain Budget Logo" />
            <h1 className="app-title">Brain Budget</h1>
          </div>
          <nav className="nav-links">
            <button 
              className={`nav-button ${activeSection === 'company-input' ? 'active' : ''}`}
              onClick={() => setActiveSection('company-input')}
            >
              Company Input
            </button>
            <button 
              className={`nav-button ${activeSection === 'metric-encyclopedia' ? 'active' : ''}`}
              onClick={() => setActiveSection('metric-encyclopedia')}
            >
              Metric Encyclopedia
            </button>
            <button 
              className={`nav-button ${activeSection === 'final-breakdown' ? 'active' : ''}`}
              onClick={() => setActiveSection('final-breakdown')}
            >
              Simulated Performance
            </button>
            <button 
              className={`nav-button ${activeSection === 'user-modified-budget' ? 'active' : ''}`}
              onClick={() => setActiveSection('user-modified-budget')}
            >
              User Modified Budget
            </button>
          </nav>
        </div>
      </header>
      {renderContent()}
    </div>
  );
}

export default App;
