#!/bin/bash
echo "Starting deployment..."
cd /opt/render/project/src/backend
echo "Current directory:"
pwd
echo "Checking if models exist:"
ls -la models/
echo "Installing backend dependencies..."
npm install --production
echo "Dependencies installed, starting server..."
node server.js
