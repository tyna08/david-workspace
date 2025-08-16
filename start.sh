#!/bin/bash
echo 'Starting deployment...'
cd backend
echo 'Installing backend dependencies...'
npm install --production
echo 'Dependencies installed, starting server...'
node server.js