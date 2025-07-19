const fs = require('fs');
const path = require('path');

// Create directories
const dirs = ['config', 'models'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    console.log(`Created ${dir} directory`);
  }
});