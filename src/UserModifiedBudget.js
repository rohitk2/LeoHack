import React, { useState, useEffect } from 'react';
import './FinalBreakdown.css'; // Import the CSS file for styling
import getBudgetAllocationForChart from './utils/budgetAllocator.js';
import customerAgent from './utils/customerAgent.js';
import summarizationAgent from './utils/summarizationAgent.js'; // Import the singleton instance

function UserModifiedBudget() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [budgetData, setBudgetData] = useState([
    { name: 'Google', value: 25, color: '#4285F4' },
    { name: 'Meta', value: 25, color: '#1877F2' },
    { name: 'TikTok', value: 25, color: '#FF0050' },
    { name: 'LinkedIn', value: 25, color: '#0A66C2' }
  ]);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [summaryOutput, setSummaryOutput] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Format summary text with markdown-style formatting
  const formatSummaryText = (text) => {
    if (!text) return '';
    
    // Split text into lines and process each line
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
      // Handle numbered items (1., 2., etc.)
      if (/^\d+\./.test(line.trim())) {
        return `**${line.trim()}**`;
      }
      // Handle platform names with percentages (e.g., **TikTok:** 46.4%)
      if (/\*\*\w+:\*\*/.test(line)) {
        return `**${line.trim()}**`;
      }
      // Handle regular content lines - make them left-aligned
      if (line.trim().length > 0) {
        return line.trim();
      }
      return line;
    });
    
    return formattedLines.join('\n');
  };

  // Run summarization agent on component mount
  useEffect(() => {
    const runSummarizationAgent = async () => {
      try {
        setSummaryLoading(true);
        const summary = await summarizationAgent.getSummary(); // Use the singleton instance
        setSummaryOutput(summary);
        console.log('Summarization cache populated successfully');
      } catch (error) {
        console.error('Error running summarization agent:', error);
        setSummaryOutput('Error loading summary');
      } finally {
        setSummaryLoading(false);
      }
    };

    runSummarizationAgent();
  }, []);

  // Load dynamic budget allocation on component mount
  useEffect(() => {
    const loadBudgetAllocation = async () => {
      try {
        setBudgetLoading(true);
        const dynamicBudgetData = getBudgetAllocationForChart();
        setBudgetData(dynamicBudgetData);
      } catch (error) {
        console.error('Error loading budget allocation:', error);
        // Keep default hardcoded values if calculation fails
      } finally {
        setBudgetLoading(false);
      }
    };

    loadBudgetAllocation();
  }, []);

  // Initialize chatbot
  useEffect(() => {
    if (customerAgent.isApiKeyAvailable()) {
      setApiKeyAvailable(true);
      // Only set welcome message if messages array is empty
      if (messages.length === 0) {
        setMessages([customerAgent.getWelcomeMessage()]);
      }
    }
  }, []); // Keep empty dependency array

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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = customerAgent.createUserMessage(inputMessage);
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const botResponse = await customerAgent.sendMessage(inputMessage);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorResponse = {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorResponse]);
    }

    setIsLoading(false);
  };

  const resetChat = () => {
    setMessages([customerAgent.getWelcomeMessage()]);
    setInputMessage('');
  };

  // Add the handleButtonClick function here
  const handleButtonClick = async (buttonText, demographicStep) => {
    // Add user's selection as a message
    const userMessage = {
      type: 'user',
      content: buttonText,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    
    try {
      // Process the button response
      const botResponse = customerAgent.processDemographicButtonResponse(buttonText, demographicStep);
      setMessages(prev => [...prev, botResponse]);
      
      // Check for auto follow-up inside the try block
      if (botResponse.autoFollowUp) {
        // Automatically send the summary question to get AI analysis
        setTimeout(async () => {
          try {
            const summaryResponse = await customerAgent.sendMessage("Now can you give a concise budget change. Given all this context you have in the chat before give me a new budget arrangement of the 4 companies. Give a very minimal answer in this format. Look at the demographic information for each company and current budgget allocation. Then look at the info entered. If what they entered matches the demographic at a company bump the budget up for that company. If it doesn't match bump it down for that company. Here is what it should look like:    Company1: X1% > Y1%, Company2: x2% > Y2%, Company3: x3% > Y3%, Company4: x4% > Y4%....Then 2 or 3 sentences defining why there was any shift? Keep it concise don't have too much. Make sure the 4 total percentages add up to 100%");
            setMessages(prev => [...prev, summaryResponse]);
          } catch (error) {
            console.error('Error getting summary response:', error);
          }
        }, 1000); // Small delay for better UX
      }
    } catch (error) {
      const errorResponse = {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
    
    setIsLoading(false);
  };

  if (!apiKeyAvailable) {
    return (
      <div className="main-content" style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#1a202c', fontSize: '36px', marginBottom: '10px', fontWeight: '700' }}>🤖 Budget Assistant Chatbot</h1>
          <p style={{ color: '#4a5568', fontSize: '18px' }}>API key not found in environment variables</p>
        </div>
        
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '40px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fef2f2', borderRadius: '8px', fontSize: '14px', color: '#dc2626' }}>
            <strong>Error:</strong> {customerAgent.getApiKeyErrorMessage()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Combined Budget Allocation and AI Analysis - Side by Side */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '30px',
        maxWidth: '1200px',
        margin: '0 auto 30px auto',
        width: '100%',
        boxSizing: 'border-box' // Ensure padding/borders are included in width calculations
      }}>
        {/* Budget Allocation Component - Left Side (50%) */}
        <div style={{ 
          width: '50%', // Changed from 30% to 50%
          maxWidth: '600px', // Updated max width (50% of 1200px)
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          boxSizing: 'border-box',
          flexShrink: 0 // Prevent shrinking
        }}>
          <h2 className="budget-chart-title" style={{ 
            color: '#1a202c', 
            fontSize: '20px', 
            marginBottom: '15px', 
            fontWeight: '600',
            textAlign: 'center'
          }}>💰 Current Budget Allocation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PieChart data={budgetData} size={220} />
            <div className="budget-legend" style={{ marginTop: '15px', width: '100%' }}>
              {budgetData.map((item, index) => (
                <div key={index} className="legend-item" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  <div 
                    className="legend-color"
                    style={{ 
                      backgroundColor: item.color,
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      marginRight: '8px'
                    }}
                  ></div>
                  <span className="legend-text">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
            
            {/* Added descriptive text below the pie chart */}
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <h3 style={{
                color: '#1a202c',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '10px',
                textAlign: 'center'
              }}>📊 Budget Overview</h3>
              <p style={{
                color: '#4a5568',
                fontSize: '14px',
                lineHeight: '1.5',
                margin: '0',
                textAlign: 'left'
              }}>
                This chart tells you how to allocate your budget. It assumes that you are targeting every demographic and location equally. It is general. Your specific targeted autdience might be different, particularly if you have a very specific audience.
              </p>
              <div style={{
                marginTop: '10px',
                padding: '8px',
                backgroundColor: '#e6fffa',
                borderRadius: '6px',
                border: '1px solid #81e6d9'
              }}>
                <p style={{
                  color: '#234e52',
                  fontSize: '13px',
                  margin: '0',
                  fontWeight: '500'
                }}>
                  💡 <strong>Tip:</strong> To adapt the current budget distribution to your situation talk to our chatbot below and he will advise you on how to change the budget.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Summary Panel - Right Side (50%) */}
        <div style={{ 
          width: '50%', // Changed from 70% to 50%
          maxWidth: '600px', // Updated max width (50% of 1200px)
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <h2 style={{ color: '#1a202c', fontSize: '24px', marginBottom: '15px', fontWeight: '600' }}>🤖 AI Budget Analysis</h2>
          {summaryLoading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Loading AI analysis...
            </div>
          ) : (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f8fafc', 
              borderRadius: '8px', 
              fontSize: '14px', 
              lineHeight: '1.8',
              color: '#2d3748',
              maxHeight: '400px',
              overflowY: 'auto',
              overflowX: 'hidden',
              wordWrap: 'break-word',
              wordBreak: 'break-word',
              width: '100%',
              boxSizing: 'border-box',
              textAlign: 'left',
              fontWeight: '500'
            }}>
              {formatSummaryText(summaryOutput).split('\n').map((line, index) => {
                const isBold = /^\*\*.*\*\*$/.test(line);
                const cleanLine = line.replace(/\*\*/g, '');
                
                return (
                  <div key={index} style={{
                    marginBottom: isBold ? '12px' : '8px',
                    fontWeight: isBold ? '700' : '500',
                    fontSize: isBold ? '15px' : '14px',
                    color: isBold ? '#1a202c' : '#2d3748',
                    lineHeight: '1.6'
                  }}>
                    {cleanLine || '\u00A0'}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Reset Chatbot */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#1a202c', fontSize: '36px', marginBottom: '10px', fontWeight: '700' }}>🤖 Budget Assistant</h1>
        <button
          onClick={resetChat}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Reset Chat
        </button>
      </div>

      {/* Chatbot Interface */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        margin: '0 auto',
        height: '600px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Chat Messages */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          borderBottom: '1px solid #e2e8f0'
        }}>
          {/* Remove the const handleButtonClick function definition from here */}
          
          {/* Keep the message rendering code */}
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                marginBottom: '15px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  backgroundColor: message.type === 'user' ? '#4285F4' : '#f1f3f4',
                  color: message.type === 'user' ? 'white' : '#333'
                }}
              >
                <div>{message.content}</div>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.7,
                  marginTop: '4px'
                }}>
                  {message.timestamp}
                </div>
              </div>
              
              {/* Render buttons if they exist */}
              {message.buttons && message.type === 'bot' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '10px',
                  maxWidth: '70%'
                }}>
                  {message.buttons.map((buttonText, buttonIndex) => (
                    <button
                      key={buttonIndex}
                      onClick={() => handleButtonClick(buttonText, message.demographicStep)}
                      style={{
                        padding: '10px 15px',
                        backgroundColor: '#4285F4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textAlign: 'left',
                        transition: 'background-color 0.2s',
                        ':hover': {
                          backgroundColor: '#3367D6'
                        }
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#3367D6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#4285F4'}
                    >
                      {buttonIndex + 1}. {buttonText}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: '#f1f3f4',
                color: '#333'
              }}>
                Thinking...
              </div>
            </div>
          )}
        </div>
        
        {/* Input Form */}
        <form onSubmit={sendMessage} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about budget optimization..."
              style={{
                flex: 1,
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '25px',
                fontSize: '16px',
                outline: 'none'
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4285F4',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '16px',
                opacity: (isLoading || !inputMessage.trim()) ? 0.5 : 1
              }}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModifiedBudget;