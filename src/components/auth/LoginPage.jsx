import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

/**
 * =========================================================
 * LoginPage — 登录 / 注册页面（Supabase Auth）
 * =========================================================
 *
 * 支持两种模式：
 * 1. 登录（Sign In）— 邮箱 + 密码
 * 2. 注册（Sign Up）— 邮箱 + 密码
 *
 * 注册成功后如果 Supabase 开启了邮箱确认，
 * 页面会提示用户去邮箱验证，并在验证后自动登录。
 *
 * Supabase Auth 的错误信息已包含中文翻译，
 * 例如：Invalid login credentials → 邮箱或密码错误
 */

export default function LoginPage() {
  // ── 模式切换: 'signin' | 'signup'
  const [mode, setMode] = useState('signin');

  // ── 表单字段 ──
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── UI 状态 ──
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false); // 注册成功提示

  // ── Store actions ──
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);

  // ── 提交表单 ──
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);
      setRegistered(false);

      // 邮箱校验
      if (!email.trim()) {
        setError('请输入邮箱地址');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError('邮箱格式不正确');
        return;
      }

      // 密码校验
      if (!password) {
        setError('请输入密码');
        return;
      }
      if (password.length < 6) {
        setError('密码长度不少于 6 位');
        return;
      }

      // 注册模式：确认密码
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('两次输入的密码不一致');
          return;
        }
      }

      setIsLoading(true);
      try {
        if (mode === 'signin') {
          // ── 登录 ──
          await signIn(email.trim(), password);
          // 登录成功后 AuthGuard 自动切换回主应用
        } else {
          // ── 注册 ──
          await signUp(email.trim(), password);
          // 如果关闭了邮箱确认，自动跳转主应用
          // 如果开启了邮箱确认，显示提示
          setRegistered(true);
        }
      } catch (err) {
        // 处理 Supabase Auth 错误信息
        const msg = err?.message || '';
        // 常见错误的中文映射
        const errorMap = {
          'Invalid login credentials': '邮箱或密码错误',
          'Email not confirmed': '邮箱尚未验证，请先查收验证邮件',
          'User already registered': '该邮箱已注册，请直接登录',
          'Password should be at least 6 characters': '密码长度不少于 6 位',
          'rate_limit': '操作过于频繁，请稍后再试',
        };
        const mapped =
          Object.entries(errorMap).find(([key]) =>
            msg.toLowerCase().includes(key.toLowerCase())
          )?.[1] || msg || '操作失败，请稍后重试';
        setError(mapped);
      } finally {
        setIsLoading(false);
      }
    },
    [mode, email, password, confirmPassword, signIn, signUp]
  );

  // ── 切换模式 ──
  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    setError(null);
    setRegistered(false);
  }, []);

  // ── 注册成功提示 ──
  if (registered) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <div className="card p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              注册成功！
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              我们已经向 <strong className="text-gray-700">{email}</strong> 发送了一封验证邮件。
              <br />
              请查收邮件并点击验证链接完成注册。
            </p>
            <button
              onClick={() => switchMode('signin')}
              className="text-sm text-brand-500 hover:text-brand-600 font-medium"
            >
              返回登录
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

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

        {/* ── 登录/注册卡片 ── */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 模式切换：登录 / 注册 */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <LogIn size={13} />
                登录
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <UserPlus size={13} />
                注册
              </button>
            </div>

            {/* 邮箱 */}
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
                  placeholder={mode === 'signup' ? '至少 6 位密码' : '请输入密码'}
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

            {/* 确认密码（仅注册模式） */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  确认密码
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 rounded-xl border border-gray-200
                               placeholder:text-gray-300
                               focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                               transition-all"
                  />
                </div>
              </div>
            )}

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
                  {mode === 'signin' ? '登录中…' : '注册中…'}
                </>
              ) : (
                <>
                  {mode === 'signin' ? (
                    <LogIn size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  {mode === 'signin' ? '登录' : '注册'}
                </>
              )}
            </button>
          </form>

          {/* 底部提示 */}
          <p className="mt-4 text-xs text-center text-gray-400">
            {mode === 'signin' ? (
              <>
                还没有账号？{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-brand-500 hover:text-brand-600 font-medium"
                >
                  立即注册
                </button>
              </>
            ) : (
              <>
                已有账号？{' '}
                <button
                  onClick={() => switchMode('signin')}
                  className="text-brand-500 hover:text-brand-600 font-medium"
                >
                  返回登录
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
