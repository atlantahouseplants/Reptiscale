#!/usr/bin/env node
const { spawnSync } = require('child_process');

const steps = [
  ['sync:business-profile', ['run', 'sync:business-profile']],
  ['sync:store-settings', ['run', 'sync:store-settings']],
  ['sync:shipping-zone', ['run', 'sync:shipping-zone']],
  ['setup:demo', ['run', 'setup:demo']],
  ['sync:custom-values', ['run', 'sync:custom-values']],
  ['sync:products', ['run', 'sync:products']],
  ['sync:store-catalog', ['run', 'sync:store-catalog']],
  ['sync:trigger-links', ['run', 'sync:trigger-links']],
  ['sync:contact-activity', ['run', 'sync:contact-activity']],
  ['sync:smart-list-tags', ['run', 'sync:smart-list-tags']],
];

for (const [label, args] of steps) {
  console.log('');
  console.log(`== ${label} ==`);
  const result = spawnSync('npm', args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    console.error(`Showroom setup stopped at ${label}.`);
    process.exit(result.status || 1);
  }
}

console.log('');
console.log('SunScale demo showroom API setup complete.');
