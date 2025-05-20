// Check available models at Azure OpenAI endpoint
import dotenv from 'dotenv';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

// Load environment variables
dotenv.config();

// Azure OpenAI configuration
const azureOpenAIApiKey = "3Jlvh7bHjguxnlzAGtJMwLr7RI6cNKLe6PrMpAIeWRxPnbUhT30EJQQJ99BDACfhMk5XJ3w3AAABACOGaWoA";
const azureOpenAIEndpoint = "https://oaimodels.openai.azure.com/";

console.log('Azure OpenAI Endpoint:', azureOpenAIEndpoint);
console.log('API Key (partial):', azureOpenAIApiKey ? `${azureOpenAIApiKey.substring(0, 5)}...${azureOpenAIApiKey.substring(azureOpenAIApiKey.length - 5)}` : 'Not set');

async function listAvailableModels() {
  try {
    // Initialize Azure OpenAI client
    const openAIClient = new OpenAIClient(
      azureOpenAIEndpoint,
      new AzureKeyCredential(azureOpenAIApiKey)
    );
    
    console.log('Azure OpenAI Client initialized successfully');
    
    // List available deployments
    console.log('Attempting to list available deployments...');
    
    const deployments = await openAIClient.listDeployments();
    
    console.log('Available deployments:');
    for (const deployment of deployments) {
      console.log(`- ${deployment.name} (Model: ${deployment.model})`);
    }
    
    // Try to get a chat completion with GPT-4o model
    console.log('\nTesting chat completion with GPT-4o model...');
    const response = await openAIClient.getChatCompletions(
      'gpt-4o',
      [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is the date today?' }
      ]
    );
    
    console.log('Response received successfully!');
    console.log('Model used:', response.model);
    console.log('Response content:', response.choices[0].message.content);
    
  } catch (error) {
    console.error('Error:', error.message);
    
    // If we can't list deployments, try known model names one by one
    console.log('\nTrying to test known model names one by one:');
    const modelNames = ['gpt-4o', 'gpt-4', 'gpt-35-turbo', 'gpt-3.5-turbo', 'gpt-4.1', 'gpt-4.5-preview', 'o1', 'text-davinci-003', 'text-embedding-ada-002'];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\nTesting ${modelName}...`);
        const openAIClient = new OpenAIClient(
          azureOpenAIEndpoint,
          new AzureKeyCredential(azureOpenAIApiKey)
        );
        
        const response = await openAIClient.getChatCompletions(
          modelName,
          [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello, what model are you?' }
          ]
        );
        
        console.log(`✓ ${modelName} is available!`);
        console.log('  Model response:', response.model);
        console.log('  Content:', response.choices[0].message.content);
      } catch (modelError) {
        console.log(`✗ ${modelName} is not available:`, modelError.message);
      }
    }
  }
}

listAvailableModels();
