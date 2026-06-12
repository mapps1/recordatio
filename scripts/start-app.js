const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const PID_FILE = path.join(ROOT, '.recordatio.pid');
const PORT = Number(process.env.PORT || 3000);
const HEALTH_URL = `http://localhost:${PORT}/api/health`;

function logStep(current, total, label) {
  console.log(`[${current}/${total}] ${label}`);
}

function canReachHealth(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (_err) {
    return false;
  }
}

async function waitForHealth(url, attempts, delayMs) {
  for (let i = 0; i < attempts; i += 1) {
    const ok = await canReachHealth(url);
    if (ok) {
      return true;
    }
    await wait(delayMs);
  }
  return false;
}

async function main() {
  const totalSteps = 4;

  logStep(1, totalSteps, 'Checking existing server state');
  if (fs.existsSync(PID_FILE)) {
    try {
      const current = JSON.parse(fs.readFileSync(PID_FILE, 'utf8'));
      if (current && current.pid && isProcessAlive(Number(current.pid))) {
        console.log(`Recordatio is already running at http://localhost:${current.port || PORT}`);
        console.log(`PID: ${current.pid}`);
        process.exit(0);
      }
    } catch (_err) {
      // Ignore invalid file and continue.
    }
    fs.unlinkSync(PID_FILE);
  }

  logStep(2, totalSteps, 'Starting Recordatio server');
  const child = spawn(process.execPath, ['-r', 'ts-node/register', 'src/app.ts'], {
    cwd: ROOT,
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      PORT: String(PORT),
    },
  });
  child.unref();

  fs.writeFileSync(
    PID_FILE,
    JSON.stringify({
      pid: child.pid,
      port: PORT,
      startedAt: new Date().toISOString(),
    }, null, 2),
    'utf8'
  );

  logStep(3, totalSteps, 'Waiting for health endpoint');
  const healthy = await waitForHealth(HEALTH_URL, 30, 300);

  logStep(4, totalSteps, healthy ? 'Startup complete' : 'Startup timed out');
  if (!healthy) {
    console.error('Recordatio did not become healthy in time.');
    console.error('Try: npm run app:stop, then npm run app:start');
    process.exit(1);
  }

  console.log('Recordatio is running.');
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Health: ${HEALTH_URL}`);
}

main().catch((error) => {
  console.error('Failed to start Recordatio:', error.message);
  process.exit(1);
});
