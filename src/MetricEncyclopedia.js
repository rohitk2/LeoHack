import React from 'react';
import './App.css';

function MetricEncyclopedia() {
  return (
    <div className="main-content">
      <h2>Metric Encyclopedia</h2>
      <p>Coming soon - Detailed explanations of advertising metrics and their calculations.</p>
      
      {/* You can expand this with actual metric definitions */}
      <div className="metrics-grid">
        <div className="metric-item">
          <h3>Cost Per Mille (CPM)</h3>
          <p>The cost of 1,000 advertisement impressions on one web page.</p>
        </div>
        <div className="metric-item">
          <h3>Click Through Rate (CTR)</h3>
          <p>The ratio of users who click on a specific link to the number of total users who view a page.</p>
        </div>
        <div className="metric-item">
          <h3>Conversion Rate</h3>
          <p>The percentage of visitors who take a desired action on your website.</p>
        </div>
      </div>
    </div>
  );
}

export default MetricEncyclopedia;