#!/usr/bin/env node
// Read-only preflight: every changed site file must still match the release base.
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const https = require('node:https');

const git = (...args) => execFileSync('git', args, { stdio: ['ignore', 'pipe', 'ignore'] });
const lines = (buffer) => buffer.toString('utf8').split('\0').filter(Boolean);
const changed = lines(git('diff', '--name-only', '-z', 'HEAD', '--', 'study'));
const added = lines(git('ls-files', '--others', '--exclude-standard', '-z', '--', 'study'));
const files = [...new Set([...changed, ...added])].sort();
const digest = (buffer) => createHash('sha256').update(buffer).digest('hex');

function fetchLive(path) {
  return new Promise((resolve, reject) => {
    const url = `https://oge-na-5.ru/${path.split('/').map(encodeURIComponent).join('/')}`;
    const request = https.get(url, { timeout: 20000 }, (response) => {
      if (response.statusCode === 404) {
        response.resume();
        resolve(null);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`${path}: HTTP ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
    request.on('timeout', () => request.destroy(new Error(`${path}: timeout`)));
    request.on('error', reject);
  });
}

(async () => {
  const conflicts = [];
  for (const path of files) {
    let old = null;
    try { old = git('show', `HEAD:${path}`); } catch { /* New file. */ }
    const live = await fetchLive(path);
    if (old === null ? live !== null : live === null || digest(old) !== digest(live)) {
      conflicts.push(path);
      process.stdout.write(`CONFLICT ${path}\n`);
    }
  }
  process.stdout.write(`Checked ${files.length} site files; conflicts: ${conflicts.length}.\n`);
  if (conflicts.length) process.exitCode = 1;
})().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
