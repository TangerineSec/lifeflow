/**
 * =========================================================
 * Supabase 客户端单例
 * =========================================================
 *
 * 使用 @supabase/supabase-js 创建全局唯一的 Supabase 客户端。
 * 环境变量通过 Vite 的 import.meta.env 注入。
 *
 * 配置来源：
 *   VITE_SUPABASE_URL    = 项目 URL
 *   VITE_SUPABASE_ANON_KEY = 匿名公钥（Anon / Public Key）
 *
 * Supabase Auth 自动处理：
 *   - Session 持久化（localStorage）
 *   - Token 自动刷新
 *   - 会话状态变更监听（onAuthStateChange）
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] 缺少配置，请检查 .env.local 中的 ' +
      'VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY'
  );
}

/**
 * Supabase 客户端实例
 * auth.autoRefreshToken 和 auth.persistSession 默认开启
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * 获取当前 Supabase 认证会话
 * @returns {Promise<{ data: { session }, error }>}
 */
export function getSession() {
  return supabase.auth.getSession();
}

/**
 * 监听认证状态变化
 * @param {function} callback - (event, session) => void
 * @returns {function} unsubscribe
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback).data.subscription;
}
