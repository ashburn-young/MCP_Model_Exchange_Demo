import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

// Azure OpenAI configuration
const azureOpenAIApiKey = "3Jlvh7bHjguxnlzAGtJMwLr7RI6cNKLe6PrMpAIeWRxPnbUhT30EJQQJ99BDACfhMk5XJ3w3AAABACOGaWoA";
const azureOpenAIEndpoint = "https://oaimodels.openai.azure.com/";

console.log('Azure OpenAI Endpoint:', azureOpenAIEndpoint);
console.log('API Key (partial):', azureOpenAIApiKey ? `${azureOpenAIApiKey.substring(0, 5)}...${azureOpenAIApiKey.substring(azureOpenAIApiKey.length - 5)}` : 'Not set');

async function testModel(modelName) {
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
    return true;
  } catch (modelError) {
    console.log(`✗ ${modelName} is not available:`, modelError.message);
    return false;
  }
}

async function main() {
  const modelNames = ['gpt-4o', 'gpt-4', 'gpt-35-turbo', 'gpt-3.5-turbo', 'text-davinci-003'];
  
  for (const modelName of modelNames) {
    await testModel(modelName);
  }
}

main().catch(error => {
  console.error('Error in main function:', error);
});
