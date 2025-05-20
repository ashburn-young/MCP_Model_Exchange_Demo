#!/bin/bash
# filepath: /afh/projects/kimyo-5913-193b8cf7-c6fc-4ba0-9f24-f7969c405f98/code/smart-retail-assistant/scripts/run-local.sh

# Set error handling
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Smart Retail Assistant locally...${NC}"

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Check if .env file exists in project root
if [ ! -f "$PROJECT_ROOT/.env" ]; then
  echo -e "${RED}Error: .env file not found in $PROJECT_ROOT${NC}"
  echo -e "Please create a .env file based on .env.example"
  exit 1
fi

# Change to the project root directory
cd "$PROJECT_ROOT"

# Check if there's already a server running on the configured port
PORT=$(grep PORT .env | cut -d '=' -f2)
PORT=${PORT:-3000} # Default to 3000 if not found

# Set the API server port to 3005
SERVER_PORT=3005

# Check if server port is in use
if lsof -i:$SERVER_PORT -t >/dev/null 2>&1; then
  echo -e "${YELLOW}Warning: Port $SERVER_PORT (API server) is already in use.${NC}"
  echo -e "Would you like to: "
  echo -e "  1) Kill the existing process and continue"
  echo -e "  2) Exit"
  read -p "Enter your choice (1/2): " choice
  
  if [ "$choice" == "1" ]; then
    echo -e "${YELLOW}Killing process on port $SERVER_PORT...${NC}"
    kill $(lsof -t -i:$SERVER_PORT) || true
    sleep 2
  else
    echo -e "${YELLOW}Exiting...${NC}"
    exit 0
  fi
fi

# Check if client port is in use
if lsof -i:$PORT -t >/dev/null 2>&1; then
  echo -e "${YELLOW}Warning: Port $PORT (client app) is already in use.${NC}"
  echo -e "Would you like to: "
  echo -e "  1) Kill the existing process and continue"
  echo -e "  2) Exit"
  read -p "Enter your choice (1/2): " choice
  
  if [ "$choice" == "1" ]; then
    echo -e "${YELLOW}Killing process on port $PORT...${NC}"
    kill $(lsof -t -i:$PORT) || true
    sleep 2
  else
    echo -e "${YELLOW}Exiting...${NC}"
    exit 0
  fi
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo -e "${YELLOW}Using Node.js version: ${NODE_VERSION}${NC}"

# Install dependencies if needed
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  echo -e "${YELLOW}Installing server dependencies...${NC}"
  npm install
fi

if [ ! -d "$PROJECT_ROOT/src/client/node_modules" ]; then
  echo -e "${YELLOW}Installing client dependencies...${NC}"
  cd "$PROJECT_ROOT/src/client"
  npm install
  cd "$PROJECT_ROOT"
fi

# Build the client
echo -e "${YELLOW}Building client application...${NC}"
cd "$PROJECT_ROOT/src/client"
npm run build
cd "$PROJECT_ROOT"

# Start the server
echo -e "${GREEN}Starting server on port $SERVER_PORT...${NC}"
echo -e "${GREEN}The Smart Retail Assistant will be available at: http://localhost:$PORT${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"

# Run the server with the specific port
export PORT=$SERVER_PORT
node src/server/index.js
