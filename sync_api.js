const {
  createSyncService,
  maskSyncConfig,
  parseGitStatus,
  runBidirectionalWorkflow,
  runCommandDefault,
  runPullWorkflow,
  runPushWorkflow
} = require('./sync_service');

module.exports = function (app, hexo, use) {
  const service = createSyncService(hexo.base_dir);
  let status = {
    isSyncing: false,
    stage: 'idle',
    logs: [],
    error: null,
    lastSyncTime: ''
  };

  function addLog(message) {
    const text = String(message || '');
    console.log(`[Hexo Pro Sync]: ${text}`);
    status.logs = [...(status.logs || []), text].slice(-200);
  }

  function setStatus(update) {
    status = {
      ...status,
      ...update
    };
  }

  function sendError(res, error) {
    console.error('[Hexo Pro Sync]:', error);
    setStatus({
      isSyncing: false,
      stage: 'failed',
      error: error.message
    });
    res.send(500, error.message || '同步失败');
  }

  function getConfig() {
    return service.readConfig();
  }

  async function runWorkflow(res, stage, workflow) {
    if (status.isSyncing) {
      return res.send(400, '云同步正在进行中，请稍后再试');
    }

    setStatus({
      isSyncing: true,
      stage,
      error: null,
      logs: []
    });

    try {
      const config = getConfig();
      await workflow({
        baseDir: hexo.base_dir,
        config,
        runCommand: runCommandDefault,
        addLog
      });

      const now = new Date().toISOString();
      service.saveConfig({ ...config, lastSyncTime: now });
      setStatus({
        isSyncing: false,
        stage: 'completed',
        lastSyncTime: now
      });
      res.done({
        success: true,
        status
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  use('sync/config', function (req, res) {
    res.done(maskSyncConfig(getConfig()));
  });

  use('sync/save-config', function (req, res, next) {
    if (req.method !== 'POST') return next();

    try {
      const saved = service.saveConfig(req.body || {});
      res.done(maskSyncConfig(saved));
    } catch (error) {
      sendError(res, error);
    }
  });

  use('sync/status', async function (req, res) {
    const config = getConfig();
    let gitStatus = { dirty: false, files: [] };

    try {
      const output = await runCommandDefault('git', ['status', '--porcelain'], { cwd: hexo.base_dir });
      gitStatus = parseGitStatus(output);
    } catch (error) {
      gitStatus = { dirty: false, files: [], unavailable: true };
    }

    res.done({
      ...status,
      lastSyncTime: config.lastSyncTime || status.lastSyncTime,
      hasRepository: Boolean(config.repository),
      hasGithubToken: Boolean(config.githubToken),
      gitStatus
    });
  });

  use('sync/token/clear', function (req, res, next) {
    if (req.method !== 'POST') return next();

    try {
      const saved = service.saveConfig({
        githubToken: ''
      });
      res.done(maskSyncConfig(saved));
    } catch (error) {
      sendError(res, error);
    }
  });

  use('sync/push', function (req, res, next) {
    if (req.method !== 'POST') return next();
    return runWorkflow(res, 'pushing', runPushWorkflow);
  });

  use('sync/pull', function (req, res, next) {
    if (req.method !== 'POST') return next();
    return runWorkflow(res, 'pulling', runPullWorkflow);
  });

  use('sync/run', function (req, res, next) {
    if (req.method !== 'POST') return next();
    return runWorkflow(res, 'syncing', runBidirectionalWorkflow);
  });
};
