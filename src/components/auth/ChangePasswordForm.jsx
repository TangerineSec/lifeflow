import { useState, useCallback } from 'react';
import { Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

/**
 * =========================================================
 * ChangePasswordForm — 修改密码表单组件
 * =========================================================
 *
 * 使用 supabase.auth.updateUser() 修改当前登录用户的密码。
 *
 * 密码强度要求：
 *   - 至少 6 位
 *   - 包含大小写字母和数字（前端校验 + Supabase 服务端校验）
 */

export default function ChangePasswordForm() {
  const updatePassword = useAuthStore((s) => s.updatePassword);

  // ── 表单字段 ──
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── UI 状态 ──
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }

  // ── 密码强度校验 ──
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '未设置', color: 'bg-gray-200' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { level: 1, label: '弱', color: 'bg-red-400' };
    if (score <= 4) return { level: 2, label: '中等', color: 'bg-amber-400' };
    return { level: 3, label: '强', color: 'bg-emerald-400' };
  };

  const strength = getStrength(newPassword);

  // ── 完整性校验 ──
  const validate = () => {
    if (!newPassword) return '请输入新密码';
    if (newPassword.length < 6) return '密码长度至少 6 位';
    if (!/[a-z]/.test(newPassword)) return '密码需包含小写字母';
    if (!/[A-Z]/.test(newPassword)) return '密码需包含大写字母';
    if (!/[0-9]/.test(newPassword)) return '密码需包含数字';
    if (newPassword !== confirmPassword) return '两次输入的密码不一致';
    return null;
  };

  // ── 提交 ──
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setMessage(null);

      const errorMsg = validate();
      if (errorMsg) {
        setMessage({ type: 'error', text: errorMsg });
        return;
      }

      setIsLoading(true);
      try {
        await updatePassword(newPassword);
        setMessage({
          type: 'success',
          text: '密码修改成功！下次登录请使用新密码。',
        });
        setNewPassword('');
        setConfirmPassword('');
      } catch (err) {
        const msg = err?.message || '修改失败，请稍后重试';
        const errorMap = {
          'Password should be at least 6 characters': '密码长度至少 6 位',
          'rate_limit': '操作过于频繁，请稍后再试',
          'new password should be different from the old password':
            '新密码不能与旧密码相同',
        };
        const mapped =
          Object.entries(errorMap).find(([key]) =>
            msg.toLowerCase().includes(key.toLowerCase())
          )?.[1] || msg;
        setMessage({ type: 'error', text: mapped });
      } finally {
        setIsLoading(false);
      }
    },
    [newPassword, confirmPassword, updatePassword]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── 标题 ── */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
          <KeyRound size={14} />
        </div>
        <span className="text-sm font-medium text-gray-900">修改密码</span>
      </div>

      {/* ── 新密码 ── */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          新密码 <span className="text-red-300">*</span>
        </label>
        <div className="relative">
          <Lock
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
          />
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="至少 6 位，含大小写字母和数字"
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

        {/* 密码强度指示器 */}
        {newPassword && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                style={{
                  width:
                    strength.level === 1
                      ? '33%'
                      : strength.level === 2
                        ? '66%'
                        : '100%',
                }}
              />
            </div>
            <span
              className={`text-[10px] font-medium ${
                strength.level === 1
                  ? 'text-red-400'
                  : strength.level === 2
                    ? 'text-amber-500'
                    : 'text-emerald-500'
              }`}
            >
              {strength.label}
            </span>
          </div>
        )}
      </div>

      {/* ── 确认新密码 ── */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          确认新密码 <span className="text-red-300">*</span>
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
            placeholder="再次输入新密码"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 rounded-xl border border-gray-200
                       placeholder:text-gray-300
                       focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                       transition-all"
          />
        </div>
        {/* 一致性提示 */}
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
            <AlertCircle size={10} />
            两次输入的密码不一致
          </p>
        )}
      </div>

      {/* ── 消息提示 ── */}
      {message && (
        <div
          className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              : 'bg-red-50 text-red-600 border border-red-100'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* ── 提交按钮 ── */}
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
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            修改中…
          </>
        ) : (
          <>
            <Save size={16} />
            修改密码
          </>
        )}
      </button>
    </form>
  );
}
