import { create } from 'zustand';
import { supabase, getSession, onAuthStateChange } from '../lib/supabase';

/**
 * =========================================================
 * useAuthStore — 身份认证状态管理（Supabase Auth）
 * =========================================================
 *
 * 管理用户登录状态、Token、用户信息，并提供登录/登出操作。
 *
 * 扩展：数据同步状态
 *   - syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
 *   - 由 sync.js 在推送前后更新
 *
 * Supabase Auth 特性：
 * - Session 自动持久化到 localStorage（无需手动管理 Token）
 * - Token 到期自动刷新（onAuthStateChange 事件驱动）
 * - 初始化时调用 getSession() 恢复登录态
 */

const useAuthStore = create((set, get) => ({
  // ===== 状态 =====

  /** 当前用户对象（null = 未登录） */
  user: null,

  /** Supabase Session（包含 access_token、refresh_token 等） */
  session: null,

  /** 是否已通过身份验证 */
  isAuthenticated: false,

  /** 是否正在初始化（应用启动时加载 session） */
  isInitializing: true,

  /** 数据同步状态 */
  syncStatus: 'idle', // 'idle' | 'syncing' | 'synced' | 'error'

  /** 最近一次同步成功的时间戳 */
  lastSyncedAt: null,

  // ===== Action: 初始化 =====

  /**
   * 应用启动时调用：恢复 Supabase 持久化的 session
   */
  initialize: async () => {
    try {
      const {
        data: { session },
      } = await getSession();

      if (session) {
        set({
          session,
          user: session.user,
          isAuthenticated: true,
          isInitializing: false,
        });
      } else {
        set({
          session: null,
          user: null,
          isAuthenticated: false,
          isInitializing: false,
        });
      }
    } catch (err) {
      console.error('[Auth] 初始化 session 失败:', err);
      set({
        isInitializing: false,
        isAuthenticated: false,
        user: null,
        session: null,
      });
    }

    // 注册认证状态监听器
    onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        set({ session, user: session?.user ?? null, isAuthenticated: !!session });
      } else if (event === 'SIGNED_OUT') {
        set({ session: null, user: null, isAuthenticated: false, syncStatus: 'idle', lastSyncedAt: null });
      }
    });
  },

  // ===== Action: 同步状态 =====

  /** 设置数据同步状态 */
  setSyncStatus: (status) => set({ syncStatus: status }),

  /** 设置同步完成时间 */
  setLastSyncedAt: (time) => set({ lastSyncedAt: time }),

  // ===== Action: 注册 =====

  /**
   * 使用邮箱注册新用户
   * Supabase 默认会发送确认邮件（可在控制台关闭邮箱确认）
   *
   * @param {string} email 邮箱地址
   * @param {string} password 密码
   * @param {Object} [options] 可选参数
   * @param {Object} [options.data] 用户元数据（如 nickname, avatar_url）
   * @returns {Promise<Object>} { user, session }
   */
  signUp: async (email, password, options = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options.data || {},
      },
    });

    if (error) throw error;

    // 如果关闭了邮箱确认，data.session 会直接返回 session
    if (data.session) {
      set({
        session: data.session,
        user: data.user,
        isAuthenticated: true,
      });
    }

    return data;
  },

  // ===== Action: 登录 =====

  /**
   * 使用邮箱 + 密码登录
   * @param {string} email 邮箱地址
   * @param {string} password 密码
   * @returns {Promise<Object>} { user, session }
   */
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    set({
      session: data.session,
      user: data.user,
      isAuthenticated: true,
    });

    return data;
  },

  // ===== Action: 登出 =====

  /**
   * 登出：调用 Supabase Auth 登出接口
   * 清除 localStorage 中的 session
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] 登出失败:', error);
    }

    // 状态由 onAuthStateChange('SIGNED_OUT') 自动更新
    // 但为了保险，手动清理一次
    set({
      session: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
