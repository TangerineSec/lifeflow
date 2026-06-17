import { create } from 'zustand';
import { supabase, getSession, onAuthStateChange } from '../lib/supabase';

/**
 * =========================================================
 * useAuthStore — 身份认证状态管理（Supabase Auth）
 * =========================================================
 *
 * 使用 Supabase Auth 管理用户登录状态。
 *
 * Supabase Auth 特性：
 * - Session 自动持久化到 localStorage（无需手动管理 Token）
 * - Token 到期自动刷新（onAuthStateChange 事件驱动）
 * - 初始化时调用 getSession() 恢复登录态
 *
 * 状态机：
 *   ┌──────────┐  登录/注册    ┌──────────┐
 *   │ 未登录    │ ──────────>  │ 已登录    │
 *   │ (null)   │ <──────────  │ (Session)│
 *   └──────────┘  登出/过期   └──────────┘
 *
 * 初始化流程：
 *   1. App 启动 → AuthGuard 调用 initialize()
 *   2. getSession() 检查 Supabase 持久化的 session
 *   3. 有 session → isAuthenticated = true，恢复 user
 *   4. 无 session → isAuthenticated = false，显示登录页
 *
 * Session 对象结构：
 *   {
 *     access_token, refresh_token,
 *     user: { id, email, user_metadata, app_metadata, ... }
 *   }
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

  // ===== Action: 初始化 =====

  /**
   * 应用启动时调用：恢复 Supabase 持久化的 session
   * Supabase 会自动将 session 写入 localStorage，
   * getSession() 读取已保存的 session 并判断有效性。
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

    // 注册认证状态监听器（处理 Token 刷新、登出等事件）
    onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        set({ session, user: session?.user ?? null, isAuthenticated: !!session });
      } else if (event === 'SIGNED_OUT') {
        set({ session: null, user: null, isAuthenticated: false });
      }
    });
  },

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
