#!/usr/bin/env node
// Read-only preflight: changed site files must match a known release or be absent if new.
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const https = require('node:https');

const baseRevision = '77de857655de787620bae0601050504467274785';
const priorRevision = '223b79e1c4afc071b38778e2cca63ec1c162e409';
const git = (...args) => execFileSync('git', args, { stdio: ['ignore', 'pipe', 'ignore'] });
const lines = (buffer) => buffer.toString('utf8').split('\0').filter(Boolean);
const files = lines(git('diff', '--name-only', '-z', baseRevision, 'HEAD', '--', 'study')).sort();
const digest = (buffer) => createHash('sha256').update(buffer).digest('hex');
const revisionFile = (revision, path) => {
  try { return git('show', `${revision}:${path}`); } catch { return null; }
};

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
    const known = [baseRevision, priorRevision, 'HEAD']
      .map((revision) => revisionFile(revision, path));
    const live = await fetchLive(path);
    if (live === null ? known.every((value) => value !== null)
      : !known.some((value) => value !== null && digest(value) === digest(live))) {
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
