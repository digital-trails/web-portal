export const environment = {
  production: false,
  azureOpenAI: {
    apiKey: process.env['AZURE_OPENAI_API_KEY'] || '',
    endpoint: 'https://trailsfoundry.openai.azure.com/',
    model: 'gpt-35-turbo',
    deploymentName: 'your-deployment-name-here', // Replace with your actual deployment name
    // Foundry specific configuration
    foundryProjectUrl: 'https://trailsfoundry.services.ai.azure.com/api/projects/firstProject'
  }
}; 