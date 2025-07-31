const fs = require('fs');
const path = require('path');

const ignoredDirs = ['node_modules', '.git', 'build', 'dist', '.expo', '.next'];
const validExtensions = ['.js', '.jsx'];

const regexUnsafeText = /\{[^{}]*?&&\s*(['"`][^'"`]+['"`])[^{}]*?\}/g;

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirs.includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (
      entry.isFile() &&
      validExtensions.includes(path.extname(entry.name))
    ) {
      analyzeFile(fullPath);
    }
  }
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const match = regexUnsafeText.exec(line);
    if (match) {
      console.log(`⚠️  Erro potencial em: ${filePath}:${index + 1}`);
      console.log(`    → ${line.trim()}`);
    }
  });
}

console.log('🔍 Escaneando arquivos em busca de usos perigosos de `&& "texto"`...\n');
scanDirectory('./');
console.log('\n✅ Busca concluída.');
