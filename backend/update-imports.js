import fs from 'fs';
import path from 'path';

// Function to update import paths in a file
function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update import/require paths to use .mjs
    const updatedContent = content
      // Update ES module imports
      .replace(/from\s+['"](\..*?)\.js(['"])/g, 'from "$1.mjs$2')
      // Update require() calls
      .replace(/require\(['"](\..*?)\.js['"]\)/g, 'require("$1.mjs")');
    
    // Only write if changes were made
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated imports in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Recursively process all .mjs files in a directory
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.mjs')) {
      updateImportsInFile(fullPath);
    }
  });
}

// Start processing from the current directory
const rootDir = path.dirname(new URL(import.meta.url).pathname);
processDirectory(rootDir);

console.log('Import path updates complete!');
