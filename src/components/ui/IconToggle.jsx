import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

/**
 * 状态切换图标组件
 * 点击在 ✅ 已完成 和 ⏳ 未完成 之间切换，伴随微交互动画
 */
export default function IconToggle({ status, onToggle, size = 24 }) {
  const isCompleted = status === 'completed';

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="relative flex items-center justify-center cursor-pointer"
      whileTap={{ scale: 0.85 }}
      aria-label={isCompleted ? '标记为未完成' : '标记为已完成'}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isCompleted ? 1 : 0.8,
          rotate: isCompleted ? 0 : -10,
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        {isCompleted ? (
          <CheckCircle2
            size={size}
            className="text-emerald-500 drop-shadow-sm"
          />
        ) : (
          <Circle size={size} className="text-gray-300 hover:text-gray-400" />
        )}
      </motion.div>
    </motion.button>
  );
}
