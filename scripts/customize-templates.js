/**
 * customize-templates.js
 *
 * Takes a breeder config and generates customized versions of all
 * email and SMS templates, replacing SunScale Geckos placeholder
 * branding with the breeder's actual branding.
 *
 * Usage:
 *   node scripts/customize-templates.js --breeder sunscale-geckos
 *   node scripts/customize-templates.js --config path/to/breeder.json
 */
const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const BREEDERS_DIR = path.join(__dirname, '..', 'data', 'breeders');

// Replacements: [search, replaceKey in breeder config]
const TEXT_REPLACEMENTS = [
  // Business name
  ['SunScale Geckos', 'businessName'],
  ['SunScale', 'businessName'],
  // Owner name
  ['Sarah Mitchell', 'ownerName'],
  ['Sarah @ SunScale', '{{ownerFirstName}} @ {{businessName}}'],
  ['— Sarah', '— {{ownerFirstName}}'],
  ['Sarah', 'ownerFirstName'],
  // Location
  ['Raleigh, NC', 'location'],
  // Species (only in body text, not in dropdown options)
  ['leopard geckos', '{{speciesPlural}}'],
  ['leopard gecko', '{{speciesSingular}}'],
  ['a gecko', 'an animal'],
  ['geckos', '{{speciesPlural}}'],
  ['gecko', '{{speciesSingular}}'],
  ['Geckos', '{{speciesPluralCap}}'],
  ['Gecko', '{{speciesSingularCap}}'],
];

const COLOR_REPLACEMENTS = [
  ['#1B5E20', 'primaryColor'],   // header green
  ['#E65100', 'accentColor'],    // CTA orange
  ['#A5D6A7', 'primaryLight'],   // light green text
];

function customizeTemplate(content, breeder) {
  let result = content;

  // Replace text placeholders
  for (const [search, key] of TEXT_REPLACEMENTS) {
    let replacement;
    if (key.startsWith('{{') && key.endsWith('}}')) {
      // It's a composite placeholder — resolve it
      replacement = key
        .replace('{{ownerFirstName}}', breeder.ownerFirstName || breeder.ownerName?.split(' ')[0] || '')
        .replace('{{businessName}}', breeder.businessName || '')
        .replace('{{speciesPlural}}', _pluralize(breeder.species?.[0] || 'animal'))
        .replace('{{speciesSingular}}', breeder.species?.[0] || 'animal')
        .replace('{{speciesPluralCap}}', _capitalize(_pluralize(breeder.species?.[0] || 'Animal')))
        .replace('{{speciesSingularCap}}', _capitalize(breeder.species?.[0] || 'Animal'));
    } else {
      replacement = breeder[key] || search; // keep original if no replacement
    }
    result = result.split(search).join(replacement);
  }

  // Replace colors
  const colors = breeder.brandColors || {};
  for (const [search, key] of COLOR_REPLACEMENTS) {
    const replacement = colors[key === 'primaryColor' ? 'primary' : key === 'accentColor' ? 'accent' : key];
    if (replacement) {
      result = result.split(search).join(replacement);
    }
  }

  // Also inject light version of primary color for header text
  if (colors.primary && !colors.primaryLight) {
    // Generate a lighter version (simple approach: add transparency)
    result = result.split('#A5D6A7').join(_lightenColor(colors.primary));
  }

  return result;
}

function _pluralize(species) {
  if (!species) return 'animals';
  if (species.toLowerCase().endsWith('s')) return species;
  if (species.toLowerCase().includes('gecko')) return species + 's';
  if (species.toLowerCase().includes('python')) return species + 's';
  if (species.toLowerCase().includes('snake')) return species + 's';
  if (species.toLowerCase().includes('dragon')) return species + 's';
  return species + 's';
}

function _capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function _lightenColor(hex) {
  // Simple lightening: blend with white at 60%
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lr = Math.round(r + (255 - r) * 0.6);
    const lg = Math.round(g + (255 - g) * 0.6);
    const lb = Math.round(b + (255 - b) * 0.6);
    return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
  } catch {
    return '#A5D6A7'; // fallback
  }
}

function customizeAllTemplates(breeder) {
  const outputDir = path.join(BREEDERS_DIR, breeder.clientId, 'templates');
  const emailOutDir = path.join(outputDir, 'emails');
  const smsOutDir = path.join(outputDir, 'sms');

  fs.mkdirSync(emailOutDir, { recursive: true });
  fs.mkdirSync(smsOutDir, { recursive: true });

  const results = { emails: [], sms: [] };

  // Process email templates
  const emailDir = path.join(TEMPLATES_DIR, 'emails');
  if (fs.existsSync(emailDir)) {
    for (const file of fs.readdirSync(emailDir)) {
      if (!file.endsWith('.html')) continue;
      const content = fs.readFileSync(path.join(emailDir, file), 'utf8');
      const customized = customizeTemplate(content, breeder);
      fs.writeFileSync(path.join(emailOutDir, file), customized);
      results.emails.push(file);
    }
  }

  // Process SMS templates
  const smsDir = path.join(TEMPLATES_DIR, 'sms');
  if (fs.existsSync(smsDir)) {
    for (const file of fs.readdirSync(smsDir)) {
      if (!file.endsWith('.txt')) continue;
      const content = fs.readFileSync(path.join(smsDir, file), 'utf8');
      const customized = customizeTemplate(content, breeder);
      fs.writeFileSync(path.join(smsOutDir, file), customized);
      results.sms.push(file);
    }
  }

  return results;
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  let breeder;

  const breederFlag = args.indexOf('--breeder');
  const configFlag = args.indexOf('--config');

  if (breederFlag !== -1) {
    const clientId = args[breederFlag + 1];
    const configPath = path.join(BREEDERS_DIR, clientId, 'client.json');
    if (!fs.existsSync(configPath)) {
      console.error(`Breeder config not found: ${configPath}`);
      process.exit(1);
    }
    breeder = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else if (configFlag !== -1) {
    breeder = JSON.parse(fs.readFileSync(args[configFlag + 1], 'utf8'));
  } else {
    console.error('Usage: node scripts/customize-templates.js --breeder <clientId>');
    console.error('       node scripts/customize-templates.js --config <path/to/breeder.json>');
    process.exit(1);
  }

  console.log(`\nCustomizing templates for: ${breeder.businessName || breeder.clientId}`);
  const results = customizeAllTemplates(breeder);
  console.log(`  ✅ Emails: ${results.emails.join(', ')}`);
  console.log(`  ✅ SMS: ${results.sms.join(', ')}`);
  console.log(`\nOutput: data/breeders/${breeder.clientId}/templates/\n`);
}

module.exports = { customizeTemplate, customizeAllTemplates };
