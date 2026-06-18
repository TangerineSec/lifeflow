import { ShieldCheck } from 'lucide-react';

/**
 * =========================================================
 * VerifiedBadge — 已认证标识组件
 * =========================================================
 *
 * 当用户完善了 full_name、phone、email 三项核心资料后，
 * 在头像/昵称旁显示绿色盾牌认证标记。
 *
 * Props:
 *   isVerified  {boolean}  是否已通过认证
 *   size        {'sm'|'md'} 尺寸（默认 'sm'）
 *   showLabel   {boolean}  是否显示"已认证"文字（默认 true）
 */

const sizeMap = {
  sm: { icon: 12, text: 'text-[10px]', gap: 'gap-1', px: 'px-1.5', py: 'py-0.5' },
  md: { icon: 14, text: 'text-xs',     gap: 'gap-1.5', px: 'px-2',   py: 'py-1' },
};

export default function VerifiedBadge({ isVerified, size = 'sm', showLabel = true }) {
  if (!isVerified) return null;

  const s = sizeMap[size] || sizeMap.sm;

  return (
    <span
      className={`inline-flex items-center ${s.gap} ${s.px} ${s.py} rounded-full
                   bg-emerald-50 border border-emerald-200
                   text-emerald-600 font-medium ${s.text}
                   select-none`}
      title="已通过身份认证"
    >
      <ShieldCheck size={s.icon} className="text-emerald-500" />
      {showLabel && <span>已认证</span>}
    </span>
  );
}
