import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const apiServerPath = path.join(rootDir, 'scripts', 'dev-api-server.mjs');

const env = {
  ...process.env,
  FORCE_COLOR: '1',
};

const apiServer = spawn(process.execPath, [apiServerPath], {
  cwd: rootDir,
  env,
  stdio: 'inherit',
});

const frontend = spawn(process.execPath, [viteBin, '--host', 'localhost', '--port', '5174', '--strictPort'], {
  cwd: rootDir,
  env,
  stdio: 'inherit',
});

const shutdown = () => {
  apiServer.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

apiServer.on('exit', (code) => {
  if (code && code !== 0) {
    frontend.kill('SIGTERM');
    process.exitCode = code;
  }
});

frontend.on('exit', (code) => {
  if (code && code !== 0) {
    apiServer.kill('SIGTERM');
    process.exitCode = code;
  }
});