import { create } from 'zustand';
import {
  loginByEmail,
  loginByUsername,
  logout,
  fetchCurrentUser,
  checkTokenStatus,
} from '../auth/authClient';

/**
 * =========================================================
 * useAuthStore — 身份认证状态管理
 * =========================================================
 *
 * 管理用户登录状态、Token、用户信息，并提供登录/登出操作。
 *
 * Token 持久化策略：
 * - 使用 localStorage 存储 token，即使刷新页面也能保持登录态
 * - 应用启动时从 localStorage 恢复 token 并验证有效性
 * - 登出时清除 localStorage
 *
 * 状态机：
 *   ┌──────────┐  登录成功   ┌──────────┐
 *   │ 未登录    │ ─────────> │ 已登录    │
 *   │ (null)   │ <───────── │ (User)   │
 *   └──────────┘  登出/过期  └──────────┘
 *
 * 初始化流程：
 *   1. App 启动 → AuthGuard 检查 store.isAuthenticated
 *   2. 如果 localStorage 有 token → 调用 initialize() 验证
 *   3. 验证通过 → 标记已登录，显示主应用
 *   4. 验证失败/无 token → 显示登录页
 */

// localStorage 的键名
const TOKEN_KEY = 'lifeflow-auth-token';
const USER_KEY = 'lifeflow-auth-user';

/**
 * 从 localStorage 恢复已保存的 token
 */
function loadToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * 从 localStorage 恢复已保存的用户信息
 */
function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * 保存 token 到 localStorage
 */
function saveToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // localStorage 不可用时静默失败
  }
}

/**
 * 保存用户信息到 localStorage
 */
function saveUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // localStorage 不可用时静默失败
  }
}

const useAuthStore = create((set, get) => ({
  // ===== 状态 =====

  /** 当前用户信息（null = 未登录） */
  user: loadUser(),

  /** 登录凭证 Token */
  token: loadToken(),

  /** 是否已通过身份验证（初始化后变为 true） */
  isAuthenticated: !!loadToken(),

  /** 是否正在验证 Token（应用启动时的初始化状态） */
  isInitializing: true,

  // ===== Action: 初始化 =====

  /**
   * 应用启动时调用：检查本地 Token 是否仍然有效
   * - 有 Token → 验证有效 → 保持已登录状态
   * - 有 Token → 验证过期 → 清除登录状态
   * - 无 Token → 标记为未登录
   */
  initialize: async () => {
    const token = get().token;
    if (!token) {
      set({ isInitializing: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      // 尝试验证 token 并获取用户信息
      const isValid = await checkTokenStatus(token);
      if (isValid) {
        // Token 有效，确保用户信息完整
        let user = get().user;
        if (!user) {
          user = await fetchCurrentUser(token);
          if (user) {
            saveUser(user);
          }
        }
        set({
          isInitializing: false,
          isAuthenticated: true,
          user,
          token,
        });
      } else {
        // Token 过期或被撤销
        saveToken(null);
        saveUser(null);
        set({
          isInitializing: false,
          isAuthenticated: false,
          user: null,
          token: null,
        });
      }
    } catch {
      // 网络错误等情况——保留已有 token，但标记初始化完成
      // 用户仍可看到主应用，后续操作可能因 401 失败
      set({
        isInitializing: false,
        isAuthenticated: true,
      });
    }
  },

  // ===== Action: 登录 =====

  /**
   * 使用邮箱登录
   * @param {string} email 邮箱
   * @param {string} password 密码
   * @returns {Promise<Object>} 用户信息
   */
  loginWithEmail: async (email, password) => {
    // 调用 Authing SDK 登录
    const user = await loginByEmail(email, password);

    // 从 User 对象中提取 token 字段
    // Authing SDK loginByEmail 返回的 User 对象包含:
    //   { token, id, photo, nickname, username, email, ... }
    const token = user.token || user.accessToken;

    if (!token) {
      throw new Error('登录成功但未获取到 Token，请联系管理员');
    }

    // 持久化
    saveToken(token);
    saveUser(user);

    set({
      user,
      token,
      isAuthenticated: true,
    });

    return user;
  },

  /**
   * 使用用户名登录
   * @param {string} username 用户名
   * @param {string} password 密码
   * @returns {Promise<Object>} 用户信息
   */
  loginWithUsername: async (username, password) => {
    const user = await loginByUsername(username, password);

    const token = user.token || user.accessToken;
    if (!token) {
      throw new Error('登录成功但未获取到 Token，请联系管理员');
    }

    saveToken(token);
    saveUser(user);

    set({
      user,
      token,
      isAuthenticated: true,
    });

    return user;
  },

  // ===== Action: 登出 =====

  /**
   * 登出：调用 Authing 登出接口 + 清除本地状态
   */
  logout: async () => {
    try {
      await logout();
    } catch {
      // 即使远端登出失败，也要清除本地状态
    }

    saveToken(null);
    saveUser(null);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
