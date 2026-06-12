const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const PID_FILE = path.join(ROOT, '.recordatio.pid');

function logStep(current, total, label) {
  console.log(`[${current}/${total}] ${label}`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function canReachHealth(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.setTimeout(1200, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (_err) {
    return false;
  }
}

function killProcess(pid) {
  try {
    process.kill(pid, 'SIGTERM');
    return;
  } catch (_err) {
    // Fallback for Windows process trees.
  }

  try {
    execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
  } catch (_err) {
    // Ignore if already stopped.
  }
}

async function waitUntilDown(url, attempts, delayMs) {
  for (let i = 0; i < attempts; i += 1) {
    const up = await canReachHealth(url);
    if (!up) {
      return true;
    }
    await wait(delayMs);
  }
  return false;
}

async function main() {
  const totalSteps = 4;

  logStep(1, totalSteps, 'Loading pid file');
  if (!fs.existsSync(PID_FILE)) {
    console.log('No running Recordatio server found (no pid file).');
    process.exit(0);
  }

  let pidData;
  try {
    pidData = JSON.parse(fs.readFileSync(PID_FILE, 'utf8'));
  } catch (_err) {
    fs.unlinkSync(PID_FILE);
    console.log('Invalid pid file removed.');
    process.exit(0);
  }

  const pid = Number(pidData.pid);
  const port = Number(pidData.port || process.env.PORT || 3000);
  const healthUrl = `http://localhost:${port}/api/health`;

  logStep(2, totalSteps, `Stopping process ${pid}`);
  if (Number.isFinite(pid) && isProcessAlive(pid)) {
    killProcess(pid);
  }

  logStep(3, totalSteps, 'Waiting for shutdown');
  await waitUntilDown(healthUrl, 25, 200);

  logStep(4, totalSteps, 'Cleanup');
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }

  console.log('Recordatio stopped.');
}

main().catch((error) => {
  console.error('Failed to stop Recordatio:', error.message);
  process.exit(1);
});
