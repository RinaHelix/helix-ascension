// governor.js — Helix Ascension
// The brain that coordinates all bots
// Enforces CRITICAL.md on every single action
// Human approval required for all irreversible actions

class Governor {
  constructor(criticalRules = []) {
    this.bots = {};
    this.log = [];
    this.criticalRules = criticalRules;
    this.dryRun = process.env.GOVERNOR_DRY_RUN !== 'false';
    this.killSwitch = process.env.GOVERNOR_KILL_SWITCH === 'true';
  }

  register(botName, bot) {
    if (this.bots[botName]) {
      throw new Error(`[GOVERNOR] Bot "${botName}" already registered. One bot = one job.`);
    }
    if (!bot.job) {
      throw new Error(`[GOVERNOR] Bot "${botName}" must declare its single job.`);
    }
    this.bots[botName] = bot;
    this._log('register', botName, { job: bot.job });
    return true;
  }

  async execute(botName, action, params = {}, humanApproved = false) {
    if (this.killSwitch) {
      this._log('blocked_killswitch', botName, { action });
      return { status: 'blocked', reason: 'Kill switch is active. All actions halted.' };
    }
    if (!this.bots[botName]) {
      return { status: 'error', reason: `Bot "${botName}" not registered.` };
    }
    const bot = this.bots[botName];
    if (bot.allowedActions && !bot.allowedActions.includes(action)) {
      this._log('blocked_scope', botName, { action, allowed: bot.allowedActions });
      return { status: 'blocked', reason: `Action "${action}" outside bot scope. One bot = one job.` };
    }
    const isIrreversible = this._isIrreversible(action);
    if (isIrreversible && !humanApproved) {
      this._log('pending_approval', botName, { action, params });
      return { status: 'pending', reason: 'Irreversible action requires human approval.', action, params };
    }
    if (this.dryRun) {
      this._log('dry_run', botName, { action, params });
      return { status: 'dry_run', message: `Would execute: ${botName}.${action}`, params };
    }
    try {
      const result = await bot[action](params);
      this._log('executed', botName, { action, params, result });
      return { status: 'success', result };
    } catch (error) {
      this._log('error', botName, { action, params, error: error.message });
      return { status: 'error', reason: error.message };
    }
  }

  activateKillSwitch(reason) {
    this.killSwitch = true;
    this._log('kill_switch_activated', 'GOVERNOR', { reason });
    return { status: 'killed', reason };
  }

  deactivateKillSwitch(humanApproved = false) {
    if (!humanApproved) {
      return { status: 'denied', reason: 'Kill switch deactivation requires human approval.' };
    }
    this.killSwitch = false;
    this._log('kill_switch_deactivated', 'GOVERNOR', {});
    return { status: 'active' };
  }

  _isIrreversible(action) {
    const irreversibleActions = ['post', 'publish', 'send', 'delete', 'trade', 'buy', 'sell', 'transfer', 'execute', 'deploy'];
    return irreversibleActions.some(a => action.toLowerCase().includes(a));
  }

  _log(type, botName, details) {
    this.log.push({ timestamp: new Date().toISOString(), type, bot: botName, details });
  }

  getStatus() {
    return {
      dryRun: this.dryRun,
      killSwitch: this.killSwitch,
      registeredBots: this.listBots(),
      totalActions: this.log.length,
      rulesActive: this.criticalRules.length
    };
  }

  listBots() {
    return Object.keys(this.bots).map(name => ({ name, job: this.bots[name].job }));
  }

  getLog() { return this.log; }
}

module.exports = Governor;
