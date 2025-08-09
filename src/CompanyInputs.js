import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css';
import metaImage from './meta.jpg';
import googleImage from './google.jpg';
import tiktokImage from './tiktok.jpg';
import linkedinImage from './linkedin.jpg';

// CSV file imports
import metaCsv from './advertising_csv/meta.csv';
import googleCsv from './advertising_csv/google.csv';
import tiktokCsv from './advertising_csv/tiktok.csv';
import linkedinCsv from './advertising_csv/linkedin.csv';

function CompanyInputs() {
  const [platformData, setPlatformData] = useState({
    meta: {},
    google: {},
    tiktok: {},
    linkedin: {}
  });

  useEffect(() => {
    const loadCsvData = async () => {
      const csvFiles = {
        meta: metaCsv,
        google: googleCsv,
        tiktok: tiktokCsv,
        linkedin: linkedinCsv
      };

      const newPlatformData = {};

      for (const [platform, csvFile] of Object.entries(csvFiles)) {
        try {
          const response = await fetch(csvFile);
          const csvText = await response.text();
          const result = Papa.parse(csvText, { header: true });
          
          const data = {};
          result.data.forEach(row => {
            if (row.metric && row.value) {
              data[row.metric] = row.value;
            }
          });
          newPlatformData[platform] = data;
        } catch (error) {
          console.error(`Error loading ${platform} CSV:`, error);
          newPlatformData[platform] = {};
        }
      }

      setPlatformData(newPlatformData);
    };

    loadCsvData();
  }, []);

  const getDefaultValue = (platform, metric) => {
    return platformData[platform]?.[metric] || '';
  };

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
            <label>Mean Cost Per Mille</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('meta', 'mean_cost_per_mille')}
            />
          </div>
          <div className="metric-item">
            <label>Mean Click Through Rate</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('meta', 'mean_click_through_rate')}
            />
          </div>
          <div className="metric-item">
            <label>Mean Conversion Rate</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('meta', 'mean_conversion_rate')}
            />
          </div>
          <div className="metric-item">
            <label>Cost Per Mille Coefficient of Variation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('meta', 'cost_per_mille_coefficient_of_variation')}
            />
          </div>
          <div className="metric-item">
            <label>Cost Per Mille Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('meta', 'cost_per_mille_standard_deviation')}
            />
          </div>
          <div className="metric-item">
            <label>Conversion Rate Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('meta', 'conversion_rate_standard_deviation')}
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
            <label>Mean Cost Per Mille</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('google', 'mean_cost_per_mille')}
            />
          </div>
          <div className="metric-item">
            <label>Mean Click Through Rate</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('google', 'mean_click_through_rate')}
            />
          </div>
          <div className="metric-item">
            <label>Mean Conversion Rate</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('google', 'mean_conversion_rate')}
            />
          </div>
          <div className="metric-item">
            <label>Cost Per Mille Coefficient of Variation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('google', 'cost_per_mille_coefficient_of_variation')}
            />
          </div>
          <div className="metric-item">
            <label>Cost Per Mille Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('google', 'cost_per_mille_standard_deviation')}
            />
          </div>
          <div className="metric-item">
            <label>Conversion Rate Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('google', 'conversion_rate_standard_deviation')}
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
            <label>Mean Cost Per Mille</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('tiktok', 'mean_cost_per_mille')}
            />
          </div>
          <div className="metric-item">
            <label>Mean Click Through Rate</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('tiktok', 'mean_click_through_rate')}
            />
          </div>
          <div className="metric-item">
            <label>Mean Conversion Rate</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('tiktok', 'mean_conversion_rate')}
            />
          </div>
          <div className="metric-item">
            <label>Cost Per Mille Coefficient of Variation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('tiktok', 'cost_per_mille_coefficient_of_variation')}
            />
          </div>
          <div className="metric-item">
            <label>Cost Per Mille Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('tiktok', 'cost_per_mille_standard_deviation')}
            />
          </div>
          <div className="metric-item">
            <label>Conversion Rate Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('tiktok', 'conversion_rate_standard_deviation')}
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
            <label>Mean Cost Per Mille</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('linkedin', 'mean_cost_per_mille')}
            />
          </div>
          <div className="metric-item">
            <label>Mean Click Through Rate</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('linkedin', 'mean_click_through_rate')}
            />
          </div>
          <div className="metric-item">
            <label>Mean Conversion Rate</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('linkedin', 'mean_conversion_rate')}
            />
          </div>
          <div className="metric-item">
            <label>Cost Per Mille Coefficient of Variation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('linkedin', 'cost_per_mille_coefficient_of_variation')}
            />
          </div>
          <div className="metric-item">
            <label>Cost Per Mille Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('linkedin', 'cost_per_mille_standard_deviation')}
            />
          </div>
          <div className="metric-item">
            <label>Conversion Rate Standard Deviation</label>
            <input 
              type="number" 
              className="metric-input" 
              defaultValue={getDefaultValue('linkedin', 'conversion_rate_standard_deviation')}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default CompanyInputs;