import { useState, useEffect, useCallback } from 'react';
import { User, Save, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import VerifiedBadge from '../ui/VerifiedBadge';
import ChangePasswordForm from './ChangePasswordForm';
import useAuthStore from '../../store/useAuthStore';

/**
 * =========================================================
 * ProfileModal — 个人资料编辑弹窗
 * =========================================================
 *
 * 功能：
 *   1. 从 profiles 表加载当前用户的个人资料
 *   2. 编辑 full_name、phone、email
 *   3. 保存时触发器自动计算 is_verified_profile
 *   4. 保存后刷新 store 中的 profile 数据
 */

export default function ProfileModal({ open, onClose }) {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState(null);    // 从数据库加载的资料
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);     // { type: 'success'|'error', text }

  // 加载资料
  useEffect(() => {
    if (!open || !user?.id) return;

    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, email, is_verified_profile')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[Profile] 加载失败:', error);
        return;
      }

      const p = data || {};
      setProfile(p);
      setFullName(p.full_name || '');
      setPhone(p.phone || '');
      setEmail(p.email || '');
      setIsVerified(!!p.is_verified_profile);
      setMessage(null);
    })();
  }, [open, user?.id]);

  // 保存资料
  const handleSave = useCallback(async () => {
    if (!user?.id) return;
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);

      if (error) throw error;

      // 更新成功后，重新读取以获取 is_verified_profile（触发器计算结果）
      const { data: fresh } = await supabase
        .from('profiles')
        .select('full_name, phone, email, is_verified_profile')
        .eq('id', user.id)
        .single();

      if (fresh) {
        setProfile(fresh);
        setIsVerified(!!fresh.is_verified_profile);
      }

      setMessage({ type: 'success', text: '资料已更新' });

      // 2 秒后自动关闭
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || '保存失败，请稍后重试' });
    } finally {
      setSaving(false);
    }
  }, [user?.id, fullName, phone, email, onClose]);

  // 字段变更 → 实时预览认证状态
  const willBeVerified =
    fullName.trim() !== '' &&
    phone.trim() !== '' &&
    email.trim() !== '';

  return (
    <Modal open={open} onClose={onClose} title="个人资料" width="max-w-md">
      <div className="space-y-5">
        {/* 当前认证状态 */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {user?.email?.split('@')[0] || '用户'}
              </span>
              <VerifiedBadge isVerified={isVerified} size="sm" />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {isVerified
                ? '已完善全部身份信息'
                : '完善姓名、手机号、邮箱后自动认证'}
            </p>
          </div>
        </div>

        {/* 表单 */}
        <div className="space-y-3">
          {/* 姓名 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              姓名 <span className="text-red-300">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="请输入真实姓名"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 rounded-xl border border-gray-200
                         placeholder:text-gray-300
                         focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                         transition-all"
            />
          </div>

          {/* 手机号 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              手机号 <span className="text-red-300">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 rounded-xl border border-gray-200
                         placeholder:text-gray-300
                         focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                         transition-all"
            />
          </div>

          {/* 邮箱 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              联系邮箱 <span className="text-red-300">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入联系邮箱"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 rounded-xl border border-gray-200
                         placeholder:text-gray-300
                         focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                         transition-all"
            />
          </div>
        </div>

        {/* 认证预览提示 */}
        {!isVerified && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
              willBeVerified
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-gray-50 text-gray-400 border border-gray-100'
            }`}
          >
            {willBeVerified ? (
              <>
                <CheckCircle size={14} className="flex-shrink-0" />
                <span>三项资料已齐全，保存后自动获得认证</span>
              </>
            ) : (
              <>
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>请填写全部三项资料以完成认证</span>
              </>
            )}
          </div>
        )}

        {/* 消息提示 */}
        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-red-50 text-red-600 border border-red-100'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle size={14} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={14} className="flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold
                     bg-brand-500 text-white rounded-xl
                     hover:bg-brand-600 active:bg-brand-700
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-sm shadow-brand-200
                     transition-all duration-150"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              保存中…
            </>
          ) : (
            <>
              <Save size={16} />
              保存资料
            </>
          )}
        </button>

        {/* ── 分割线 ── */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px bg-gray-100" />
          <KeyRound size={14} className="text-gray-300" />
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* ── 修改密码 ── */}
        <ChangePasswordForm />
      </div>
    </Modal>
  );
}
