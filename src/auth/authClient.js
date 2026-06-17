/**
 * =========================================================
 * Authing 认证客户端单例
 * =========================================================
 *
 * 使用 authing-js-sdk 的 AuthenticationClient 处理身份认证。
 *
 * 设计思路：
 * - 创建全局唯一的 authClient 实例（懒加载）
 * - 所有认证操作（登录、登出、获取用户信息）统一经过此模块
 * - 环境变量通过 import.meta.env 注入，避免硬编码
 *
 * 支持的登录方式（当前阶段）：
 * - loginByEmail(email, password) — 邮箱密码登录
 * - loginByUsername(username, password) — 用户名密码登录
 *
 * ⚠️ 安全说明：
 * 由于前端 SPA 无法安全持有 clientSecret，本 SDK 使用无密钥的 OIDC
 * 授权码流程（PKCE），由 Authing 后端代理完成密码验证。
 * clientSecret 等敏感信息不应出现在前端代码中。
 */

import { AuthenticationClient } from 'authing-js-sdk';

/** @type {AuthenticationClient | null} */
let client = null;

/**
 * 获取 authClient 单例
 * 懒加载：首次调用时从环境变量读取配置并初始化
 */
export function getAuthClient() {
  if (client) return client;

  const appId = import.meta.env.VITE_AUTHING_APP_ID;
  const appHost = import.meta.env.VITE_AUTHING_APP_HOST;

  if (!appId || !appHost) {
    console.error(
      '[Auth] 缺少 Authing 配置，请检查 .env.local 文件中的 ' +
        'VITE_AUTHING_APP_ID 和 VITE_AUTHING_APP_HOST'
    );
    return null;
  }

  client = new AuthenticationClient({
    appId,
    appHost,
  });

  return client;
}

/**
 * 销毁客户端实例（通常在登出时调用）
 */
export function destroyAuthClient() {
  client = null;
}

/**
 * 使用邮箱 + 密码登录
 * @param {string} email 邮箱地址
 * @param {string} password 密码
 * @returns {Promise<import('authing-js-sdk').User>}
 */
export async function loginByEmail(email, password) {
  const authClient = getAuthClient();
  if (!authClient) throw new Error('Authing 客户端未初始化');

  // loginByEmail 返回 User 对象，包含 token、photo、nickname 等字段
  const user = await authClient.loginByEmail(email, password);
  return user;
}

/**
 * 使用用户名 + 密码登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<import('authing-js-sdk').User>}
 */
export async function loginByUsername(username, password) {
  const authClient = getAuthClient();
  if (!authClient) throw new Error('Authing 客户端未初始化');

  const user = await authClient.loginByUsername(username, password);
  return user;
}

/**
 * 登出
 */
export async function logout() {
  const authClient = getAuthClient();
  if (authClient) {
    try {
      await authClient.logout();
    } catch (e) {
      console.warn('[Auth] logout warning:', e);
    }
  }
  destroyAuthClient();
}

/**
 * 检查当前 Token 是否有效
 * @param {string} token - 用户的登录凭证
 * @returns {Promise<boolean>}
 */
export async function checkTokenStatus(token) {
  if (!token) return false;
  const authClient = getAuthClient();
  if (!authClient) return false;
  try {
    const status = await authClient.checkLoginStatus(token);
    return status.code === 200;
  } catch {
    return false;
  }
}

/**
 * 获取当前登录用户信息
 * @param {string} token - 用户的登录凭证
 * @returns {Promise<Object|null>}
 */
export async function fetchCurrentUser(token) {
  if (!token) return null;
  const authClient = getAuthClient();
  if (!authClient) return null;
  try {
    // 先设置 token，再获取用户信息
    authClient.setToken(token);
    const user = await authClient.getCurrentUser();
    return user;
  } catch {
    return null;
  }
}
