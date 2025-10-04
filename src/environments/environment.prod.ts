export const environment = {
  production: true,
  azureOpenAI: {
    apiKey: process.env['AZURE_OPENAI_API_KEY'] || '',
    endpoint: process.env['AZURE_OPENAI_ENDPOINT'] || '',
    model: process.env['AZURE_OPENAI_MODEL'] || 'gpt-35-turbo',
    deploymentName: process.env['AZURE_OPENAI_DEPLOYMENT_NAME'] || 'gpt-35-turbo'
  }
}; 