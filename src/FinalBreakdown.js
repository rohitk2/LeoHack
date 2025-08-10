import React, { useState } from 'react';
import './FinalBreakdown.css';
import convertPlatformData from './utils/platformDataConverter';

function FinalBreakdown() {
  const platformData = convertPlatformData();
  
  // Hardcoded data for all 4 platforms
//   const platformData = {
//     Google: {
//       CPM: { certainty_pct: 45.5, p10: 5.66, p50: 7.75, p90: 10.63, stability_pct: 0.0 },
//       CTR: { certainty_pct: 24.7, p10: 0.0098, p50: 0.0178, p90: 0.0323, stability_pct: 0.0 },
//       CVR: { certainty_pct: 31.24, p10: 0.0246, p50: 0.0397, p90: 0.0642, stability_pct: 0.0 }
//     },
//     Meta: {
//       CPM: { certainty_pct: 52.3, p10: 4.23, p50: 6.89, p90: 11.24, stability_pct: 0.0 },
//       CTR: { certainty_pct: 38.9, p10: 0.0156, p50: 0.0234, p90: 0.0398, stability_pct: 0.0 },
//       CVR: { certainty_pct: 28.7, p10: 0.0189, p50: 0.0312, p90: 0.0567, stability_pct: 0.0 }
//     },
//     TikTok: {
//       CPM: { certainty_pct: 41.8, p10: 3.45, p50: 5.67, p90: 9.23, stability_pct: 0.0 },
//       CTR: { certainty_pct: 33.2, p10: 0.0234, p50: 0.0456, p90: 0.0789, stability_pct: 0.0 },
//       CVR: { certainty_pct: 26.5, p10: 0.0123, p50: 0.0234, p90: 0.0445, stability_pct: 0.0 }
//     },
//     LinkedIn: {
//       CPM: { certainty_pct: 48.9, p10: 8.34, p50: 12.45, p90: 18.67, stability_pct: 0.0 },
//       CTR: { certainty_pct: 29.4, p10: 0.0067, p50: 0.0123, p90: 0.0234, stability_pct: 0.0 },
//       CVR: { certainty_pct: 35.6, p10: 0.0345, p50: 0.0567, p90: 0.0823, stability_pct: 0.0 }
//     }
//   };

  const budgetData = [
    { name: 'Google', value: 25, color: '#34A853' }, // Green
    { name: 'Meta', value: 25, color: '#1877F2' },   // Blue  
    { name: 'TikTok', value: 25, color: '#FF0050' }, // Pink
    { name: 'LinkedIn', value: 25, color: '#FF9500' } // Orange
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
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
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
        <div className="chart-legend">
          <div className="legend-item-chart">
            <div className="legend-box legend-box-p90"></div>
            <span>P90 (90th percentile)</span>
          </div>
          <div className="legend-item-chart">
            <div className="legend-box legend-box-p50"></div>
            <span>P50 (Median)</span>
          </div>
          <div className="legend-item-chart">
            <div className="legend-box legend-box-p10"></div>
            <span>P10 (10th percentile)</span>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Pie Chart with animations
  const PieChart = ({ data, size = 250 }) => {
    const radius = size / 2 - 20;
    const centerX = size / 2;
    const centerY = size / 2;
    let cumulativePercentage = 0;

    return (
      <div className="pie-chart-container">
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
                className="pie-slice"
                style={{
                  opacity: hoveredSegment === index ? 0.8 : 1,
                  transform: hoveredSegment === index ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: `${centerX}px ${centerY}px`
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
          <div className="pie-chart-tooltip">
            {data[hoveredSegment].name}: {data[hoveredSegment].value}%
          </div>
        )}
      </div>
    );
  };

  // Add this after the existing BarChart component (around line 145)
  
  // Multi-Line Performance Chart Component
  const MultiLineChart = ({ data, title }) => {
    const chartWidth = 700;
    const chartHeight = 400;
    const padding = { top: 40, right: 80, bottom: 60, left: 80 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;
    
    const platforms = Object.keys(data);
    const metrics = ['CPM', 'CTR', 'CVR'];
    const percentiles = ['p10', 'p50', 'p90'];
    
    // Normalize data for better visualization
    const normalizeValue = (value, metric) => {
      if (metric === 'CPM') return value;
      return value * 1000; // Scale CTR and CVR for visibility
    };
    
    const getMaxValue = (metric) => {
      return Math.max(...platforms.map(platform => 
        Math.max(...percentiles.map(p => normalizeValue(data[platform][metric][p], metric)))
      ));
    };
    
    const getYPosition = (value, metric) => {
      const maxValue = getMaxValue(metric);
      return innerHeight - (value / maxValue) * innerHeight;
    };
    
    const getXPosition = (index) => {
      return (index / (platforms.length - 1)) * innerWidth;
    };
    
    const colors = {
      Google: '#34A853',   // Green
      Meta: '#1877F2',     // Blue (keep this one)
      TikTok: '#FF0050',   // Pink (already distinct)
      LinkedIn: '#FF9500'  // Orange
    };
    
    const [hoveredLine, setHoveredLine] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState('CPM');
    
    return (
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        
        {/* Metric Selector */}
        <div className="line-chart-controls">
          {metrics.map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`metric-button ${selectedMetric === metric ? 'active' : ''}`}
              style={{ marginRight: '10px', marginBottom: '20px' }}
            >
              {metric}
            </button>
          ))}
        </div>
        
        <svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line 
                x1={padding.left} 
                y1={padding.top + ratio * innerHeight} 
                x2={chartWidth - padding.right} 
                y2={padding.top + ratio * innerHeight}
                stroke="#e0e0e0" 
                strokeDasharray="2,2"
              />
              <text 
                x={padding.left - 10} 
                y={padding.top + ratio * innerHeight + 4} 
                fontSize="10" 
                fill="#666" 
                textAnchor="end"
              >
                {(getMaxValue(selectedMetric) * (1 - ratio)).toFixed(selectedMetric === 'CPM' ? 1 : 2)}
              </text>
            </g>
          ))}
          
          {/* X-axis labels */}
          {platforms.map((platform, index) => (
            <text
              key={platform}
              x={padding.left + getXPosition(index)}
              y={chartHeight - padding.bottom + 20}
              fontSize="12"
              fill="#333"
              textAnchor="middle"
              fontWeight="bold"
            >
              {platform}
            </text>
          ))}
          
          {/* Lines for each percentile */}
          {percentiles.map((percentile, pIndex) => {
            const lineOpacity = hoveredLine === null || hoveredLine === percentile ? 1 : 0.3;
            const strokeWidth = hoveredLine === percentile ? 4 : 3;
            
            const pathData = platforms.map((platform, index) => {
              const value = normalizeValue(data[platform][selectedMetric][percentile], selectedMetric);
              const x = padding.left + getXPosition(index);
              const y = padding.top + getYPosition(value, selectedMetric);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ');
            
            const lineColor = percentile === 'p10' ? '#FF6B6B' : 
                             percentile === 'p50' ? '#4ECDC4' : '#45B7D1';
            
            return (
              <g key={percentile}>
                {/* Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth={strokeWidth}
                  opacity={lineOpacity}
                  onMouseEnter={() => setHoveredLine(percentile)}
                  onMouseLeave={() => setHoveredLine(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                />
                
                {/* Data points */}
                {platforms.map((platform, index) => {
                  const value = normalizeValue(data[platform][selectedMetric][percentile], selectedMetric);
                  const x = padding.left + getXPosition(index);
                  const y = padding.top + getYPosition(value, selectedMetric);
                  
                  return (
                    <circle
                      key={`${percentile}-${platform}`}
                      cx={x}
                      cy={y}
                      r={hoveredLine === percentile ? 6 : 4}
                      fill={lineColor}
                      stroke="white"
                      strokeWidth="2"
                      opacity={lineOpacity}
                      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                      onMouseEnter={() => setHoveredLine(percentile)}
                      onMouseLeave={() => setHoveredLine(null)}
                    >
                      <title>{`${platform} ${percentile.toUpperCase()}: ${data[platform][selectedMetric][percentile].toFixed(4)}`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
          
          {/* Legend */}
          <g transform={`translate(${chartWidth - padding.right + 10}, ${padding.top})`}>
            {percentiles.map((percentile, index) => {
              const lineColor = percentile === 'p10' ? '#FF6B6B' : 
                               percentile === 'p50' ? '#4ECDC4' : '#45B7D1';
              return (
                <g key={percentile} transform={`translate(0, ${index * 25})`}>
                  <line x1="0" y1="0" x2="20" y2="0" stroke={lineColor} strokeWidth="3" />
                  <text x="25" y="4" fontSize="12" fill="#333">{percentile.toUpperCase()}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    );
  };
  
  // Radar Chart Component for Platform Comparison
  const RadarChart = ({ data, title }) => {
    const size = 400;
    const center = size / 2;
    const maxRadius = 150;
    const platforms = Object.keys(data);
    const metrics = ['CPM', 'CTR', 'CVR'];
    
    // Normalize values to 0-1 scale for radar chart
    const normalizeForRadar = (value, metric, percentile) => {
      const allValues = platforms.map(p => data[p][metric][percentile]);
      const max = Math.max(...allValues);
      const min = Math.min(...allValues);
      return (value - min) / (max - min);
    };
    
    const getRadarPoint = (value, angleIndex, totalAngles) => {
      const angle = (angleIndex * 2 * Math.PI) / totalAngles - Math.PI / 2;
      const radius = value * maxRadius;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
      };
    };
    
    const colors = {
      Google: '#4285F4',
      Meta: '#1877F2', 
      TikTok: '#FF0050',
      LinkedIn: '#0A66C2'
    };
    
    const [selectedPercentile, setSelectedPercentile] = useState('p50');
    
    return (
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        
        {/* Percentile Selector */}
        <div className="radar-chart-controls">
          {['p10', 'p50', 'p90'].map(percentile => (
            <button
              key={percentile}
              onClick={() => setSelectedPercentile(percentile)}
              className={`metric-button ${selectedPercentile === percentile ? 'active' : ''}`}
              style={{ marginRight: '10px', marginBottom: '20px' }}
            >
              {percentile.toUpperCase()}
            </button>
          ))}
        </div>
        
        <svg width={size} height={size}>
          {/* Grid circles */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((ratio, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={ratio * maxRadius}
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          ))}
          
          {/* Axis lines and labels */}
          {metrics.map((metric, index) => {
            const angle = (index * 2 * Math.PI) / metrics.length - Math.PI / 2;
            const endX = center + maxRadius * Math.cos(angle);
            const endY = center + maxRadius * Math.sin(angle);
            const labelX = center + (maxRadius + 20) * Math.cos(angle);
            const labelY = center + (maxRadius + 20) * Math.sin(angle);
            
            return (
              <g key={metric}>
                <line
                  x1={center}
                  y1={center}
                  x2={endX}
                  y2={endY}
                  stroke="#ccc"
                  strokeWidth="1"
                />
                <text
                  x={labelX}
                  y={labelY}
                  fontSize="14"
                  fill="#333"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {metric}
                </text>
              </g>
            );
          })}
          
          {/* Platform polygons */}
          {platforms.map((platform, platformIndex) => {
            const points = metrics.map((metric, metricIndex) => {
              const value = normalizeForRadar(
                data[platform][metric][selectedPercentile], 
                metric, 
                selectedPercentile
              );
              return getRadarPoint(value, metricIndex, metrics.length);
            });
            
            const pathData = points.map((point, index) => 
              `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
            ).join(' ') + ' Z';
            
            return (
              <g key={platform}>
                {/* Filled area */}
                <path
                  d={pathData}
                  fill={colors[platform]}
                  fillOpacity="0.2"
                  stroke={colors[platform]}
                  strokeWidth="2"
                />
                
                {/* Data points */}
                {points.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={colors[platform]}
                    stroke="white"
                    strokeWidth="2"
                  >
                    <title>
                      {`${platform} ${metrics[index]}: ${data[platform][metrics[index]][selectedPercentile].toFixed(4)}`}
                    </title>
                  </circle>
                ))}
              </g>
            );
          })}
          
          {/* Legend */}
          <g transform={`translate(20, ${size - 100})`}>
            {platforms.map((platform, index) => (
              <g key={platform} transform={`translate(0, ${index * 20})`}>
                <rect x="0" y="-8" width="15" height="15" fill={colors[platform]} />
                <text x="20" y="4" fontSize="12" fill="#333">{platform}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    );
  };

  // Add the MathSimulationChart component definition here
  const MathSimulationChart = ({ data, metric, title }) => {
    const chartWidth = 800;
    const chartHeight = 450;
    const padding = { top: 40, right: 100, bottom: 60, left: 80 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;
    
    const platforms = Object.keys(data);
    const timePoints = 50; // More points for smoother curves
    
    // Mathematical equation to simulate realistic behavior
    const simulatePerformance = (platform, metricType, timeIndex) => {
      const p10 = data[platform][metricType].p10;
      const p50 = data[platform][metricType].p50;
      const p90 = data[platform][metricType].p90;
      
      // Normalize time (0 to 1)
      const t = timeIndex / (timePoints - 1);
      
      // Platform-specific parameters for variety
      const platformSeed = platform.length * 7; // Unique seed per platform
      const frequency1 = 0.8 + (platformSeed % 3) * 0.2; // Primary frequency
      const frequency2 = 2.1 + (platformSeed % 5) * 0.3; // Secondary frequency
      const phase = (platformSeed % 7) * 0.5; // Phase shift
      
      // Complex wave function with multiple harmonics
      const trend1 = Math.sin(t * Math.PI * frequency1 + phase);
      const trend2 = Math.sin(t * Math.PI * frequency2 + phase * 1.5) * 0.3;
      const noise = (Math.sin(t * Math.PI * 8 + platformSeed) * 0.1);
      
      // Combine trends
      const combinedTrend = trend1 + trend2 + noise;
      
      // Normalize the combined trend to 0-1 range
      const normalizedTrend = (combinedTrend + 1) / 2; // Normalize to 0-1
      
      // Map to percentile ranges with non-linear scaling
      let value;
      if (normalizedTrend < 0.5) {
        // Lower half: p10 to p50 with quadratic scaling
        const localT = normalizedTrend * 2;
        value = p10 + (p50 - p10) * (localT * localT); // Quadratic curve
      } else {
        // Upper half: p50 to p90 with square root scaling
        const localT = (normalizedTrend - 0.5) * 2;
        value = p50 + (p90 - p50) * Math.sqrt(localT); // Square root curve
      }
      
      // Add small random variations
      const randomFactor = 1 + (Math.sin(t * 31.4 + platformSeed) * 0.05);
      
      return Math.max(0, value * randomFactor);
    };
    
    // Generate time series data for all platforms
    const timeSeriesData = {};
    platforms.forEach(platform => {
      timeSeriesData[platform] = Array.from({ length: timePoints }, (_, i) => 
        simulatePerformance(platform, metric, i)
      );
    });
    
    // Calculate scales
    const maxValue = Math.max(
      ...Object.values(timeSeriesData).flat()
    );
    
    const getYPosition = (value) => {
      return padding.top + innerHeight - (value / maxValue) * innerHeight;
    };
    
    const getXPosition = (index) => {
      return padding.left + (index / (timePoints - 1)) * innerWidth;
    };
    
    const colors = {
      Google: '#4285F4',
      Meta: '#1877F2', 
      TikTok: '#FF0050',
      LinkedIn: '#0A66C2'
    };
    
    const [hoveredPlatform, setHoveredPlatform] = useState(null);
    
    return (
      <div className="chart-container">
        <svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />
          
          {/* Y-axis */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerHeight} 
                stroke="#333" strokeWidth="2" />
          
          {/* X-axis */}
          <line x1={padding.left} y1={padding.top + innerHeight} x2={padding.left + innerWidth} y2={padding.top + innerHeight} 
                stroke="#333" strokeWidth="2" />
          
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const value = maxValue * ratio;
            const y = padding.top + innerHeight - ratio * innerHeight;
            return (
              <g key={ratio}>
                <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#333" strokeWidth="1" />
                <text x={padding.left - 10} y={y + 4} fontSize="10" fill="#666" textAnchor="end">
                  {value.toFixed(metric === 'CPM' ? 1 : 3)}
                </text>
              </g>
            );
          })}
          
          {/* Platform lines */}
          {platforms.map((platform) => {
            const points = timeSeriesData[platform];
            const pathData = points.map((value, index) => {
              const x = getXPosition(index);
              const y = getYPosition(value);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ');
            
            return (
              <g key={platform}>
                {/* Line path */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={colors[platform]}
                  strokeWidth={hoveredPlatform === platform ? 4 : 2.5}
                  opacity={hoveredPlatform && hoveredPlatform !== platform ? 0.3 : 1}
                  style={{ transition: 'all 0.2s ease' }}
                />
                
                {/* Data points */}
                {points.map((value, index) => {
                  const x = getXPosition(index);
                  const y = getYPosition(value);
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r={hoveredPlatform === platform ? 4 : 2}
                      fill={colors[platform]}
                      opacity={hoveredPlatform && hoveredPlatform !== platform ? 0.3 : 0.8}
                      style={{ transition: 'all 0.2s ease' }}
                      onMouseEnter={() => setHoveredPlatform(platform)}
                      onMouseLeave={() => setHoveredPlatform(null)}
                    />
                  );
                })}
              </g>
            );
          })}
          
          {/* Legend */}
          <g transform={`translate(${chartWidth - padding.right + 15}, ${padding.top + 20})`}>
            <rect x="-10" y="-15" width="85" height={platforms.length * 25 + 20} 
                  fill="white" stroke="#ddd" strokeWidth="1" rx="5" opacity="0.95" />
            <text x="0" y="0" fontSize="12" fill="#333" fontWeight="bold">Platforms</text>
            {platforms.map((platform, index) => (
              <g key={platform} transform={`translate(0, ${(index + 1) * 20})`}
                 onMouseEnter={() => setHoveredPlatform(platform)}
                 onMouseLeave={() => setHoveredPlatform(null)}
                 style={{ cursor: 'pointer' }}>
                <rect x="0" y="-8" width="15" height="15" fill={colors[platform]} />
                <text x="20" y="4" fontSize="12" fill="#333">{platform}</text>
              </g>
            ))}
          </g>
          
          {/* Axis labels */}
          <text
            x="25"
            y={padding.top + innerHeight / 2}
            fontSize="12"
            fill="#333"
            textAnchor="middle"
            transform={`rotate(-90, 25, ${padding.top + innerHeight / 2})`}
            fontWeight="bold"
          >
            {metric} Value
          </text>
          
          <text
            x={padding.left + innerWidth / 2}
            y={chartHeight - 15}
            fontSize="12"
            fill="#333"
            textAnchor="middle"
            fontWeight="bold"
          >
            Time Progression
          </text>
          
          {/* Mathematical formula display */}
          <text
            x={padding.left + 10}
            y={padding.top + 15}
            fontSize="10"
            fill="#666"
            fontFamily="monospace"
          >
            f(t) = p10 + (p90-p10) × [sin(ωt + φ) + noise]
          </text>
        </svg>
        
        {/* Hover tooltip */}
        {hoveredPlatform && (
          <div className="performance-stats" style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'white',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <strong>{hoveredPlatform}</strong><br/>
            P10: {data[hoveredPlatform][metric].p10.toFixed(metric === 'CPM' ? 2 : 4)}<br/>
            P50: {data[hoveredPlatform][metric].p50.toFixed(metric === 'CPM' ? 2 : 4)}<br/>
            P90: {data[hoveredPlatform][metric].p90.toFixed(metric === 'CPM' ? 2 : 4)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <h1 className="dashboard-title">📊 Analytics Dashboard</h1>
        <p className="dashboard-subtitle">Visual insights and performance metrics across advertising platforms</p>
      </div>

      {/* Metric Selector */}
      <div className="metric-selector">
        <div className="metric-selector-container">
          {['CPM', 'CTR', 'CVR'].map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`metric-button ${selectedMetric === metric ? 'active' : ''}`}
            >
              {metric}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="charts-grid">
        <BarChart 
          data={platformData} 
          metric={selectedMetric} 
          title={`📈 ${selectedMetric} Performance Comparison`}
        />
        
        <MathSimulationChart 
          data={platformData} 
          metric={selectedMetric} 
          title={`📊 ${selectedMetric} Time Series Analysis`}
        />
      </div>

      {/* Platform Comparison Table */}
      <div className="comparison-table-container">
        <h3 className="comparison-table-title">📋 Detailed Metrics Comparison</h3>
        <div className="table-wrapper">
          <table className="comparison-table">
            <thead className="table-header">
              <tr>
                <th>Platform</th>
                <th>CPM Range</th>
                <th>CTR Range</th>
                <th>CVR Range</th>
                <th>Avg Certainty</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(platformData).map(([platform, data], index) => {
                const color = budgetData.find(b => b.name === platform)?.color || '#666';
                const avgCertainty = ((data.CPM.certainty_pct + data.CTR.certainty_pct + data.CVR.certainty_pct) / 3).toFixed(1);
                return (
                  <tr key={platform} className="table-row">
                    <td className="table-cell">
                      <div className="platform-info">
                        <div 
                          className="platform-color"
                          style={{ backgroundColor: color }}
                        ></div>
                        <strong>{platform}</strong>
                      </div>
                    </td>
                    <td className="table-cell table-cell-center">
                      ${data.CPM.p10.toFixed(2)} - ${data.CPM.p90.toFixed(2)}
                    </td>
                    <td className="table-cell table-cell-center">
                      {(data.CTR.p10 * 100).toFixed(2)}% - {(data.CTR.p90 * 100).toFixed(2)}%
                    </td>
                    <td className="table-cell table-cell-center">
                      {(data.CVR.p10 * 100).toFixed(2)}% - {(data.CVR.p90 * 100).toFixed(2)}%
                    </td>
                    <td className="table-cell table-cell-center">
                      <span 
                        className="certainty-badge"
                        style={{ backgroundColor: color }}
                      >
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