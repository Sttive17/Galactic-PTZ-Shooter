import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { attachErrorTracker } from './helpers/app.mjs';
import { assertNoRuntimeErrors } from './helpers/assertions.mjs';

function parseArgs(argv) {
  const flags = {
    tier: 'all',
    grep: null,
    headed: false,
    build: false,
    port: null,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--headed') {
      flags.headed = true;
    } else if (arg === '--build') {
      flags.build = true;
    } else if (arg === '--tier' && i + 1 < argv.length) {
      flags.tier = argv[++i].toLowerCase();
    } else if (arg.startsWith('--tier=')) {
      flags.tier = arg.slice('--tier='.length).toLowerCase();
    } else if (arg === '--grep' && i + 1 < argv.length) {
      flags.grep = argv[++i];
    } else if (arg.startsWith('--grep=')) {
      flags.grep = arg.slice('--grep='.length);
    } else if (arg === '--port' && i + 1 < argv.length) {
      flags.port = Number(argv[++i]);
    } else if (arg.startsWith('--port=')) {
      flags.port = Number(arg.slice('--port='.length));
    }
  }
  return flags;
}

function detectBrowserExecutable() {
  if (process.env.E2E_BROWSER_PATH && fs.existsSync(process.env.E2E_BROWSER_PATH)) {
    return process.env.E2E_BROWSER_PATH;
  }

  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/microsoft-edge',
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `No compatible Chrome/Edge browser binary found. Set E2E_BROWSER_PATH. Checked: ${candidates.join(', ')}`
  );
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 4173;
      server.close((err) => (err ? reject(err) : resolve(port)));
    });
  });
}

function ensureBuilt(forceBuild) {
  const distIndex = path.resolve('dist', 'index.html');
  if (!forceBuild && fs.existsSync(distIndex)) {
    return;
  }
  console.log('[e2e] Building production bundle (npm run build)...');
  const res = spawnSync('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (res.status !== 0) {
    throw new Error(`npm run build failed with exit code ${res.status}`);
  }
}

async function waitForServerReady(url, proc, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (proc.exitCode !== null) {
      throw new Error(`Vite preview exited prematurely with code ${proc.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.status === 200) return;
    } catch {
      // Server still starting
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`Timed out waiting for ${url} HTTP 200 after ${timeoutMs}ms`);
}

function killProcessTree(proc) {
  if (!proc || proc.killed || proc.exitCode !== null) return;
  try {
    proc.kill('SIGTERM');
  } catch {
    // Ignore
  }
  if (process.platform === 'win32' && proc.pid) {
    try {
      spawnSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
    } catch {
      // Ignore
    }
  }
}

async function loadTierSuites(tier) {
  const suites = [];
  if (tier === 'smoke') {
    const mod = await import('./tiers/smoke.mjs');
    suites.push({ name: 'smoke', tests: mod.tests });
    return suites;
  }
  if (tier === '1' || tier === 'all') {
    const mod = await import('./tiers/tier1-features.mjs');
    suites.push({ name: 'tier1-features', tests: mod.tests });
  }
  if (tier === '2' || tier === 'all') {
    const mod = await import('./tiers/tier2-boundaries.mjs');
    suites.push({ name: 'tier2-boundaries', tests: mod.tests });
  }
  if (tier === '3' || tier === 'all') {
    const mod = await import('./tiers/tier3-pairwise.mjs');
    suites.push({ name: 'tier3-pairwise', tests: mod.tests });
  }
  if (tier === '4' || tier === 'all') {
    const mod = await import('./tiers/tier4-scenarios.mjs');
    suites.push({ name: 'tier4-scenarios', tests: mod.tests });
  }
  if (suites.length === 0) {
    throw new Error(`Unknown --tier "${tier}". Expected smoke, 1, 2, 3, 4, or all.`);
  }
  return suites;
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  ensureBuilt(flags.build);

  const executablePath = detectBrowserExecutable();
  const port = flags.port || (await findFreePort());
  const baseUrl = `http://127.0.0.1:${port}/`;
  const viteBin = path.resolve('node_modules', 'vite', 'bin', 'vite.js');

  console.log(`[e2e] Browser: ${executablePath}`);
  console.log(`[e2e] Starting vite preview at ${baseUrl}`);

  let viteLogs = '';
  let shuttingDown = false;

  const startVitePreview = async () => {
    const proc = spawn(
      process.execPath,
      [viteBin, 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
      {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
      }
    );
    proc.stdout?.on('data', (chunk) => {
      viteLogs += chunk.toString();
    });
    proc.stderr?.on('data', (chunk) => {
      viteLogs += chunk.toString();
    });
    proc.on('exit', (code, signal) => {
      if (!shuttingDown) {
        console.error(`[e2e] vite preview exited unexpectedly (code=${code}, signal=${signal}).`);
      }
    });
    await waitForServerReady(baseUrl, proc, 15000);
    return proc;
  };

  let viteProc = await startVitePreview();

  let browser = null;
  const cleanup = async () => {
    shuttingDown = true;
    if (browser) {
      await browser.close().catch(() => {});
      browser = null;
    }
    killProcessTree(viteProc);
  };

  const handleSignal = async (sig) => {
    console.error(`\n[e2e] Received ${sig}, shutting down...`);
    await cleanup();
    process.exit(1);
  };

  process.once('SIGINT', () => void handleSignal('SIGINT'));
  process.once('SIGTERM', () => void handleSignal('SIGTERM'));

  try {
    const launchArgs =
      process.env.E2E_GPU === '1'
        ? ['--enable-webgl', '--ignore-gpu-blocklist']
        : [
            '--enable-webgl',
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
            '--ignore-gpu-blocklist',
          ];

    browser = await chromium.launch({
      executablePath,
      headless: !flags.headed,
      ignoreDefaultArgs: ['--mute-audio'],
      args: launchArgs,
    });

    const suites = await loadTierSuites(flags.tier);
    const grepRegex = flags.grep ? new RegExp(flags.grep, 'i') : null;

    let passed = 0;
    let failed = 0;
    const failures = [];
    const totalStart = Date.now();

    for (const suite of suites) {
      const selected = grepRegex
        ? suite.tests.filter((t) => grepRegex.test(`${suite.name} ${t.name}`))
        : suite.tests;

      if (selected.length === 0) continue;
      console.log(`\n=== Suite: ${suite.name} (${selected.length} tests) ===`);

      for (const testCase of selected) {
        if (viteProc.exitCode !== null) {
          console.log('[e2e] Restarting vite preview server...');
          viteProc = await startVitePreview();
        }
        const testStart = Date.now();
        const context = await browser.newContext({
          viewport: { width: 1280, height: 720 },
        });
        const page = await context.newPage();
        const tracker = attachErrorTracker(page);

        try {
          await testCase.run({ page, context, baseUrl, tracker });
          assertNoRuntimeErrors(tracker);
          const ms = Date.now() - testStart;
          passed += 1;
          console.log(`  PASS  ${testCase.name} (${ms}ms)`);
        } catch (err) {
          const ms = Date.now() - testStart;
          failed += 1;
          const message = err?.stack || err?.message || String(err);
          failures.push({ suite: suite.name, name: testCase.name, message });
          console.error(`  FAIL  ${testCase.name} (${ms}ms)\n        ${err?.message || err}`);
        } finally {
          await context.close().catch(() => {});
        }
      }
    }

    const totalSec = ((Date.now() - totalStart) / 1000).toFixed(2);
    console.log(`\n[e2e] Summary: ${passed} passed, ${failed} failed in ${totalSec}s`);

    if (failures.length > 0) {
      console.error('\n[e2e] Failure Details:');
      for (const f of failures) {
        console.error(`- [${f.suite}] ${f.name}\n  ${f.message.split('\n').slice(0, 4).join('\n  ')}`);
      }
      process.exitCode = 1;
    } else if (passed === 0) {
      console.error('[e2e] No tests matched filter.');
      process.exitCode = 1;
    } else {
      process.exitCode = 0;
    }
  } catch (err) {
    console.error('[e2e] Runner error:', err);
    if (viteLogs) {
      console.error('[e2e] Vite preview output:\n', viteLogs);
    }
    process.exitCode = 1;
  } finally {
    await cleanup();
  }
}

await main();
