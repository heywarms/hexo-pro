'use strict';

const crypto = require('crypto');

const DEFAULT_MCP_SCOPES = ['read', 'write', 'publish'];

function normalizeScopes(scopes) {
  const input = Array.isArray(scopes) && scopes.length ? scopes : DEFAULT_MCP_SCOPES;
  return Array.from(new Set(input.map(scope => String(scope || '').trim()).filter(Boolean)));
}

function hashMcpToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function generatePlainToken() {
  return `hxp_mcp_${crypto.randomBytes(32).toString('base64url')}`;
}

function createMcpToken(options = {}) {
  const token = options.token || generatePlainToken();
  const now = options.now || new Date();
  return {
    token,
    settings: {
      type: 'mcp',
      enabled: true,
      tokenHash: hashMcpToken(token),
      scopes: normalizeScopes(options.scopes),
      updatedAt: now,
      createdAt: options.createdAt || now
    }
  };
}

function hasScopes(grantedScopes, requiredScopes) {
  const granted = normalizeScopes(grantedScopes);
  if (granted.includes('admin')) return true;
  return normalizeScopes(requiredScopes).every(scope => granted.includes(scope));
}

function verifyMcpToken(settings, token, requiredScopes = []) {
  if (!settings || !settings.enabled) {
    return { ok: false, reason: 'mcp.disabled' };
  }
  if (!settings.tokenHash || !token) {
    return { ok: false, reason: 'mcp.token.missing' };
  }
  if (settings.tokenHash !== hashMcpToken(token)) {
    return { ok: false, reason: 'mcp.token.invalid' };
  }
  if (!hasScopes(settings.scopes, requiredScopes)) {
    return { ok: false, reason: 'mcp.scope.denied' };
  }
  return { ok: true };
}

function maskToken(token) {
  const value = String(token || '');
  if (value.length <= 12) return '******';
  return `${value.slice(0, 7)}...${value.slice(-4)}`;
}

function publicMcpSettings(settings) {
  const safe = settings || {};
  return {
    enabled: Boolean(safe.enabled),
    scopes: normalizeScopes(safe.scopes),
    hasToken: Boolean(safe.tokenHash),
    updatedAt: safe.updatedAt || null,
    createdAt: safe.createdAt || null
  };
}

module.exports = {
  DEFAULT_MCP_SCOPES,
  createMcpToken,
  hashMcpToken,
  hasScopes,
  maskToken,
  normalizeScopes,
  publicMcpSettings,
  verifyMcpToken
};
