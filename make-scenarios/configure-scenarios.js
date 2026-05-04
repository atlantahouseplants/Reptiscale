/**
 * configure-scenarios.js
 *
 * Reads Make.com blueprint templates and substitutes breeder-specific
 * variables to produce ready-to-import JSON files.
 *
 * Usage:
 *   node make-scenarios/configure-scenarios.js --breeder sunscale-geckos --url https://your-app.vercel.app
 */
const fs = require('fs');
const path = require('path');

const SCENARIOS_DIR = __dirname;
const BREEDERS_DIR = path.join(__dirname, '..', 'data', 'breeders');

const BLUEPRINT_FILES = [
  'daily-weather-check.json',
  'daily-content-run.json',
];

function configureScenarios(clientId, webhookBaseUrl) {
  const breederDir = path.join(BREEDERS_DIR, clientId);
  const clientConfigPath = path.join(breederDir, 'client.json');
  const ghlConfigPath = path.join(breederDir, 'ghl-config.json');

  if (!fs.existsSync(clientConfigPath)) {
    console.error(`Breeder not found: ${clientId}`);
    console.error(`Expected: ${clientConfigPath}`);
    process.exit(1);
  }

  const clientConfig = JSON.parse(fs.readFileSync(clientConfigPath, 'utf8'));
  const ghlConfig = fs.existsSync(ghlConfigPath)
    ? JSON.parse(fs.readFileSync(ghlConfigPath, 'utf8'))
    : {};

  const outputDir = path.join(breederDir, 'make-scenarios');
  fs.mkdirSync(outputDir, { recursive: true });

  const replacements = {
    '{{WEBHOOK_BASE_URL}}': webhookBaseUrl,
    '{{CLIENT_ID}}': clientId,
    '{{LOCATION_ID}}': ghlConfig.locationId || '',
    '{{GHL_API_KEY}}': ghlConfig.token || '',
    '{{BUSINESS_NAME}}': clientConfig.businessName || '',
  };

  console.log(`\nConfiguring Make.com scenarios for: ${clientConfig.businessName || clientId}`);
  console.log(`Webhook URL: ${webhookBaseUrl}\n`);

  for (const file of BLUEPRINT_FILES) {
    const templatePath = path.join(SCENARIOS_DIR, file);
    if (!fs.existsSync(templatePath)) {
      console.warn(`  ⚠️  Template not found: ${file}`);
      continue;
    }

    let content = fs.readFileSync(templatePath, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
      content = content.split(search).join(replace);
    }

    const outputPath = path.join(outputDir, file);
    fs.writeFileSync(outputPath, content);
    console.log(`  ✅ ${file} → data/breeders/${clientId}/make-scenarios/${file}`);
  }

  console.log(`\nDone! Import these files into Make.com.\n`);
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const breederIdx = args.indexOf('--breeder');
  const urlIdx = args.indexOf('--url');

  if (breederIdx === -1 || urlIdx === -1) {
    console.error('Usage: node make-scenarios/configure-scenarios.js --breeder <clientId> --url <webhookBaseUrl>');
    process.exit(1);
  }

  configureScenarios(args[breederIdx + 1], args[urlIdx + 1]);
}

module.exports = { configureScenarios };
