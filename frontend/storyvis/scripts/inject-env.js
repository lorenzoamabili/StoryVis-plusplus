#!/usr/bin/env node
/**
 * Substitutes $API_URL and $DEBUG from environment into env.template.js
 * and writes the result to env.js before the Angular build runs.
 */
const fs = require('fs');
const path = require('path');

const templatePath = path.resolve(__dirname, '../src/assets/env.template.js');
const outputPath   = path.resolve(__dirname, '../src/assets/env.js');

const API_URL = process.env.API_URL;
const DEBUG   = process.env.DEBUG || 'false';

if (!API_URL) {
  console.error('ERROR: API_URL environment variable is required for build.');
  process.exit(1);
}

let template = fs.readFileSync(templatePath, 'utf8');
template = template
  .replace('${API_URL}', API_URL)
  .replace('${DEBUG}',   DEBUG);

fs.writeFileSync(outputPath, template, 'utf8');
console.log(`env.js written — API_URL=${API_URL} DEBUG=${DEBUG}`);
