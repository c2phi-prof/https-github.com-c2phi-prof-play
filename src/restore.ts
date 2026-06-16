import fs from 'fs';

try {
  const code = fs.readFileSync('dist/assets/index-CR6NI13G.js', 'utf-8');
  console.log("Last 500 chars:");
  console.log(code.substring(code.length - 500));
} catch (e: any) {
  console.error(e);
}
