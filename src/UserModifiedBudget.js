import React, { useState, useEffect } from 'react';

function UserModifiedBudget() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);
  
  const geminiKey = process.env.REACT_APP_GEMINI_API_KEY;

  useEffect(() => {
    if (geminiKey) {
      setApiKeyAvailable(true);
      setMessages([{
        type: 'bot',
        content: 'Hello! I\'m your budget modification assistant. How can I help you optimize your advertising budget today?',
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  }, [geminiKey]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + geminiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a budget optimization assistant. Help the user with their advertising budget questions. User question: ${inputMessage}`
            }]
          }]
        })
      });

      const data = await response.json();
      const botResponse = {
        type: 'bot',
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I encountered an error processing your request. Please check your API key and try again.',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorResponse = {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please check your Gemini API key and internet connection.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorResponse]);
    }

    setIsLoading(false);
  };

  const resetChat = () => {
    setMessages([{
      type: 'bot',
      content: 'Hello! I\'m your budget modification assistant. How can I help you optimize your advertising budget today?',
      timestamp: new Date().toLocaleTimeString()
    }]);
    setInputMessage('');
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
            <strong>Error:</strong> Gemini API key not found. Please add REACT_APP_GEMINI_API_KEY to your .env file.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
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
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
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