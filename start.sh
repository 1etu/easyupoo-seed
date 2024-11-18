#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting script setup..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}node.js is not installed. Please install node.js first.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm first.${NC}"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

if [ -f "index.js" ]; then
    echo -e "${GREEN}Starting application feat(node index.js)${NC}"
    node index.js
elif [ -f "src/index.js" ]; then
    echo -e "${GREEN}Starting application feat(node src/index.js)${NC}"
    node src/index.js
else
    echo -e "${RED}Could not find entry point (index.js or src/index.js)${NC}"
    exit 1
fi 