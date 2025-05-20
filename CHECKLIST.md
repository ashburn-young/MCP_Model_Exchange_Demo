# Deployment Checklist - Smart Retail Assistant

Use this checklist to ensure all steps are properly completed when deploying the Smart Retail Assistant.

## Pre-Deployment Preparation

- [ ] Azure subscription access verified
- [ ] Azure CLI installed and updated
- [ ] Docker installed and configured
- [ ] Node.js and npm installed (v18+ / v9+)
- [ ] Required environment variables set:
  - [ ] AZURE_OPENAI_API_KEY
  - [ ] AZURE_OPENAI_ENDPOINT
- [ ] Azure OpenAI Service configured with required models:
  - [ ] GPT-4o
  - [ ] Claude 3.5 Sonnet
  - [ ] Gemini 1.5 Pro

## Local Development Verification

- [ ] Dependencies installed (`npm install`)
- [ ] Client dependencies installed (`cd src/client && npm install`)
- [ ] Azure OpenAI connectivity tested (`./scripts/test-azure-openai.sh`)
- [ ] Local development server runs without errors (`npm run dev:all`)
- [ ] All API endpoints working:
  - [ ] `/api/health`
  - [ ] `/api/serverinfo`
  - [ ] `/api/inquiry`
- [ ] Docker container builds successfully (`npm run docker:build`)
- [ ] Docker container runs locally (`npm run docker:run`)

## Deployment Process

- [ ] Logged in to Azure (`az login`)
- [ ] Deployment script executed (`./scripts/deploy.sh`)
- [ ] Resources created in Azure:
  - [ ] Resource Group
  - [ ] Managed Identity
  - [ ] Container Registry
  - [ ] Log Analytics Workspace
  - [ ] Container App Environment
  - [ ] Container App
  - [ ] Web App
- [ ] Web App URL obtained and accessible
- [ ] API URL obtained and endpoints accessible
- [ ] CORS settings configured correctly

## Post-Deployment Verification

- [ ] Web App loads successfully
- [ ] API health check returns 200 status
- [ ] Test queries work for each MCP server:
  - [ ] Customer Preference query
  - [ ] Inventory Analytics query
  - [ ] Marketing Optimization query
- [ ] Model switching works as expected
- [ ] Logs are being captured correctly
- [ ] Container health probes functioning

## Performance & Monitoring

- [ ] Azure Monitor set up
- [ ] Log Analytics configured
- [ ] Alert rules created for:
  - [ ] Container App failures
  - [ ] Web App failures
  - [ ] API response times

## Documentation & Handover

- [ ] Deployment guide reviewed
- [ ] README updated with deployment details
- [ ] Demo scenarios documented
- [ ] Troubleshooting guide available
- [ ] Contact information for support provided

## Cleanup Procedure (When Needed)

- [ ] Resource Group deletion command:
  ```bash
  az group delete --name rg-smart-retail --yes
  ```

---

**Deployment Completed By:** _________________________

**Date:** _________________________

**Notes:**

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
