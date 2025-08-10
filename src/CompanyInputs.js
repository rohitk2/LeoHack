import React, { useState, useEffect } from 'react';
import './App.css';
import metaImage from './meta.jpg';
import googleImage from './google.jpg';
import tiktokImage from './tiktok.jpg';
import linkedinImage from './linkedin.jpg';

// Import the JSON data directly
import platformDataJson from './data/platformData.json';

function CompanyInputs() {
  const [platformData, setPlatformData] = useState({
    Meta: {},
    Google: {},
    TikTok: {},
    LinkedIn: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJsonData = () => {
      try {
        setLoading(true);
        
        const newPlatformData = {};
        platformDataJson.forEach(row => {
          if (row.company) {
            newPlatformData[row.company] = {
              cpm_mean: row.cpm_mean,
              cpm_cv: row.cpm_cv,
              ctr_mean: row.ctr_mean,
              ctr_std: row.ctr_std,
              cvr_mean: row.cvr_mean,
              cvr_std: row.cvr_std
            };
          }
        });
        
        setPlatformData(newPlatformData);
      } catch (error) {
        console.error('Error loading JSON data:', error);
        setPlatformData({});
      } finally {
        setLoading(false);
      }
    };

    loadJsonData();
  }, []);

  const getDefaultValue = (platform, metric) => {
    return platformData[platform]?.[metric] || '';
  };

  if (loading) {
    return <div className="loading">Loading platform data...</div>;
  }

  return (
    <main className="main-content">
      {/* Meta Section */}
      <section className="section platform-section">
        <div className="meta-heading">
          <img src={metaImage} className="meta-logo-heading" alt="Meta logo" />
          <h1>Meta Budget Breakdown</h1>
        </div>
        <div className="metrics-grid">
          <div className="metric-item">
            <label>CPM Mean</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('Meta', 'cpm_mean')}
            />
          </div>
          <div className="metric-item">
            <label>CPM Coefficient of Variation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('Meta', 'cpm_cv')}
            />
          </div>
          <div className="metric-item">
            <label>CTR Mean</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('Meta', 'ctr_mean')}
            />
          </div>
          <div className="metric-item">
            <label>CTR Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('Meta', 'ctr_std')}
            />
          </div>
          <div className="metric-item">
            <label>CVR Mean</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('Meta', 'cvr_mean')}
            />
          </div>
          <div className="metric-item">
            <label>CVR Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('Meta', 'cvr_std')}
            />
          </div>
        </div>
      </section>

      {/* Google Section */}
      <section className="section platform-section">
        <div className="meta-heading">
          <img src={googleImage} className="meta-logo-heading" alt="Google logo" />
          <h1>Google Budget Breakdown</h1>
        </div>
        <div className="metrics-grid">
          <div className="metric-item">
            <label>CPM Mean</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('Google', 'cpm_mean')}
            />
          </div>
          <div className="metric-item">
            <label>CPM Coefficient of Variation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('Google', 'cpm_cv')}
            />
          </div>
          <div className="metric-item">
            <label>CTR Mean</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('Google', 'ctr_mean')}
            />
          </div>
          <div className="metric-item">
            <label>CTR Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('Google', 'ctr_std')}
            />
          </div>
          <div className="metric-item">
            <label>CVR Mean</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('Google', 'cvr_mean')}
            />
          </div>
          <div className="metric-item">
            <label>CVR Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('Google', 'cvr_std')}
            />
          </div>
        </div>
      </section>

      {/* TikTok Section */}
      <section className="section platform-section">
        <div className="meta-heading">
          <img src={tiktokImage} className="meta-logo-heading" alt="TikTok logo" />
          <h1>TikTok Budget Breakdown</h1>
        </div>
        <div className="metrics-grid">
          <div className="metric-item">
            <label>CPM Mean</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('TikTok', 'cpm_mean')}
            />
          </div>
          <div className="metric-item">
            <label>CPM Coefficient of Variation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('TikTok', 'cpm_cv')}
            />
          </div>
          <div className="metric-item">
            <label>CTR Mean</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('TikTok', 'ctr_mean')}
            />
          </div>
          <div className="metric-item">
            <label>CTR Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('TikTok', 'ctr_std')}
            />
          </div>
          <div className="metric-item">
            <label>CVR Mean</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('TikTok', 'cvr_mean')}
            />
          </div>
          <div className="metric-item">
            <label>CVR Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('TikTok', 'cvr_std')}
            />
          </div>
        </div>
      </section>

      {/* LinkedIn Section */}
      <section className="section platform-section">
        <div className="meta-heading">
          <img src={linkedinImage} className="meta-logo-heading" alt="LinkedIn logo" />
          <h1>LinkedIn Budget Breakdown</h1>
        </div>
        <div className="metrics-grid">
          <div className="metric-item">
            <label>CPM Mean</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('LinkedIn', 'cpm_mean')}
            />
          </div>
          <div className="metric-item">
            <label>CPM Coefficient of Variation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('LinkedIn', 'cpm_cv')}
            />
          </div>
          <div className="metric-item">
            <label>CTR Mean</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('LinkedIn', 'ctr_mean')}
            />
          </div>
          <div className="metric-item">
            <label>CTR Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('LinkedIn', 'ctr_std')}
            />
          </div>
          <div className="metric-item">
            <label>CVR Mean</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('LinkedIn', 'cvr_mean')}
            />
          </div>
          <div className="metric-item">
            <label>CVR Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('LinkedIn', 'cvr_std')}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default CompanyInputs;