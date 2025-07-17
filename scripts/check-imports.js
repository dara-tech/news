const fs = require("fs");
const path = require("path");

// Function to find files with incorrect Html imports
function findIncorrectImports(dir) {
  const results = [];

  function searchDirectory(currentDir) {
    const files = fs.readdirSync(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.startsWith(".") && file !== "node_modules") {
        searchDirectory(filePath);
      } else if (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".ts") || file.endsWith(".tsx")) {
        try {
          const content = fs.readFileSync(filePath, "utf8");

          // Check for incorrect imports
          if (content.includes("import") && content.includes("next/document")) {
            const lines = content.split("\n");
            lines.forEach((line, index) => {
              if (line.includes("Html") && line.includes("next/document") && !filePath.includes("_document")) {
                results.push({
                  file: filePath,
                  line: index + 1,
                  content: line.trim(),
                });
              }
            });
          }
        } catch (error) {
          console.log(`Could not read file: ${filePath}`);
        }
      }
    }
  }

  searchDirectory(dir);
  return results;
}

// Check frontend directory
const frontendDir = "./frontend";
if (fs.existsSync(frontendDir)) {
  console.log("🔍 Searching for incorrect Html imports...");
  const incorrectImports = findIncorrectImports(frontendDir);

  if (incorrectImports.length > 0) {
    console.log("❌ Found incorrect imports:");
    incorrectImports.forEach((item) => {
      console.log(`File: ${item.file}`);
      console.log(`Line ${item.line}: ${item.content}`);
      console.log("---");
    });
  } else {
    console.log("✅ No incorrect Html imports found");
  }
} else {
  console.log("Frontend directory not found");
}
