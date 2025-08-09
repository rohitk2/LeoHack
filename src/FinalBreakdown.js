import React, { useState } from 'react';

function FinalBreakdown() {
  // Hardcoded data for all 4 platforms
  const platformData = {
    Google: {
      CPM: { certainty_pct: 45.5, p10: 5.66, p50: 7.75, p90: 10.63, stability_pct: 0.0 },
      CTR: { certainty_pct: 24.7, p10: 0.0098, p50: 0.0178, p90: 0.0323, stability_pct: 0.0 },
      CVR: { certainty_pct: 31.24, p10: 0.0246, p50: 0.0397, p90: 0.0642, stability_pct: 0.0 }
    },
    Meta: {
      CPM: { certainty_pct: 52.3, p10: 4.23, p50: 6.89, p90: 11.24, stability_pct: 0.0 },
      CTR: { certainty_pct: 38.9, p10: 0.0156, p50: 0.0234, p90: 0.0398, stability_pct: 0.0 },
      CVR: { certainty_pct: 28.7, p10: 0.0189, p50: 0.0312, p90: 0.0567, stability_pct: 0.0 }
    },
    TikTok: {
      CPM: { certainty_pct: 41.8, p10: 3.45, p50: 5.67, p90: 9.23, stability_pct: 0.0 },
      CTR: { certainty_pct: 33.2, p10: 0.0234, p50: 0.0456, p90: 0.0789, stability_pct: 0.0 },
      CVR: { certainty_pct: 26.5, p10: 0.0123, p50: 0.0234, p90: 0.0445, stability_pct: 0.0 }
    },
    LinkedIn: {
      CPM: { certainty_pct: 48.9, p10: 8.34, p50: 12.45, p90: 18.67, stability_pct: 0.0 },
      CTR: { certainty_pct: 29.4, p10: 0.0067, p50: 0.0123, p90: 0.0234, stability_pct: 0.0 },
      CVR: { certainty_pct: 35.6, p10: 0.0345, p50: 0.0567, p90: 0.0823, stability_pct: 0.0 }
    }
  };

  const budgetData = [
    { name: 'Google', value: 25, color: '#4285F4' },
    { name: 'Meta', value: 25, color: '#1877F2' },
    { name: 'TikTok', value: 25, color: '#FF0050' },
    { name: 'LinkedIn', value: 25, color: '#0A66C2' }
  ];

  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('CPM');

  // Enhanced Bar Chart Component
  const BarChart = ({ data, metric, title }) => {
    const maxValue = Math.max(...Object.values(data).map(platform => platform[metric].p90));
    const chartHeight = 300;
    const chartWidth = 600;
    const barWidth = 80;
    const spacing = 120;
    
    return (
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c3e50' }}>{title}</h3>
        <svg width={chartWidth} height={chartHeight + 60}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line 
                x1={60} 
                y1={chartHeight - (ratio * chartHeight) + 20} 
                x2={chartWidth - 20} 
                y2={chartHeight - (ratio * chartHeight) + 20}
                stroke="#e0e0e0" 
                strokeDasharray="2,2"
              />
              <text 
                x={50} 
                y={chartHeight - (ratio * chartHeight) + 25} 
                fontSize="10" 
                fill="#666" 
                textAnchor="end"
              >
                {(maxValue * ratio).toFixed(2)}
              </text>
            </g>
          ))}
          
          {/* Bars */}
          {Object.entries(data).map(([platform, values], index) => {
            const x = 80 + index * spacing;
            const p10Height = (values[metric].p10 / maxValue) * chartHeight;
            const p50Height = (values[metric].p50 / maxValue) * chartHeight;
            const p90Height = (values[metric].p90 / maxValue) * chartHeight;
            const color = budgetData.find(b => b.name === platform)?.color || '#666';
            
            return (
              <g key={platform}>
                {/* P90 bar (background) */}
                <rect
                  x={x - barWidth/2}
                  y={chartHeight - p90Height + 20}
                  width={barWidth}
                  height={p90Height}
                  fill={color}
                  opacity={0.3}
                  rx={4}
                />
                {/* P50 bar (median) */}
                <rect
                  x={x - barWidth/2}
                  y={chartHeight - p50Height + 20}
                  width={barWidth}
                  height={p50Height}
                  fill={color}
                  opacity={0.7}
                  rx={4}
                />
                {/* P10 bar (foreground) */}
                <rect
                  x={x - barWidth/2}
                  y={chartHeight - p10Height + 20}
                  width={barWidth}
                  height={p10Height}
                  fill={color}
                  rx={4}
                />
                {/* Platform label */}
                <text
                  x={x}
                  y={chartHeight + 40}
                  fontSize="12"
                  fill="#333"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {platform}
                </text>
                {/* Value label */}
                <text
                  x={x}
                  y={chartHeight - p50Height + 10}
                  fontSize="10"
                  fill="white"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {values[metric].p50.toFixed(3)}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#666', opacity: 0.3, borderRadius: '2px' }}></div>
            <span>P90 (90th percentile)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#666', opacity: 0.7, borderRadius: '2px' }}></div>
            <span>P50 (Median)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#666', borderRadius: '2px' }}></div>
            <span>P10 (10th percentile)</span>
          </div>
        </div>
      </div>
    );
  };

  // Certainty Radar Chart
//   const CertaintyChart = ({ data }) => {
//     const size = 300;
//     const center = size / 2;
//     const radius = 100;
//     const platforms = Object.keys(data);
//     const metrics = ['CPM', 'CTR', 'CVR'];
    
//     return (
//       <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//         <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c3e50' }}>📊 Certainty Levels by Platform</h3>
//         <svg width={size} height={size}>
//           {/* Grid circles */}
//           {[20, 40, 60, 80, 100].map((r, i) => (
//             <circle
//               key={i}
//               cx={center}
//               cy={center}
//               r={r}
//               fill="none"
//               stroke="#e0e0e0"
//               strokeWidth="1"
//             />
//           ))}
          
//           {/* Platform data */}
//           {platforms.map((platform, platformIndex) => {
//             const color = budgetData.find(b => b.name === platform)?.color || '#666';
//             const points = metrics.map((metric, metricIndex) => {
//               const angle = (metricIndex * 2 * Math.PI) / metrics.length - Math.PI / 2;
//               const certainty = data[platform][metric].certainty_pct;
//               const r = (certainty / 100) * radius;
//               const x = center + r * Math.cos(angle);
//               const y = center + r * Math.sin(angle);
//               return `${x},${y}`;
//             }).join(' ');
            
//             return (
//               <g key={platform}>
//                 <polygon
//                   points={points}
//                   fill={color}
//                   fillOpacity={0.3}
//                   stroke={color}
//                   strokeWidth={2}
//                 />
//                 {metrics.map((metric, metricIndex) => {
//                   const angle = (metricIndex * 2 * Math.PI) / metrics.length - Math.PI / 2;
//                   const certainty = data[platform][metric].certainty_pct;
//                   const r = (certainty / 100) * radius;
//                   const x = center + r * Math.cos(angle);
//                   const y = center + r * Math.sin(angle);
//                   return (
//                     <circle
//                       key={`${platform}-${metric}`}
//                       cx={x}
//                       cy={y}
//                       r={3}
//                       fill={color}
//                     />
//                   );
//                 })}
//               </g>
//             );
//           })}
          
//           {/* Metric labels */}
//           {metrics.map((metric, index) => {
//             const angle = (index * 2 * Math.PI) / metrics.length - Math.PI / 2;
//             const x = center + (radius + 20) * Math.cos(angle);
//             const y = center + (radius + 20) * Math.sin(angle);
//             return (
//               <text
//                 key={metric}
//                 x={x}
//                 y={y}
//                 fontSize="12"
//                 fill="#333"
//                 textAnchor="middle"
//                 fontWeight="bold"
//               >
//                 {metric}
//               </text>
//             );
//           })}
//         </svg>
//         <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px', fontSize: '12px' }}>
//           {platforms.map(platform => {
//             const color = budgetData.find(b => b.name === platform)?.color || '#666';
//             return (
//               <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                 <div style={{ width: '12px', height: '12px', backgroundColor: color, borderRadius: '2px' }}></div>
//                 <span>{platform}</span>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

  // Enhanced Pie Chart with animations
  const PieChart = ({ data, size = 250 }) => {
    const radius = size / 2 - 20;
    const centerX = size / 2;
    const centerY = size / 2;
    let cumulativePercentage = 0;

    return (
      <div className="pie-chart-container" style={{ position: 'relative', display: 'inline-block' }}>
        <svg width={size} height={size}>
          {/* Shadow */}
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {data.map((item, index) => {
            const startAngle = (cumulativePercentage * 360) / 100;
            const endAngle = ((cumulativePercentage + item.value) * 360) / 100;
            const largeArcFlag = item.value > 50 ? 1 : 0;
            
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;
            
            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            cumulativePercentage += item.value;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="3"
                filter="url(#shadow)"
                style={{
                  cursor: 'pointer',
                  opacity: hoveredSegment === index ? 0.8 : 1,
                  transform: hoveredSegment === index ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            );
          })}
          
          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={40}
            fill="white"
            stroke="#e0e0e0"
            strokeWidth="2"
          />
          <text
            x={centerX}
            y={centerY - 5}
            fontSize="14"
            fill="#333"
            textAnchor="middle"
            fontWeight="bold"
          >
            Budget
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            fontSize="12"
            fill="#666"
            textAnchor="middle"
          >
            Split
          </text>
        </svg>
        
        {hoveredSegment !== null && (
          <div 
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            {data[hoveredSegment].name}: {data[hoveredSegment].value}%
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="main-content" style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1a202c', fontSize: '36px', marginBottom: '10px', fontWeight: '700' }}>📊 Analytics Dashboard</h1>
        <p style={{ color: '#4a5568', fontSize: '18px' }}>Visual insights and performance metrics across advertising platforms</p>
      </div>

      {/* Metric Selector */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'inline-flex', background: 'white', borderRadius: '12px', padding: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {['CPM', 'CTR', 'CVR'].map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                background: selectedMetric === metric ? '#4285F4' : 'transparent',
                color: selectedMetric === metric ? 'white' : '#4a5568',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {metric}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        <BarChart 
          data={platformData} 
          metric={selectedMetric} 
          title={`📈 ${selectedMetric} Performance Comparison`}
        />
        {/* <CertaintyChart data={platformData} /> */}
      </div>

      {/* Budget and Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        {/* Budget Pie Chart */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '30px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#2c3e50', fontSize: '24px', marginBottom: '20px' }}>💰 Budget Allocation</h2>
          <PieChart data={budgetData} size={280} />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px' }}>
            {budgetData.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: item.color,
                  borderRadius: '50%',
                  marginRight: '8px'
                }}></div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Comparison Table */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '30px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c3e50', fontSize: '24px' }}>📋 Detailed Metrics Comparison</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Platform</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>CPM Range</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>CTR Range</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>CVR Range</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>Avg Certainty</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(platformData).map(([platform, data], index) => {
                const color = budgetData.find(b => b.name === platform)?.color || '#666';
                const avgCertainty = ((data.CPM.certainty_pct + data.CTR.certainty_pct + data.CVR.certainty_pct) / 3).toFixed(1);
                return (
                  <tr key={platform} style={{ backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white' }}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: color, borderRadius: '50%', marginRight: '8px' }}></div>
                        <strong>{platform}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                      ${data.CPM.p10.toFixed(2)} - ${data.CPM.p90.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                      {(data.CTR.p10 * 100).toFixed(2)}% - {(data.CTR.p90 * 100).toFixed(2)}%
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                      {(data.CVR.p10 * 100).toFixed(2)}% - {(data.CVR.p90 * 100).toFixed(2)}%
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{ 
                        backgroundColor: color, 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: 'bold' 
                      }}>
                        {avgCertainty}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FinalBreakdown;