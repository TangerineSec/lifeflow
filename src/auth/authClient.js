/**
 * Authing 认证客户端已废弃。
 *
 * 身份认证已迁移至 Supabase Auth。
 * 请使用 src/lib/supabase.js 中的 supabase 客户端进行认证操作。
 *
 * 迁移说明：
 *   - 登录:  supabase.auth.signInWithPassword({ email, password })
 *   - 注册:  supabase.auth.signUp({ email, password })
 *   - 登出:  supabase.auth.signOut()
 *   - Session:  supabase.auth.getSession()
 *   - 监听:  supabase.auth.onAuthStateChange(callback)
 *
 * @deprecated 此文件将在后续清理中移除
 */
export {};
