export const environment = {
  production: false,
  azureOpenAI: {
    apiKey: 'YOUR_API_KEY_HERE', // Replace with your actual Azure AI Studio API key
    endpoint: 'https://trailsfoundry.services.ai.azure.com/models',
    model: 'Ministral-3B',
    deploymentName: 'Ministral-3B', // Replace with your actual deployment name
    // Foundry specific configuration
    foundryProjectUrl: 'https://trailsfoundry.services.ai.azure.com/api/projects/firstProject'
  }
}; 