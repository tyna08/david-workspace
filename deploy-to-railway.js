const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 GitHub + Railway Deployment Script\n');

// Get user inputs
const questions = async () => {
  return new Promise((resolve) => {
    readline.question('Enter your GitHub username: ', (username) => {
      readline.question('Enter repository name (default: david-workspace): ', (repoName) => {
        readline.question('Is your repo already created on GitHub? (y/n): ', (exists) => {
          resolve({
            username,
            repoName: repoName || 'david-workspace',
            repoExists: exists.toLowerCase() === 'y'
          });
        });
      });
    });
  });
};

const runDeployment = async () => {
  const { username, repoName, repoExists } = await questions();

  // Step 1: Create .gitignore
  console.log('\n📝 Creating .gitignore...');
  const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Railway
.railway/`;

  fs.writeFileSync('.gitignore', gitignoreContent);
  console.log('✅ .gitignore created');

  // Step 2: Prepare deployment files
  console.log('\n📦 Creating Railway configuration...');
  
  // Backend railway.json
  const backendRailwayConfig = {
    "$schema": "https://railway.app/railway.schema.json",
    "build": {
      "builder": "nixpacks"
    },
    "deploy": {
      "startCommand": "node server.js",
      "restartPolicyType": "on_failure",
      "restartPolicyMaxRetries": 10
    }
  };
  
  fs.writeFileSync('./backend/railway.json', JSON.stringify(backendRailwayConfig, null, 2));
  console.log('✅ Backend Railway config created');

  // Frontend build script
  const frontendPackageJson = JSON.parse(fs.readFileSync('./frontend/package.json', 'utf8'));
  if (!frontendPackageJson.scripts.build) {
    frontendPackageJson.scripts.build = "react-scripts build";
  }
  fs.writeFileSync('./frontend/package.json', JSON.stringify(frontendPackageJson, null, 2));
  console.log('✅ Frontend build script verified');

  // Step 3: Initialize Git
  console.log('\n🔧 Initializing Git...');
  try {
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit for Railway deployment"', { stdio: 'inherit' });
    execSync('git branch -M main', { stdio: 'inherit' });
    console.log('✅ Git initialized and files committed');
  } catch (error) {
    console.log('⚠️  Git already initialized, continuing...');
  }

  // Step 4: GitHub setup
  if (!repoExists) {
    console.log('\n📌 Please create a new repository on GitHub:');
    console.log(`1. Go to: https://github.com/new`);
    console.log(`2. Repository name: ${repoName}`);
    console.log(`3. Keep it Public or Private (your choice)`);
    console.log(`4. DO NOT initialize with README`);
    console.log(`5. Click "Create repository"\n`);
    
    await new Promise((resolve) => {
      readline.question('Press Enter when done...', resolve);
    });
  }

  // Step 5: Push to GitHub
  console.log('\n📤 Pushing to GitHub...');
  const remoteUrl = `https://github.com/${username}/${repoName}.git`;
  
  try {
    execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });
  } catch {
    execSync(`git remote set-url origin ${remoteUrl}`, { stdio: 'inherit' });
  }
  
  try {
    execSync('git push -u origin main', { stdio: 'inherit' });
    console.log('✅ Pushed to GitHub successfully!');
  } catch (error) {
    console.log('\n❌ Push failed. You may need to:');
    console.log('1. Check your GitHub credentials');
    console.log('2. Use a Personal Access Token instead of password');
    console.log('3. Make sure the repository exists\n');
    process.exit(1);
  }

  // Step 6: Railway deployment instructions
  console.log('\n🚂 Now let\'s deploy to Railway:\n');
  console.log('1. Go to: https://railway.app');
  console.log('2. Click "Start a New Project"');
  console.log('3. Choose "Deploy from GitHub repo"');
  console.log(`4. Select: ${username}/${repoName}`);
  console.log('5. Railway will create TWO services (backend and frontend)\n');

  console.log('📝 Environment Variables for Backend:');
  console.log('Click on the Backend service and add these variables:');
  console.log('PORT=5001');
  console.log('MONGODB_URI=mongodb+srv://tynanwokoloh:Nancynathan2@cluster1.m6ohaq5.mongodb.net/david_workspace?retryWrites=true&w=majority&appName=Cluster1');
  console.log('JWT_SECRET=your-super-secret-jwt-key-change-this-in-production\n');

  console.log('📝 For Frontend Service:');
  console.log('1. Set Root Directory: /frontend');
  console.log('2. Add Build Command: npm run build');
  console.log('3. Add Start Command: npx serve -s build');
  console.log('4. Add environment variable:');
  console.log('   REACT_APP_API_URL=https://YOUR-BACKEND-URL.railway.app/api\n');

  console.log('🔗 After deployment, update your backend CORS in server.js to include:');
  console.log('   https://YOUR-FRONTEND-URL.railway.app\n');

  console.log('✅ GitHub repository: https://github.com/' + username + '/' + repoName);
  console.log('🎉 Ready for Railway deployment!');
  
  readline.close();
};

// Run the script
runDeployment().catch(console.error);