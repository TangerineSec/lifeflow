import { useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import LoginPage from './LoginPage';

/**
 * =========================================================
 * AuthGuard — 路由守卫组件
 * =========================================================
 *
 * 在应用启动时检查用户认证状态：
 * - 未登录 → 渲染 LoginPage（登录页面）
 * - 已登录 → 渲染 children（主应用内容）
 * - 初始化中 → 显示加载骨架屏
 *
 * 初始化流程：
 *   1. 挂载后立即调用 useAuthStore.initialize()
 *   2. initialize() 检查 localStorage 中的 token 是否有效
 *   3. 有效 → isAuthenticated = true，显示主应用
 *   4. 无效/无 token → isAuthenticated = false，显示登录页
 *
 * 使用示例：
 *   <AuthGuard>
 *     <Dashboard />
 *   </AuthGuard>
 */

export default function AuthGuard({ children }) {
  const { isInitializing, isAuthenticated, initialize } = useAuthStore();

  // 启动时验证登录态
  useEffect(() => {
    initialize();
  }, []);

  // ── 初始化中：显示加载骨架屏 ──
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {/* Logo 加载动画 */}
          <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg
              width="24"
              height="24"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="8" fill="white" opacity="0.9" />
              <circle cx="16" cy="9" r="4" fill="white" opacity="0.9" />
              <circle cx="10" cy="21" r="3.5" fill="white" opacity="0.7" />
              <circle cx="22" cy="21" r="3.5" fill="white" opacity="0.7" />
              <line
                x1="13"
                y1="12"
                x2="11"
                y2="18"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.6"
              />
              <line
                x1="19"
                y1="12"
                x2="21"
                y2="18"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-32 bg-gray-200 rounded-full mx-auto animate-pulse" />
            <div className="h-2 w-20 bg-gray-100 rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── 未登录：显示登录页 ──
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // ── 已登录：渲染子组件 ──
  return children;
}
