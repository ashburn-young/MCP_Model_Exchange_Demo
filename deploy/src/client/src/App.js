import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const messagesEndRef = useRef(null);
  
  // Force the API URL to the correct server port
  const apiUrl = 'http://localhost:3005/api';
  
  // Log the API URL for debugging
  console.log('Using API URL:', apiUrl);
  
  // Example scenarios
  const scenarios = [
    "I'm looking for sustainable skincare products. Can you recommend something?",
    "Is the organic aloe vera moisturizer currently in stock?",
    "What promotions do you have for eco-friendly products?",
    "Can you tell me about my past purchases?"
  ];

  // Fetch available models when component mounts
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get(`${apiUrl}/models`);
        setAvailableModels(response.data.models || []);
        console.log('Available models:', response.data.models);
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    
    fetchModels();
  }, [apiUrl]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    
    // Add user message to the chat
    const userMessage = {
      text: messageText,
      sender: 'user'
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send the message to the API
      const response = await axios.post(`${apiUrl}/inquiry`, {
        query: messageText,
        customerName: 'Alice Johnson', // Default customer for demo
        preferredModel: selectedModel || undefined
      });
      
      // Add assistant response to the chat
      const assistantMessage = {
        text: response.data.response,
        sender: 'assistant',
        model: response.data.model,
        serverType: response.data.serverType,
        modelVersion: response.data.modelVersion || 'unknown',
        modelSelectionReason: response.data.modelSelectionReason || 'Default model selection',
        usingMock: response.data.usingMock || false
      };
      
      // Update available models if they're returned in the response
      if (response.data.availableModels && response.data.availableModels.length > 0) {
        setAvailableModels(response.data.availableModels);
      }
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add detailed logging for debugging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      
      // Add error message
      const errorMessage = {
        text: 'Sorry, there was an error processing your request. Please try again. (Error: ' + (error.message || 'Unknown') + ')',
        sender: 'assistant'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };
  
  return (
    <div className="app">
      <header className="header">
        <h1>AI-Powered Smart Retail Assistant</h1>
        <p>Using Model Context Protocol (MCP) with Azure OpenAI models</p>
        
        {availableModels.length > 0 && (
          <div className="model-selector">
            <label htmlFor="model-select">Select AI Model: </label>              <select 
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="">Default (Auto-select by Query Type)</option>
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                  {model.strengths && model.strengths.length > 0 ? 
                    ` (Best for: ${model.strengths.join(", ")})` : 
                    ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>
      
      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="message assistant">
              <p>Hello! I'm your AI retail assistant. How can I help you today?</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              <p>{message.text}</p>
              {message.model && (
                <div className="model-info">
                  <span className="model-badge">
                    {message.model}
                  </span>
                  {message.modelVersion !== 'unknown' && 
                    <span className="model-version">v{message.modelVersion}</span>
                  }
                  <span className="server-type">via {message.serverType} MCP Server</span>
                  {message.usingMock && 
                    <span className="mock-indicator">(Using Simulated Response)</span>
                  }
                  {message.modelSelectionReason && 
                    <div className="model-selection-reason">{message.modelSelectionReason}</div>
                  }
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form className="input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about products, inventory, or promotions..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
      
      <div className="scenario-section">
        <h2>Demo Scenarios</h2>
        <p>Click on any example to try it:</p>
        
        {scenarios.map((scenario, index) => (
          <div 
            key={index} 
            className="scenario-example"
            onClick={() => sendMessage(scenario)}
          >
            {scenario}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
