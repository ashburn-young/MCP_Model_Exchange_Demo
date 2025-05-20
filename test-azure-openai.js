// Simple test to validate Azure OpenAI configuration
import dotenv from 'dotenv';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

// Load environment variables
dotenv.config();

// Azure OpenAI configuration
const azureOpenAIApiKey = process.env.AZURE_OPENAI_API_KEY;
const azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureOpenAIModelGroup = process.env.AZURE_OPENAI_MODEL_GROUP || 'oaimodels';

console.log('Azure OpenAI Endpoint:', azureOpenAIEndpoint);
console.log('Azure OpenAI Model Group:', azureOpenAIModelGroup);
console.log('API Key (partial):', azureOpenAIApiKey ? `${azureOpenAIApiKey.substring(0, 5)}...${azureOpenAIApiKey.substring(azureOpenAIApiKey.length - 5)}` : 'Not set');

try {
  // Initialize Azure OpenAI client
  const openAIClient = new OpenAIClient(
    azureOpenAIEndpoint,
    new AzureKeyCredential(azureOpenAIApiKey)
  );
  
  console.log('Azure OpenAI Client initialized successfully');
  
  // This will test if we can get the model information
  console.log('Attempting to use a sample model (GPT-4)...');
  
  // Try to get completions (this might fail if the model isn't deployed correctly)
  const response = await openAIClient.getChatCompletions(
    'gpt-4o',
    [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, can you help me test the connection?' }
    ],
    {
      temperature: 0.7,
      maxTokens: 100
    }
  );
  
  console.log('Response received successfully!');
  console.log('Model used:', response.model);
  console.log('Response content:', response.choices[0].message.content);
  
} catch (error) {
  console.error('Error testing Azure OpenAI connection:', error.message);
  
  // Provide a helpful message about the error
  if (error.message.includes('401')) {
    console.error('Authentication error - check your API key');
  } else if (error.message.includes('404')) {
    console.error('Resource not found - check your endpoint URL and model deployment name');
  } else if (error.message.includes('context_length_exceeded')) {
    console.error('Prompt is too long for the model');
  } else {
    console.error('Full error details:', error);
  }
}
