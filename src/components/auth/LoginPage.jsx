import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

/**
 * =========================================================
 * LoginPage — 登录页面
 * =========================================================
 *
 * 提供基于邮箱或用户名的密码登录表单。
 * 由于 @authing/react-ui-components 与 React 19 不兼容，
 * 此组件使用 authing-js-sdk 直接调用登录 API，
 * 并自建与 LifeFlow 设计语言一致的 Tailwind CSS 表单。
 *
 * 支持两种登录方式（通过 toggle 切换）：
 * 1. 邮箱 + 密码  (loginByEmail)
 * 2. 用户名 + 密码 (loginByUsername)
 *
 * 错误处理：
 * - 显示 Authing 返回的中文错误信息（如"用户不存在"、"密码错误"）
 * - 网络错误提示连接失败
 * - 登录中状态禁用提交按钮
 */

export default function LoginPage() {
  // ── 登录方式切换 ──
  const [loginMode, setLoginMode] = useState('email'); // 'email' | 'username'

  // ── 表单字段 ──
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ── UI 状态 ──
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── Store actions ──
  const loginWithEmail = useAuthStore((s) => s.loginWithEmail);
  const loginWithUsername = useAuthStore((s) => s.loginWithUsername);

  // ── 登录提交 ──
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);

      // 基本表单校验
      if (loginMode === 'email') {
        if (!email.trim()) {
          setError('请输入邮箱地址');
          return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
          setError('邮箱格式不正确');
          return;
        }
      } else {
        if (!username.trim()) {
          setError('请输入用户名');
          return;
        }
      }

      if (!password) {
        setError('请输入密码');
        return;
      }

      setIsLoading(true);
      try {
        if (loginMode === 'email') {
          await loginWithEmail(email.trim(), password);
        } else {
          await loginWithUsername(username.trim(), password);
        }
        // 登录成功后，AuthGuard 自动切换回主应用
      } catch (err) {
        // 提取 Authing 的错误信息
        const message =
          err?.message || err?.data?.message || '登录失败，请检查账号密码';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [loginMode, email, username, password, loginWithEmail, loginWithUsername]
  );

  // ── 切换登录方式 ──
  const toggleMode = useCallback(() => {
    setLoginMode((prev) => (prev === 'email' ? 'username' : 'email'));
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* ── Logo + 标题 ── */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-200">
            <svg
              width="28"
              height="28"
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            LifeFlow
          </h1>
          <p className="text-sm text-gray-400 mt-1">长事件进度追踪系统</p>
        </div>

        {/* ── 登录卡片 ── */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 登录方式切换 */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('email');
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  loginMode === 'email'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Mail size={13} />
                邮箱登录
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('username');
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  loginMode === 'username'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <User size={13} />
                用户名登录
              </button>
            </div>

            {/* 输入框：邮箱 / 用户名 */}
            {loginMode === 'email' ? (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  邮箱地址
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 rounded-xl border border-gray-200
                               placeholder:text-gray-300
                               focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                               transition-all"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  用户名
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 rounded-xl border border-gray-200
                               placeholder:text-gray-300
                               focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                               transition-all"
                  />
                </div>
              </div>
            )}

            {/* 密码 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                密码
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 rounded-xl border border-gray-200
                             placeholder:text-gray-300
                             focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                             transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* 错误信息 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl"
              >
                <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-red-600">{error}</span>
              </motion.div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold
                         bg-brand-500 text-white rounded-xl
                         hover:bg-brand-600 active:bg-brand-700
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-sm shadow-brand-200
                         transition-all duration-150"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  登录中…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  登录
                </>
              )}
            </button>
          </form>

          {/* 底部提示 */}
          <p className="mt-4 text-xs text-center text-gray-400">
            由 Authing 身份认证服务提供支持
          </p>
        </div>
      </motion.div>
    </div>
  );
}
