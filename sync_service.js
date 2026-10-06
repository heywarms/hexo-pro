const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const DEFAULT_BRANCH = 'main';
const DEFAULT_SYNC_IGNORE = [
  'node_modules/',
  'public/',
  '.deploy_git/',
  '.hexopro_sync_git/',
  '.DS_Store',
  '.env',
  '.env.*',
  'deploy_config.json',
  'sync_config.json',
  'data/*.db',
  'data/*.db~',
  'data/*_cache.db',
  '*.log'
];

function normalizeRepository(repository) {
  if (!repository) return '';
  return String(repository)
    .trim()
    .replace(/^https:\/\/github\.com\//, '')
    .replace(/^git@github\.com:/, '')
    .replace(/\.git$/, '')
    .replace(/^\/+|\/+$/g, '');
}

function buildPublicRepoUrl(repository) {
  const normalized = normalizeRepository(repository);
  if (!normalized) return '';
  return `https://github.com/${normalized}.git`;
}

function buildAuthenticatedRepoUrl(repository, accessToken) {
  const normalized = normalizeRepository(repository);
  if (!normalized || !accessToken) return '';
  return `https://x-access-token:${encodeURIComponent(accessToken)}@github.com/${normalized}.git`;
}

function maskSyncConfig(config = {}) {
  return {
    ...config,
    githubToken: config.githubToken ? '******' : '',
    hasGithubToken: Boolean(config.githubToken)
  };
}

function parseGitStatus(output) {
  const files = String(output || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.slice(2).trim())
    .filter(Boolean);

  return {
    dirty: files.length > 0,
    files
  };
}

function createSyncService(baseDir, options = {}) {
  const configPath = options.configPath || path.join(baseDir, 'sync_config.json');

  function readConfig() {
    const defaults = {
      repository: '',
      branch: DEFAULT_BRANCH,
      commitMessage: 'Sync blog: {{ now }}',
      gitUserName: 'Hexo Pro',
      gitUserEmail: 'hexo-pro@users.noreply.github.com',
      githubToken: '',
      lastSyncTime: ''
    };

    if (!fs.existsSync(configPath)) return defaults;

    try {
      const saved = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return {
        ...defaults,
        ...saved,
        githubToken: saved.githubToken || (saved.oauth && saved.oauth.accessToken) || ''
      };
    } catch (error) {
      return defaults;
    }
  }

  function saveConfig(nextConfig) {
    const existing = readConfig();
    const merged = {
      ...existing,
      ...nextConfig,
      repository: normalizeRepository(nextConfig.repository || existing.repository),
      branch: nextConfig.branch || existing.branch || DEFAULT_BRANCH,
      githubToken: nextConfig.githubToken === undefined ? existing.githubToken : nextConfig.githubToken
    };

    if (nextConfig.githubToken === '******') {
      merged.githubToken = existing.githubToken;
    }

    fs.writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf-8');
    return merged;
  }

  return {
    baseDir,
    configPath,
    readConfig,
    saveConfig
  };
}

function processCommitMessage(template) {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return String(template || 'Sync blog: {{ now }}').replace(/\{\{\s*now\s*\}\}/g, formatted);
}

function runCommandDefault(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      ...options,
      shell: false,
      windowsVerbatimArguments: false
    });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        const error = new Error((stderr || stdout || `命令执行失败，退出码: ${code}`).trim());
        error.stdout = stdout;
        error.stderr = stderr;
        error.code = code;
        reject(error);
      }
    });
    proc.on('error', reject);
  });
}

async function writeSyncIgnore(baseDir) {
  const ignorePath = path.join(baseDir, '.gitignore');
  let current = '';
  if (fs.existsSync(ignorePath)) {
    current = fs.readFileSync(ignorePath, 'utf-8');
  }

  const lines = new Set(current.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
  DEFAULT_SYNC_IGNORE.forEach((line) => lines.add(line));
  fs.writeFileSync(ignorePath, `${Array.from(lines).join('\n')}\n`, 'utf-8');
}

async function ensureGitWorkspace({ baseDir, config, runCommand, writeSyncIgnore: writeIgnore, addLog }) {
  const branch = config.branch || DEFAULT_BRANCH;
  const publicUrl = buildPublicRepoUrl(config.repository);

  try {
    await runCommand('git', ['rev-parse', '--is-inside-work-tree'], { cwd: baseDir });
  } catch (error) {
    addLog('sync.git.init');
    await runCommand('git', ['init'], { cwd: baseDir });
  }

  await writeIgnore(baseDir);

  try {
    await runCommand('git', ['remote', 'get-url', 'origin'], { cwd: baseDir });
    await runCommand('git', ['remote', 'set-url', 'origin', publicUrl], { cwd: baseDir });
  } catch (error) {
    await runCommand('git', ['remote', 'add', 'origin', publicUrl], { cwd: baseDir });
  }

  try {
    await runCommand('git', ['checkout', branch], { cwd: baseDir });
  } catch (error) {
    await runCommand('git', ['checkout', '-B', branch], { cwd: baseDir });
  }

  await runCommand('git', ['config', 'user.name', config.gitUserName || 'Hexo Pro'], { cwd: baseDir });
  await runCommand('git', ['config', 'user.email', config.gitUserEmail || 'hexo-pro@users.noreply.github.com'], { cwd: baseDir });
}

async function commitLocalChanges({ baseDir, config, runCommand, addLog }) {
  const status = parseGitStatus(await runCommand('git', ['status', '--porcelain'], { cwd: baseDir }));
  if (!status.dirty) {
    addLog('sync.git.no.local.changes');
    return status;
  }

  await runCommand('git', ['add', '.'], { cwd: baseDir });
  await runCommand('git', ['commit', '-m', processCommitMessage(config.commitMessage)], { cwd: baseDir });
  addLog('sync.git.committed.local.changes');
  return status;
}

async function fetchRemote({ baseDir, config, runCommand }) {
  const branch = config.branch || DEFAULT_BRANCH;
  const authUrl = buildAuthenticatedRepoUrl(config.repository, config.githubToken);
  await runCommand('git', ['fetch', authUrl, `${branch}:refs/remotes/origin/${branch}`], { cwd: baseDir });
}

async function getRemoteAheadCount({ baseDir, config, runCommand }) {
  try {
    const branch = config.branch || DEFAULT_BRANCH;
    const output = await runCommand('git', ['rev-list', '--count', `HEAD..origin/${branch}`], { cwd: baseDir });
    return Number.parseInt(output, 10) || 0;
  } catch (error) {
    return 0;
  }
}

async function runPushWorkflow(options) {
  const {
    baseDir,
    config,
    runCommand = runCommandDefault,
    writeSyncIgnore: writeIgnore = writeSyncIgnore,
    addLog = () => {}
  } = options;
  const branch = config.branch || DEFAULT_BRANCH;
  const authUrl = buildAuthenticatedRepoUrl(config.repository, config.githubToken);

  if (!config.repository) throw new Error('缺少 GitHub 仓库');
  if (!authUrl) throw new Error('请先填写 GitHub Personal Access Token');

  await ensureGitWorkspace({ baseDir, config, runCommand, writeSyncIgnore: writeIgnore, addLog });
  await commitLocalChanges({ baseDir, config, runCommand, addLog });
  await fetchRemote({ baseDir, config, runCommand });

  const ahead = await getRemoteAheadCount({ baseDir, config, runCommand });
  if (ahead > 0) {
    throw new Error('远端分支有更新，请先从 GitHub 同步到本地');
  }

  addLog('sync.git.pushing');
  await runCommand('git', ['push', authUrl, `HEAD:${branch}`], { cwd: baseDir });
  addLog('sync.git.push.success');
}

async function runPullWorkflow(options) {
  const {
    baseDir,
    config,
    runCommand = runCommandDefault,
    writeSyncIgnore: writeIgnore = writeSyncIgnore,
    addLog = () => {}
  } = options;
  const branch = config.branch || DEFAULT_BRANCH;
  const authUrl = buildAuthenticatedRepoUrl(config.repository, config.githubToken);

  if (!config.repository) throw new Error('缺少 GitHub 仓库');
  if (!authUrl) throw new Error('请先填写 GitHub Personal Access Token');

  await ensureGitWorkspace({ baseDir, config, runCommand, writeSyncIgnore: writeIgnore, addLog });
  await commitLocalChanges({ baseDir, config, runCommand, addLog });
  addLog('sync.git.pulling');
  await runCommand('git', ['pull', '--rebase', authUrl, branch], { cwd: baseDir });
  addLog('sync.git.pull.success');
}

async function runBidirectionalWorkflow(options) {
  await runPullWorkflow(options);
  await runPushWorkflow(options);
}

module.exports = {
  DEFAULT_BRANCH,
  DEFAULT_SYNC_IGNORE,
  normalizeRepository,
  buildPublicRepoUrl,
  buildAuthenticatedRepoUrl,
  maskSyncConfig,
  parseGitStatus,
  createSyncService,
  processCommitMessage,
  runCommandDefault,
  writeSyncIgnore,
  runPushWorkflow,
  runPullWorkflow,
  runBidirectionalWorkflow
};
