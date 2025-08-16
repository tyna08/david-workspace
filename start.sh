#!/bin/bash
echo "Starting deployment..."
cd backend
echo "Installing backend dependencies..."
npm ci || npm install
echo "Dependencies installed, starting server..."
node server.js